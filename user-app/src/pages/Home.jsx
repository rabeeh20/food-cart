import React, { useState, useEffect } from 'react';
import { menuAPI } from '../utils/api';
import MenuCard from '../components/MenuCard';
import toast from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';
import './Home.css';

const Home = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
  }, [selectedCategory, vegOnly]);

  // Setup WebSocket listener for stock updates
  useEffect(() => {
    if (!socket) return;

    socket.on('stock-updated', (data) => {
      console.log('Stock updated:', data);

      // Update the specific item in the menu
      setMenuItems(prevItems =>
        prevItems.map(item =>
          item._id === data.itemId ? { ...item, stock: data.item.stock } : item
        )
      );

      // Show toast if item is out of stock
      if (data.item.stock === 0) {
        toast.error(`${data.item.name} is now out of stock!`, {
          duration: 4000
        });
      }
    });

    socket.on('menu-item-added', (data) => {
      console.log('New menu item added:', data);
      // Refresh menu items
      fetchMenuItems();
    });

    return () => {
      socket.off('stock-updated');
      socket.off('menu-item-added');
    };
  }, [socket]);

  const fetchCategories = async () => {
    try {
      const response = await menuAPI.getCategories();
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (vegOnly) params.isVeg = true;

      const response = await menuAPI.getAll(params);
      if (response.data.success) {
        setMenuItems(response.data.menuItems);
      }
    } catch (error) {
      toast.error('Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="container">
          <h1>Delicious Food Delivered to Your Door</h1>
          <p>Order from our wide selection of mouth-watering dishes</p>
        </div>
      </div>

      <div className="container">
        <div className="filters-section">
          <div className="filter-group">
            <label>Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={vegOnly}
                onChange={(e) => setVegOnly(e.target.checked)}
              />
              Veg Only
            </label>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading menu...</div>
        ) : menuItems.length === 0 ? (
          <div className="no-items">
            <p>No items found</p>
          </div>
        ) : (
          <div className="menu-grid grid grid-3">
            {menuItems.map((item) => (
              <MenuCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
