import React from 'react';
import { Star } from 'lucide-react';
import './Rating.css';

const Rating = ({ rating = 0, maxRating = 5, size = 16, showNumber = false }) => {
  const stars = [];

  for (let i = 1; i <= maxRating; i++) {
    stars.push(
      <Star
        key={i}
        size={size}
        className={i <= rating ? 'star-filled' : 'star-empty'}
        fill={i <= rating ? 'currentColor' : 'none'}
      />
    );
  }

  return (
    <div className="rating-container">
      <div className="rating-stars">
        {stars}
      </div>
      {showNumber && <span className="rating-number">({rating})</span>}
    </div>
  );
};

export default Rating;
