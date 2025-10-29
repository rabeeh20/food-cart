import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, Plus, Minus } from 'lucide-react';
import './Cart.css';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="container" style={{ minHeight: '60vh', paddingTop: '60px' }}>
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Add some delicious items to get started!</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <h1>Shopping Cart</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {cart.map((item) => (
            <div key={item._id} className="cart-item card">
              <img src={item.image} alt={item.name} />
              <div className="cart-item-details">
                <h3>{item.name}</h3>
                <p className="item-price">₹{item.price}</p>
              </div>
              <div className="quantity-controls">
                <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>
                  <Minus size={16} />
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>
                  <Plus size={16} />
                </button>
              </div>
              <div className="item-total">₹{item.price * item.quantity}</div>
              <button
                className="remove-btn"
                onClick={() => removeFromCart(item._id)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary card">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{getCartTotal()}</span>
          </div>
          <div className="summary-row">
            <span>Delivery Fee</span>
            <span>₹40</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{getCartTotal() + 40}</span>
          </div>
          <button className="btn btn-primary btn-block" onClick={handleCheckout}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
