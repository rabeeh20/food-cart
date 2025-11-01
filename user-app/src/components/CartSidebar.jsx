import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import './CartSidebar.css';

const CartSidebar = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, getCartTotal, getCartCount } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  const [removingItems, setRemovingItems] = useState(new Set());

  useEffect(() => {
    if (cart.length > 0) {
      // Delay to trigger animation
      setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(false);
    }
  }, [cart.length]);

  const handleRemoveItem = (itemId) => {
    setRemovingItems(prev => new Set(prev).add(itemId));
    setTimeout(() => {
      removeFromCart(itemId);
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }, 300);
  };

  if (cart.length === 0) return null;

  const deliveryFee = 40;
  const total = getCartTotal();
  const grandTotal = total + deliveryFee;

  return (
    <div className={`cart-sidebar ${isVisible ? 'cart-sidebar-visible' : ''}`}>
      <div className="cart-sidebar-header">
        <ShoppingBag size={20} />
        <h3>Your Cart</h3>
        <span className="cart-count-badge">{getCartCount()}</span>
      </div>

      <div className="cart-sidebar-items">
        {cart.map((item, index) => (
          <div
            key={item._id}
            className={`cart-sidebar-item ${removingItems.has(item._id) ? 'removing' : ''}`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="cart-item-info">
              <div className="cart-item-image">
                <img src={item.image} alt={item.name} />
                <div className="cart-item-veg-badge">
                  {item.isVeg ? '🟢' : '🔴'}
                </div>
              </div>
              <div className="cart-item-details">
                <h4>{item.name}</h4>
                <div className="cart-item-price-row">
                  <span className="cart-item-price">₹{item.price}</span>
                  <span className="cart-item-quantity-text">× {item.quantity}</span>
                </div>
              </div>
            </div>

            <div className="cart-item-actions">
              <div className="cart-quantity-control">
                <button
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  className="quantity-btn"
                >
                  <Minus size={14} />
                </button>
                <span className="quantity">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  className="quantity-btn"
                >
                  <Plus size={14} />
                </button>
              </div>
              <button
                onClick={() => handleRemoveItem(item._id)}
                className="remove-btn"
                title="Remove item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-sidebar-summary">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>₹{total}</span>
        </div>
        <div className="summary-row">
          <span>Delivery Fee</span>
          <span>₹{deliveryFee}</span>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <span>₹{grandTotal}</span>
        </div>
      </div>

      <button
        className="checkout-btn"
        onClick={() => navigate('/checkout')}
      >
        Proceed to Checkout
      </button>
    </div>
  );
};

export default CartSidebar;
