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
    // Initialize swimming fish positions with depth layers
    if (availableFish.length > 0) {
      const positions = availableFish.map((fish, index) => {
        const depthLayer = (index % 3) + 1; // Distribute across 3 depth layers
        const depthConfig = {
          1: { scale: 1.3, speed: 1.0, zIndex: 15 }, // Foreground
          2: { scale: 1.0, speed: 0.7, zIndex: 10 }, // Midground
          3: { scale: 0.7, speed: 0.5, zIndex: 5 }   // Background
        };

        return {
          id: fish._id,
          fishData: fish,
          x: Math.random() * 80,
          y: 30 + (index * 12) % 50,
          depth: depthLayer,
          scale: depthConfig[depthLayer].scale,
          speed: (0.3 + Math.random() * 0.5) * depthConfig[depthLayer].speed,
          direction: Math.random() > 0.5 ? 1 : -1
        };
      });
      setSwimmingFish(positions);
    }
  }, [availableFish]);

  useEffect(() => {
    // Animate swimming fish
    const swimInterval = setInterval(() => {
      setSwimmingFish(prev => prev.map(fish => {
        let newX = fish.x + (fish.speed * fish.direction);
        let newDirection = fish.direction;

        // Reverse direction at boundaries
        if (newX <= 0 || newX >= 90) {
          newDirection = -fish.direction;
          newX = fish.x + (fish.speed * newDirection);
        }

        return { ...fish, x: newX, direction: newDirection };
      }));
    }, 50);

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

    // Show preparation selection after a short delay
    setTimeout(() => {
      setShowPreparation(true);
    }, 1000);
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
          {!caughtFish && swimmingFish.map((fish) => (
            <div
              key={fish.id}
              className="swimming-fish"
              data-depth={fish.depth}
              style={{
                left: `${fish.x}%`,
                top: `${fish.y}%`,
                transform: `scale(${fish.scale}) scaleX(${fish.direction})`,
                zIndex: fish.depth === 1 ? 15 : fish.depth === 2 ? 10 : 5
              }}
            >
              <img src={fish.fishData.image} alt={fish.fishData.name} />
              <div className="fish-name-tag">{fish.fishData.name}</div>
            </div>
          ))}

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
