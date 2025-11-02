import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fishAPI } from '../utils/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import './FishingGame.css';

const FishingGame = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Game states: 'loading' | 'idle' | 'casting' | 'caught' | 'weighing' | 'selecting'
  const [gameState, setGameState] = useState('loading');
  const [availableFish, setAvailableFish] = useState([]);
  const [preparationStyles, setPreparationStyles] = useState([]);
  const [gameEnabled, setGameEnabled] = useState(true);

  // Current catch data
  const [caughtFish, setCaughtFish] = useState(null);
  const [fishWeight, setFishWeight] = useState(0);
  const [selectedPreparation, setSelectedPreparation] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Animation states
  const [hookPosition, setHookPosition] = useState(0);
  const [weightCounter, setWeightCounter] = useState(0);

  useEffect(() => {
    fetchGameData();
  }, []);

  const fetchGameData = async () => {
    try {
      const [fishRes, prepRes] = await Promise.all([
        fishAPI.getAvailable(),
        fishAPI.getPreparationStyles()
      ]);

      if (!fishRes.data.gameEnabled) {
        setGameEnabled(false);
        setGameState('idle');
        toast.error('Fishing game is currently unavailable');
        return;
      }

      if (fishRes.data.fish.length === 0) {
        toast.error('No fish available today. Please check back later!');
        setGameEnabled(false);
        setGameState('idle');
        return;
      }

      setAvailableFish(fishRes.data.fish);
      setPreparationStyles(prepRes.data.preparationStyles);
      setGameState('idle');
    } catch (error) {
      console.error('Error fetching game data:', error);
      toast.error('Failed to load fishing game');
      setGameState('idle');
      setGameEnabled(false);
    }
  };

  const castHook = () => {
    if (availableFish.length === 0) {
      toast.error('No fish available!');
      return;
    }

    setGameState('casting');

    // Animate hook dropping
    let position = 0;
    const dropInterval = setInterval(() => {
      position += 5;
      setHookPosition(position);

      if (position >= 100) {
        clearInterval(dropInterval);
        setTimeout(() => catchFish(), 500);
      }
    }, 30);
  };

  const catchFish = () => {
    // Select random fish
    const randomFish = availableFish[Math.floor(Math.random() * availableFish.length)];

    // Generate random weight within fish's min-max range
    const minWeight = randomFish.minWeight || 1.0;
    const maxWeight = randomFish.maxWeight || 5.0;
    const weight = (Math.random() * (maxWeight - minWeight) + minWeight).toFixed(1);

    setCaughtFish(randomFish);
    setFishWeight(parseFloat(weight));
    setGameState('caught');

    // Animate hook pulling up
    let position = 100;
    const pullInterval = setInterval(() => {
      position -= 5;
      setHookPosition(position);

      if (position <= 0) {
        clearInterval(pullInterval);
        setTimeout(() => showWeightScale(), 300);
      }
    }, 30);
  };

  const showWeightScale = () => {
    setGameState('weighing');

    // Animate weight counter
    let counter = 0;
    const target = fishWeight;
    const increment = target / 50;

    const counterInterval = setInterval(() => {
      counter += increment;
      if (counter >= target) {
        setWeightCounter(target);
        clearInterval(counterInterval);
        setTimeout(() => setGameState('selecting'), 1000);
      } else {
        setWeightCounter(counter);
      }
    }, 20);
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

  const catchAnother = () => {
    setShowSuccessModal(false);
    setCaughtFish(null);
    setFishWeight(0);
    setSelectedPreparation(null);
    setWeightCounter(0);
    setHookPosition(0);
    setGameState('idle');
  };

  const viewCart = () => {
    navigate('/cart');
  };

  if (gameState === 'loading') {
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
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fishing-game-container">
      <div className="game-header">
        <h1>Catch Fresh Fish!</h1>
        <p>Cast your hook and catch the freshest fish of the day</p>
      </div>

      <div className="game-area">
        {/* Ocean Background */}
        <div className="ocean-container">
          <div className="ocean-waves"></div>

          {/* Fishing Rod */}
          {(gameState === 'idle' || gameState === 'casting' || gameState === 'caught') && (
            <div className="fishing-rod-container">
              <div className="fishing-rod"></div>
              <div
                className="fishing-line"
                style={{ height: `${hookPosition}%` }}
              ></div>
              <div
                className="fishing-hook"
                style={{ top: `${hookPosition}%` }}
              >
                {caughtFish && gameState === 'caught' && (
                  <div className="caught-fish-preview">
                    <img src={caughtFish.image} alt={caughtFish.name} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cast Button */}
          {gameState === 'idle' && (
            <div className="cast-button-container">
              <button className="cast-btn" onClick={castHook}>
                Cast Hook
              </button>
            </div>
          )}

          {/* Casting Animation */}
          {gameState === 'casting' && (
            <div className="casting-message">
              <p>Casting...</p>
            </div>
          )}
        </div>

        {/* Weight Scale */}
        {gameState === 'weighing' && caughtFish && (
          <div className="weight-scale-container">
            <h2>You Caught a {caughtFish.name}!</h2>
            <div className="scale-display">
              <div className="fish-image">
                <img src={caughtFish.image} alt={caughtFish.name} />
              </div>
              <div className="weight-display">
                <div className="weight-number">{weightCounter.toFixed(1)}</div>
                <div className="weight-unit">kg</div>
              </div>
              <div className="scale-base"></div>
            </div>
          </div>
        )}

        {/* Preparation Selector */}
        {gameState === 'selecting' && caughtFish && (
          <div className="preparation-selector-container">
            <div className="fish-info">
              <img src={caughtFish.image} alt={caughtFish.name} />
              <h2>{caughtFish.name}</h2>
              <p className="fish-weight">{fishWeight} kg</p>
            </div>

            <h3>Choose Your Preparation Style</h3>

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
                    <h4>{prep.name}</h4>
                    <p className="prep-description">{prep.description}</p>
                    <div className="price-breakdown">
                      <span className="base-price">Base: ₹{basePrice.toFixed(0)}</span>
                      <span className="prep-price">+₹{prep.price}</span>
                    </div>
                    <div className="total-price">Total: ₹{totalPrice.toFixed(0)}</div>
                  </div>
                );
              })}
            </div>

            <button
              className="add-to-cart-btn"
              onClick={addFishToCart}
              disabled={!selectedPreparation}
            >
              Add to Cart
            </button>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="success-modal-overlay">
            <div className="success-modal">
              <div className="success-icon">✓</div>
              <h2>Fish Added to Cart!</h2>
              <p>
                {caughtFish.name} ({selectedPreparation.name}) - {fishWeight}kg
              </p>
              <p className="total-price">
                ₹{((fishWeight * caughtFish.pricePerKg) + selectedPreparation.price).toFixed(0)}
              </p>
              <div className="modal-actions">
                <button className="catch-another-btn" onClick={catchAnother}>
                  Catch Another Fish
                </button>
                <button className="view-cart-btn" onClick={viewCart}>
                  View Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FishingGame;
