import React, { useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';
import { Package, DollarSign, Users, TrendingUp } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card card">
          <div className="stat-icon" style={{ background: '#e3f2fd' }}>
            <Package size={32} color="#1976d2" />
          </div>
          <div className="stat-info">
            <h3>{stats?.totalOrders || 0}</h3>
            <p>Total Orders</p>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon" style={{ background: '#f3e5f5' }}>
            <Package size={32} color="#7b1fa2" />
          </div>
          <div className="stat-info">
            <h3>{stats?.todayOrders || 0}</h3>
            <p>Today's Orders</p>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon" style={{ background: '#fff3e0' }}>
            <TrendingUp size={32} color="#f57c00" />
          </div>
          <div className="stat-info">
            <h3>{stats?.activeOrders || 0}</h3>
            <p>Active Orders</p>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon" style={{ background: '#e8f5e9' }}>
            <DollarSign size={32} color="#388e3c" />
          </div>
          <div className="stat-info">
            <h3>₹{stats?.totalRevenue || 0}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon" style={{ background: '#fce4ec' }}>
            <DollarSign size={32} color="#c2185b" />
          </div>
          <div className="stat-info">
            <h3>₹{stats?.todayRevenue || 0}</h3>
            <p>Today's Revenue</p>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon" style={{ background: '#e0f2f1' }}>
            <Users size={32} color="#00796b" />
          </div>
          <div className="stat-info">
            <h3>{stats?.totalUsers || 0}</h3>
            <p>Total Users</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '30px' }}>
        <h2>Orders by Status</h2>
        <div style={{ marginTop: '20px' }}>
          {stats?.ordersByStatus?.map((item) => (
            <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <span style={{ textTransform: 'capitalize' }}>{item._id.replace('_', ' ')}</span>
              <strong>{item.count}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
