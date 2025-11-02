import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PromoBanner.css';

const PromoBanner = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/fishing-game');
  };

  return (
    <div className="promo-banner clickable" onClick={handleClick}>
      <div className="promo-content">
        <h2 className="promo-title">Catch Fresh Fish Daily!</h2>
        <p className="promo-description">
          Try your luck and catch the freshest fish of the day. Choose your preparation style and enjoy the best seafood delivered to your door!
        </p>
      </div>
      <div className="promo-illustration">
        <div className="chef-icon">🎣</div>
      </div>
    </div>
  );
};

export default PromoBanner;
