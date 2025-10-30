import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, LogOut, Menu } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowMenu(false);
  };

  const closeMenu = () => {
    setShowMenu(false);
  };

  const cartCount = getCartCount();

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            <h1>FoodCart</h1>
          </Link>

          <button className="menu-toggle" onClick={() => setShowMenu(!showMenu)}>
            <Menu />
          </button>

          <div className={`navbar-menu ${showMenu ? 'active' : ''}`}>
            <Link to="/" className="nav-link" onClick={closeMenu}>Menu</Link>
            {user && (
              <>
                <Link to="/orders" className="nav-link" onClick={closeMenu}>My Orders</Link>
                <Link to="/addresses" className="nav-link" onClick={closeMenu}>Addresses</Link>
                <Link to="/cart" className="nav-link cart-link" onClick={closeMenu}>
                  <ShoppingCart size={20} />
                  {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </Link>
                <div className="nav-user">
                  <User size={20} />
                  <span>{user.email}</span>
                </div>
                <button onClick={handleLogout} className="btn btn-outline">
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            )}
            {!user && (
              <Link to="/login" className="btn btn-primary" onClick={closeMenu}>Login</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
