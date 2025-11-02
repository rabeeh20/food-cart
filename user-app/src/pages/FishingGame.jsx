import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fishAPI } from '../utils/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { ShoppingCart, ArrowLeft, X } from 'lucide-react';
import './FishingGame.css';

const FishingGame = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const gameAreaRef = useRef(null);

  const [availableFish, setAvailableFish] = useState([]);
  const [preparationStyles, setPreparationStyles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gameEnabled, setGameEnabled] = useState(false);

  // Hook state - position in percentage
  const [hookPosition, setHookPosition] = useState({ x: 50, y: 10 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Game state
  const [caughtFish, setCaughtFish] = useState(null);
  const [showPreparation, setShowPreparation] = useState(false);
  const [selectedPreparation, setSelectedPreparation] = useState(null);
  const [fishWeight, setFishWeight] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Swimming fish - each fish swims at different depths
  const [swimmingFish, setSwimmingFish] = useState([]);

  useEffect(() => {
    fetchGameData();
  }, []);

  useEffect(() => {
    // Initialize swimming fish positions with depth layers and natural behavior
    if (availableFish.length > 0) {
      const positions = availableFish.map((fish, index) => {
        const depthLayer = (index % 3) + 1; // Distribute across 3 depth layers
        const depthConfig = {
          1: { scale: 1.4, speed: 1.0, zIndex: 15 }, // Foreground - larger, faster
          2: { scale: 1.0, speed: 0.6, zIndex: 10 }, // Midground - normal
          3: { scale: 0.6, speed: 0.3, zIndex: 5 }   // Background - smaller, slower (parallax)
        };

        const baseY = 30 + (index * 12) % 50;

        return {
          id: fish._id,
          fishData: fish,
          x: Math.random() * 80,
          y: baseY,
          baseY: baseY, // Store original Y for sinusoidal movement
          depth: depthLayer,
          scale: depthConfig[depthLayer].scale,
          speed: (0.2 + Math.random() * 0.4) * depthConfig[depthLayer].speed,
          direction: Math.random() > 0.5 ? 1 : -1,
          phaseOffset: Math.random() * Math.PI * 2, // Random phase for natural variety
          burstCooldown: 0 // For burst swimming
        };
      });
      setSwimmingFish(positions);
    }
  }, [availableFish]);

  useEffect(() => {
    // Animate swimming fish with natural sinusoidal movement
    const startTime = Date.now();

    const swimInterval = setInterval(() => {
      const currentTime = (Date.now() - startTime) / 1000; // Time in seconds

      setSwimmingFish(prev => prev.map(fish => {
        // Horizontal movement
        let currentSpeed = fish.speed;

        // Occasional burst swimming (5% chance)
        let newBurstCooldown = fish.burstCooldown > 0 ? fish.burstCooldown - 1 : 0;
        if (newBurstCooldown === 0 && Math.random() < 0.02) {
          currentSpeed = fish.speed * 2.5;
          newBurstCooldown = 40; // Cooldown frames
        }

        let newX = fish.x + (currentSpeed * fish.direction);
        let newDirection = fish.direction;

        // Wrap around continuously (loop from edge to edge)
        if (fish.direction > 0 && newX > 100) {
          // Swimming right, wrap to left
          newX = -10;
        } else if (fish.direction < 0 && newX < -10) {
          // Swimming left, wrap to right
          newX = 100;
        }

        // Natural sinusoidal vertical movement (wave-like swimming)
        const verticalAmplitude = 3; // pixels of vertical movement
        const verticalFrequency = 1.5; // cycles per second
        const verticalOffset = Math.sin(
          (currentTime * verticalFrequency + fish.phaseOffset) * Math.PI
        ) * verticalAmplitude;

        const newY = fish.baseY + verticalOffset;

        return {
          ...fish,
          x: newX,
          y: newY,
          direction: newDirection,
          burstCooldown: newBurstCooldown
        };
      }));
    }, 50); // 20 FPS for smooth animation

    return () => clearInterval(swimInterval);
  }, []);

  useEffect(() => {
    // Generate bubble particles
    if (!gameAreaRef.current || caughtFish) return;

    const generateBubble = () => {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';

      const size = 8 + Math.random() * 15; // 8-23px
      bubble.style.width = size + 'px';
      bubble.style.height = size + 'px';
      bubble.style.left = Math.random() * 100 + '%';
      bubble.style.bottom = '0px';

      const driftX = (Math.random() - 0.5) * 40;
      const driftXEnd = (Math.random() - 0.5) * 30;
      bubble.style.setProperty('--bubble-drift-x', driftX + 'px');
      bubble.style.setProperty('--bubble-drift-x-end', driftXEnd + 'px');

      const duration = 4 + Math.random() * 3; // 4-7s
      bubble.style.animation = `bubbleRise ${duration}s linear, bubbleWobble 2s ease-in-out infinite`;

      gameAreaRef.current.querySelector('.ocean-container').appendChild(bubble);

      setTimeout(() => bubble.remove(), duration * 1000);
    };

    const bubbleInterval = setInterval(generateBubble, 400);

    // Generate initial bubbles
    for (let i = 0; i < 15; i++) {
      setTimeout(generateBubble, i * 200);
    }

    return () => clearInterval(bubbleInterval);
  }, [caughtFish]);

  useEffect(() => {
    // Generate ambient floating particles
    if (!gameAreaRef.current || caughtFish) return;

    const generateParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'ambient-particle';

      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = 20 + Math.random() * 60 + '%';

      const driftX = (Math.random() - 0.5) * 100;
      const driftY = -300 - Math.random() * 200;
      particle.style.setProperty('--particle-drift-x', driftX + 'px');
      particle.style.setProperty('--particle-drift-y', driftY + 'px');

      const duration = 6 + Math.random() * 4; // 6-10s
      particle.style.animation = `floatParticle ${duration}s linear`;

      gameAreaRef.current.querySelector('.ocean-container').appendChild(particle);

      setTimeout(() => particle.remove(), duration * 1000);
    };

    const particleInterval = setInterval(generateParticle, 800);

    // Generate initial particles
    for (let i = 0; i < 20; i++) {
      setTimeout(generateParticle, i * 300);
    }

    return () => clearInterval(particleInterval);
  }, [caughtFish]);

  const fetchGameData = async () => {
    try {
      const [fishRes, prepRes] = await Promise.all([
        fishAPI.getAvailable(),
        fishAPI.getPreparationStyles()
      ]);

      if (!fishRes.data.gameEnabled) {
        setGameEnabled(false);
        setLoading(false);
        toast.error('Fishing game is currently unavailable');
        return;
      }

      if (fishRes.data.fish.length === 0) {
        toast.error('No fish available today. Please check back later!');
        setGameEnabled(false);
        setLoading(false);
        return;
      }

      setAvailableFish(fishRes.data.fish);
      setPreparationStyles(prepRes.data.preparationStyles);
      setGameEnabled(true);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching game data:', error);
      toast.error('Failed to load fishing game');
      setLoading(false);
      setGameEnabled(false);
    }
  };

  // Mouse/Touch handlers for dragging hook
  const handleHookMouseDown = (e) => {
    if (caughtFish) return; // Can't drag if already caught
    setIsDragging(true);

    const rect = gameAreaRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    setDragStart({
      x: clientX - rect.left,
      y: clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || caughtFish) return;

    const rect = gameAreaRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    // Constrain hook within game area
    const constrainedX = Math.max(5, Math.min(95, x));
    const constrainedY = Math.max(10, Math.min(95, y));

    setHookPosition({ x: constrainedX, y: constrainedY });

    // Check collision with fish
    checkFishCollision(constrainedX, constrainedY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const checkFishCollision = (hookX, hookY) => {
    // Check if hook overlaps with any fish
    swimmingFish.forEach(fish => {
      const fishCenterX = fish.x + 5; // Fish width is ~10%
      const fishCenterY = fish.y + 5; // Fish height is ~10%

      const distance = Math.sqrt(
        Math.pow(hookX - fishCenterX, 2) + Math.pow(hookY - fishCenterY, 2)
      );

      // Collision detected (within 8% distance)
      if (distance < 8 && !caughtFish) {
        catchFish(fish.fishData);
      }
    });
  };

  const catchFish = (fish) => {
    // Generate random weight
    const minWeight = fish.minWeight || 1.0;
    const maxWeight = fish.maxWeight || 5.0;
    const weight = (Math.random() * (maxWeight - minWeight) + minWeight).toFixed(1);

    setCaughtFish(fish);
    setFishWeight(parseFloat(weight));
    setIsDragging(false);

    toast.success(`You caught a ${fish.name}!`);

    // GAME FEEL: Screen shake effect
    if (gameAreaRef.current) {
      gameAreaRef.current.classList.add('shake');
      setTimeout(() => {
        gameAreaRef.current.classList.remove('shake');
      }, 500);
    }

    // GAME FEEL: Splash particles
    createSplashEffect(hookPosition.x, hookPosition.y);

    // GAME FEEL: Sparkles for rare/expensive fish (>₹400/kg)
    if (fish.pricePerKg > 400) {
      createSparkleEffect(hookPosition.x, hookPosition.y);
    }

    // Show preparation selection after a short delay
    setTimeout(() => {
      setShowPreparation(true);
    }, 1000);
  };

  // Create splash particle effect
  const createSplashEffect = (x, y) => {
    if (!gameAreaRef.current) return;
    const container = gameAreaRef.current.querySelector('.ocean-container');

    // Create 12 splash particles in radial pattern
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div');
      particle.className = 'splash-particle';

      const angle = (Math.PI * 2 * i) / 12;
      const velocity = 60 + Math.random() * 40;

      particle.style.left = `${x}%`;
      particle.style.top = `${y}%`;
      particle.style.setProperty('--vel-x', `${Math.cos(angle) * velocity}px`);
      particle.style.setProperty('--vel-y', `${Math.sin(angle) * velocity}px`);

      container.appendChild(particle);

      setTimeout(() => particle.remove(), 800);
    }
  };

  // Create sparkle effect for rare fish
  const createSparkleEffect = (x, y) => {
    if (!gameAreaRef.current) return;
    const container = gameAreaRef.current.querySelector('.ocean-container');

    // Create 8 sparkles
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';

        const offsetX = (Math.random() - 0.5) * 10;
        const offsetY = (Math.random() - 0.5) * 10;
        const driftX = (Math.random() - 0.5) * 40;

        sparkle.style.left = `calc(${x}% + ${offsetX}px)`;
        sparkle.style.top = `calc(${y}% + ${offsetY}px)`;
        sparkle.style.setProperty('--drift-x', `${driftX}px`);

        container.appendChild(sparkle);

        setTimeout(() => sparkle.remove(), 1800);
      }, i * 150);
    }
  };

  const handlePreparationSelect = (prep) => {
    setSelectedPreparation(prep);
  };

  const addFishToCart = () => {
    if (!selectedPreparation) {
      toast.error('Please select a preparation style!');
      return;
    }

    const variant = {
      preparation: selectedPreparation.name,
      preparationPrice: selectedPreparation.price,
      weight: fishWeight,
      pricePerKg: caughtFish.pricePerKg
    };

    addToCart(caughtFish, variant);
    setShowSuccessModal(true);
    toast.success(`${caughtFish.name} added to cart!`);
  };

  const resetGame = () => {
    setCaughtFish(null);
    setShowPreparation(false);
    setSelectedPreparation(null);
    setFishWeight(0);
    setShowSuccessModal(false);
    setHookPosition({ x: 50, y: 10 });
  };

  const viewCart = () => {
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="fishing-game-container">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading fishing game...</p>
        </div>
      </div>
    );
  }

  if (!gameEnabled || availableFish.length === 0) {
    return (
      <div className="fishing-game-container">
        <div className="game-unavailable">
          <h2>Fishing Game Unavailable</h2>
          <p>Sorry, the fishing game is currently not available. Please check back later!</p>
          <button className="back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fishing-game-container">
      <div className="game-header">
        <button className="back-btn-small" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          Back
        </button>
        <div>
          <h1>🎣 Catch Fresh Fish!</h1>
          <p>Drag the hook to catch your favorite fish</p>
        </div>
        <button className="cart-btn-small" onClick={() => navigate('/cart')}>
          <ShoppingCart size={20} />
        </button>
      </div>

      <div
        ref={gameAreaRef}
        className="game-area"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        {/* Ocean Background */}
        <div className="ocean-container">
          {/* Professional Water Effects Layers */}
          <div className="god-rays"></div>
          <div className="caustics-enhanced"></div>
          <div className="depth-fog"></div>

          {/* Kelp/Seaweed */}
          <div className="kelp" style={{ left: '15%', height: '180px', animationDelay: '0s' }}></div>
          <div className="kelp" style={{ left: '35%', height: '150px', animationDelay: '0.5s' }}></div>
          <div className="kelp" style={{ left: '60%', height: '200px', animationDelay: '1s' }}></div>
          <div className="kelp" style={{ left: '80%', height: '165px', animationDelay: '1.5s' }}></div>
          <div className="kelp" style={{ left: '92%', height: '140px', animationDelay: '2s' }}></div>

          {/* Background Fish Schools */}
          <div className="background-school" style={{
            top: '55%',
            width: '35px',
            height: '18px',
            animationDuration: '22s',
            animationDelay: '0s'
          }}></div>
          <div className="background-school" style={{
            top: '72%',
            width: '28px',
            height: '14px',
            animationDuration: '28s',
            animationDelay: '5s'
          }}></div>

          <div className="ocean-surface"></div>
          <div className="ocean-waves"></div>

          {/* Fishing Hook */}
          {!caughtFish && (
            <>
              <div
                className="fishing-line"
                style={{
                  left: `${hookPosition.x}%`,
                  height: `${hookPosition.y}%`
                }}
              />
              <div
                className={`fishing-hook ${isDragging ? 'dragging' : ''}`}
                style={{
                  left: `${hookPosition.x}%`,
                  top: `${hookPosition.y}%`
                }}
                onMouseDown={handleHookMouseDown}
                onTouchStart={handleHookMouseDown}
              >
                🪝
              </div>
            </>
          )}

          {/* Swimming Fish */}
          {!caughtFish && swimmingFish.map((fish) => {
            const hasSprite = fish.fishData.gameSprite && fish.fishData.spriteFrames > 1;
            const spriteWidth = fish.fishData.spriteWidth || 64;
            const frameCount = fish.fishData.spriteFrames || 1;
            const totalWidth = spriteWidth * frameCount;
            const fishSize = spriteWidth * fish.scale;

            return (
              <div
                key={fish.id}
                className="swimming-fish"
                data-depth={fish.depth}
                style={{
                  left: `${fish.x}%`,
                  top: `${fish.y}%`,
                  width: `${fishSize}px`,
                  height: `${fishSize}px`,
                  transform: `scale(${fish.direction > 0 ? 1 : -1}, 1) rotate(${fish.direction * -3}deg)`,
                  zIndex: fish.depth === 1 ? 15 : fish.depth === 2 ? 10 : 5
                }}
              >
                {hasSprite ? (
                  <div
                    className="fish-sprite animated"
                    style={{
                      backgroundImage: `url(${fish.fishData.gameSprite})`,
                      backgroundSize: `${totalWidth}px ${spriteWidth}px`,
                      '--sprite-total-width': `${totalWidth}px`,
                      '--frame-count': frameCount,
                      '--swim-duration': `${0.6 + Math.random() * 0.3}s`
                    }}
                  />
                ) : (
                  <img src={fish.fishData.image} alt={fish.fishData.name} />
                )}
                <div className="fish-name-tag">{fish.fishData.name}</div>
              </div>
            );
          })}

          {/* Caught Fish Display */}
          {caughtFish && !showPreparation && (
            <div className="caught-fish-display">
              <h2>🎉 You caught a {caughtFish.name}!</h2>
              <img src={caughtFish.image} alt={caughtFish.name} />
              <p className="fish-weight">{fishWeight} kg</p>
            </div>
          )}
        </div>
      </div>

      {/* Preparation Selector */}
      {showPreparation && caughtFish && (
        <div className="preparation-modal-overlay">
          <div className="preparation-modal">
            <div className="modal-header">
              <h2>Choose Preparation Style</h2>
              <button className="close-modal" onClick={resetGame}>
                <X size={24} />
              </button>
            </div>

            <div className="caught-fish-info">
              <img src={caughtFish.image} alt={caughtFish.name} />
              <div>
                <h3>{caughtFish.name}</h3>
                <p>{fishWeight} kg @ ₹{caughtFish.pricePerKg}/kg</p>
              </div>
            </div>

            <div className="preparation-grid">
              {preparationStyles.map((prep) => {
                const basePrice = fishWeight * caughtFish.pricePerKg;
                const totalPrice = basePrice + prep.price;

                return (
                  <div
                    key={prep.name}
                    className={`preparation-card ${selectedPreparation?.name === prep.name ? 'selected' : ''}`}
                    onClick={() => handlePreparationSelect(prep)}
                  >
                    <div className="prep-icon">
                      {prep.name === 'Fry' && '🍳'}
                      {prep.name === 'Masala' && '🌶️'}
                      {prep.name === 'Grilled' && '🔥'}
                      {prep.name === 'Curry' && '🍛'}
                    </div>
                    <h4>{prep.name}</h4>
                    <p className="prep-price">+₹{prep.price}</p>
                    <div className="total-price">₹{totalPrice.toFixed(0)}</div>
                  </div>
                );
              })}
            </div>

            <button
              className="add-to-cart-btn-large"
              onClick={addFishToCart}
              disabled={!selectedPreparation}
            >
              <ShoppingCart size={20} />
              Add to Cart
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="success-modal-overlay">
          <div className="success-modal">
            <div className="success-icon">✓</div>
            <h2>Added to Cart!</h2>
            <p>
              {caughtFish.name} ({selectedPreparation.name}) - {fishWeight}kg
            </p>
            <p className="success-price">
              ₹{((fishWeight * caughtFish.pricePerKg) + selectedPreparation.price).toFixed(0)}
            </p>
            <div className="modal-actions">
              <button className="catch-another-btn" onClick={resetGame}>
                Catch Another
              </button>
              <button className="view-cart-btn" onClick={viewCart}>
                <ShoppingCart size={18} />
                View Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FishingGame;
