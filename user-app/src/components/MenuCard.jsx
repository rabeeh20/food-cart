import React from 'react';
import { Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import './MenuCard.css';

const MenuCard = ({ item }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(item);
    toast.success(`${item.name} added to cart!`);
  };

  const isOutOfStock = item.stock === 0;

  return (
    <div className={`menu-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
      <div className="menu-card-image">
        <img src={item.image} alt={item.name} />
        <span className={`veg-badge ${item.isVeg ? 'veg' : 'non-veg'}`}>
          {item.isVeg ? '🟢' : '🔴'}
        </span>
        {isOutOfStock && (
          <div className="out-of-stock-overlay">
            <span className="out-of-stock-badge">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="menu-card-content">
        <h3>{item.name}</h3>
        <p className="description">{item.description}</p>
        <div className="menu-card-tags">
          {item.tags?.map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
          ))}
        </div>
        <div className="menu-card-footer">
          <div className="price">₹{item.price}</div>
          <button
            className="btn btn-primary add-btn"
            onClick={handleAddToCart}
            disabled={!item.isAvailable || isOutOfStock}
          >
            {isOutOfStock ? (
              'Out of Stock'
            ) : item.isAvailable ? (
              <>
                <Plus size={16} /> Add
              </>
            ) : (
              'Unavailable'
            )}
          </button>
        </div>
        <div className="prep-time">
          ⏱️ {item.preparationTime} mins
        </div>
      </div>
    </div>
  );
};

export default MenuCard;
