import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2 } from 'lucide-react';
import './MobileCheckoutBar.css';

const MobileCheckoutBar = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, getCartCount, clearCart } = useCart();

  if (cart.length === 0) return null;

  const total = getCartTotal();
  const deliveryFee = 40;
  const grandTotal = total + deliveryFee;
  const itemCount = getCartCount();

  // Get the first item's image as thumbnail
  const firstItemImage = cart[0]?.image || '';

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleViewCart = () => {
    navigate('/cart');
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  return (
    <div className="mobile-checkout-bar">
      <div className="mobile-checkout-content">
        {/* Left side - Item thumbnail and count */}
        <div className="mobile-checkout-left" onClick={handleViewCart}>
          <div className="mobile-checkout-image">
            <img src={firstItemImage} alt="Cart item" />
            <div className="mobile-item-count-badge">{itemCount}</div>
          </div>
          <div className="mobile-checkout-info">
            <span className="mobile-items-text">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
            <span className="mobile-total-text">₹{grandTotal}</span>
          </div>
        </div>

        {/* Right side - Checkout button and trash */}
        <div className="mobile-checkout-right">
          <button className="mobile-checkout-btn" onClick={handleCheckout}>
            Checkout
          </button>
          <button className="mobile-trash-btn" onClick={handleClearCart}>
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileCheckoutBar;
