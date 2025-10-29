import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../utils/api';
import toast from 'react-hot-toast';
import './Orders.css';

const statusColors = {
  placed: 'primary',
  confirmed: 'primary',
  preparing: 'warning',
  ready: 'warning',
  out_for_delivery: 'warning',
  delivered: 'success',
  cancelled: 'danger'
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getAll();
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="container" style={{ minHeight: '60vh', paddingTop: '60px' }}>
        <div className="empty-cart">
          <h2>No orders yet</h2>
          <p>Start ordering to see your order history!</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container orders-page">
      <h1>My Orders</h1>
      <div className="orders-list">
        {orders.map((order) => (
          <div key={order._id} className="order-card card">
            <div className="order-header">
              <div>
                <h3>Order #{order.orderId}</h3>
                <p className="order-date">{formatDate(order.createdAt)}</p>
              </div>
              <span className={`badge badge-${statusColors[order.orderStatus]}`}>
                {order.orderStatus.replace('_', ' ')}
              </span>
            </div>
            <div className="order-items">
              {order.items.map((item, index) => (
                <div key={index} className="order-item-row">
                  <span>{item.name} x {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="order-footer">
              <div className="order-total">
                <strong>Total: ₹{order.totalAmount}</strong>
              </div>
              <div className="order-payment">
                Payment: <span className={`badge badge-${order.paymentStatus === 'completed' ? 'success' : 'warning'}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
