import React from 'react';
import './DiscountBadge.css';

const DiscountBadge = ({ type, value, label }) => {
  // Don't render if no value
  if (!value || value <= 0) return null;

  // Determine badge text
  let badgeText = label;

  if (!badgeText) {
    // Auto-generate label based on type and value
    if (type === 'percentage') {
      badgeText = `${value}% OFF`;
    } else if (type === 'fixed') {
      badgeText = `₹${value} OFF`;
    }
  }

  return (
    <div className="discount-badge">
      {badgeText}
    </div>
  );
};

export default DiscountBadge;
