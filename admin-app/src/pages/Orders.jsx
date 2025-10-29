import React, { useState, useEffect, useRef } from 'react';
import { adminAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { RefreshCw } from 'lucide-react';
import './Orders.css';

const statusOptions = ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchOrders(true); // Silent refresh
      }, 10000); // 10 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, filter]);

  const fetchOrders = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      const params = filter ? { status: filter } : {};
      const response = await adminAPI.getOrders(params);
      if (response.data.success) {
        setOrders(response.data.orders);
        setLastRefresh(new Date());
      }
    } catch (error) {
      if (!silent) {
        toast.error('Failed to fetch orders');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const handleManualRefresh = () => {
    fetchOrders();
    toast.success('Orders refreshed!');
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await adminAPI.updateOrderStatus(orderId, { status: newStatus });
      if (response.data.success) {
        toast.success('Order status updated!');
        fetchOrders();
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>Orders Management</h1>
        <div className="orders-controls">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
            <option value="">All Orders</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>{status.replace('_', ' ')}</option>
            ))}
          </select>

          <div className="refresh-controls">
            <button
              className="btn btn-outline refresh-btn"
              onClick={handleManualRefresh}
              title="Refresh now"
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            <label className="auto-refresh-toggle">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              <span>Auto-refresh (10s)</span>
            </label>

            <span className="last-refresh">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      <div className="orders-table card">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td><strong>{order.orderId}</strong></td>
                <td>
                  {order.user?.email || 'N/A'}<br />
                  <small>{order.deliveryAddress?.phone}</small>
                </td>
                <td>{order.items.length} items</td>
                <td>₹{order.totalAmount}</td>
                <td>
                  <span className={`badge badge-${order.paymentStatus === 'completed' ? 'success' : 'warning'}`}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-${
                    order.orderStatus === 'delivered' ? 'success' :
                    order.orderStatus === 'cancelled' ? 'danger' : 'warning'
                  }`}>
                    {order.orderStatus.replace('_', ' ')}
                  </span>
                </td>
                <td>{formatDate(order.createdAt)}</td>
                <td>
                  <select
                    value={order.orderStatus}
                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                    className="status-select"
                    disabled={order.orderStatus === 'delivered' || order.orderStatus === 'cancelled'}
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status.replace('_', ' ')}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            No orders found
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
