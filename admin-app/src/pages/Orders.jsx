import React, { useState, useEffect, useRef } from 'react';
import { adminAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { RefreshCw, Bell } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import './Orders.css';

const statusOptions = ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const { socket, connected } = useSocket();
  const audioRef = useRef(null);

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  // Setup WebSocket listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for new orders
    socket.on('new-order', (data) => {
      console.log('New order received:', data);

      // Play notification sound
      if (audioRef.current) {
        audioRef.current.play().catch(err => console.log('Audio play failed:', err));
      }

      // Show toast notification
      toast.success(data.message, {
        icon: '🔔',
        duration: 5000
      });

      // Refresh orders list
      fetchOrders(true);
    });

    // Listen for order updates
    socket.on('order-updated', (data) => {
      console.log('Order updated:', data);

      // Update the specific order in the list
      setOrders(prevOrders => {
        const updatedOrders = prevOrders.map(order =>
          order._id === data.order._id ? data.order : order
        );
        return updatedOrders;
      });

      setLastRefresh(new Date());
    });

    return () => {
      socket.off('new-order');
      socket.off('order-updated');
    };
  }, [socket]);

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

            <span className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
              <Bell size={14} />
              {connected ? 'Live' : 'Offline'}
            </span>

            <span className="last-refresh">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
          </div>

          {/* Hidden audio element for notifications */}
          <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG" preload="auto" />
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
