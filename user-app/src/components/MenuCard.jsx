import React, { useState } from 'react';
import { Plus, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import Rating from './Rating';
import DiscountBadge from './DiscountBadge';
import './MenuCard.css';

const MenuCard = ({ item }) => {
  const { addToCart } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);

  const handleAddToCart = () => {
    addToCart(item);
    toast.success(`${item.name} added to cart!`);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const isOutOfStock = item.stock === 0;

  return (
    <div className={`menu-card ${isOutOfStock ? 'out-of-stock-card' : ''}`}>
      <div className="menu-card-image">
        <img src={item.image} alt={item.name} />

        {/* Discount Badge */}
        {item.discount?.enabled && (
          <DiscountBadge
            type={item.discount.type}
            value={item.discount.value}
            label={item.discount.label}
          />
        )}

        {/* Favorite Button */}
        <button className="favorite-btn" onClick={toggleFavorite}>
          <Heart
            size={20}
            fill={isFavorite ? 'currentColor' : 'none'}
            className={isFavorite ? 'favorited' : ''}
          />
        </button>

        {/* Veg/Non-veg Badge */}
        <span className={`veg-badge ${item.isVeg ? 'veg' : 'non-veg'}`}>
          {item.isVeg ? '🟢' : '🔴'}
        </span>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="out-of-stock-overlay">
            <span className="out-of-stock-badge">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="menu-card-content">
        {/* Rating */}
        {item.rating > 0 && (
          <div className="menu-card-rating">
            <Rating rating={item.rating} size={14} />
          </div>
        )}

        <h3>{item.name}</h3>
        <p className="description">{item.description}</p>
        <div className="menu-card-tags">
          {item.tags?.map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
          ))}
        </div>
        <div className="menu-card-footer">
          <div className="menu-card-info">
            <div className="price">₹{item.price}</div>
            <div className="prep-time">⏱️ {item.preparationTime} mins</div>
          </div>
          <button
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={!item.isAvailable || isOutOfStock}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuCard;
