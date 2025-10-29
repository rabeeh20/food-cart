import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Package, UtensilsCrossed } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem('admin') || '{}');
  const isSuperAdmin = admin.role === 'super_admin';

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
            <h2>{isSuperAdmin ? 'Super Admin Panel' : 'Admin Panel'}</h2>
          </Link>

          <div className="nav-links">
            {isSuperAdmin && (
              <Link to="/dashboard" className="nav-link">
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
            )}
            <Link to="/orders" className="nav-link">
              <Package size={18} />
              Orders
            </Link>
            {isSuperAdmin && (
              <Link to="/menu" className="nav-link">
                <UtensilsCrossed size={18} />
                Menu
              </Link>
            )}
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
