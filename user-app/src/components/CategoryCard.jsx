import React from 'react';
import './CategoryCard.css';

const categoryIcons = {
  'Starter': '🥗',
  'Main Course': '🍛',
  'Dessert': '🍰',
  'Beverage': '🥤',
  'Snacks': '🍟',
  'Combo': '🍱'
};

const CategoryCard = ({ category, isActive, onClick }) => {
  const icon = categoryIcons[category] || '🍽️';

  return (
    <div
      className={`category-card ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="category-icon">{icon}</div>
      <div className="category-name">{category}</div>
    </div>
  );
};

export default CategoryCard;
