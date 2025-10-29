import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Package } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/dashboard" className="navbar-brand">
            <h2>Admin Panel</h2>
          </Link>

          <div className="nav-links">
            <Link to="/dashboard" className="nav-link">
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
            <Link to="/orders" className="nav-link">
              <Package size={18} />
              Orders
            </Link>
            <button onClick={handleLogout} className="btn btn-danger">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
