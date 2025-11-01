import React from 'react';
import './PromoBanner.css';

const PromoBanner = () => {
  return (
    <div className="promo-banner">
      <div className="promo-content">
        <h2 className="promo-title">Get Up To 20% Discount On Your First Order</h2>
        <p className="promo-description">
          Get the absolute best out of the main dishes that are prepared by the top 1% of chefs around the world. Don't hesitate to get started now!
        </p>
      </div>
      <div className="promo-illustration">
        <div className="chef-icon">👨‍🍳</div>
      </div>
    </div>
  );
};

export default PromoBanner;
