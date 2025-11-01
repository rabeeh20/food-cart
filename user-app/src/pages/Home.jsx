import React, { useState, useEffect } from 'react';
import { menuAPI } from '../utils/api';
import MenuCard from '../components/MenuCard';
import PromoBanner from '../components/PromoBanner';
import CategoryCard from '../components/CategoryCard';
import CartSidebar from '../components/CartSidebar';
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
      <div className="container">
        <div className="home-layout">
          {/* Main Content */}
          <div className="home-main-content">
            {/* Promotional Banner */}
            <PromoBanner />

            {/* Category Section */}
            <div className="category-section">
              <h2 className="section-title">Category</h2>
              <div className="category-grid">
                <CategoryCard
                  category="All"
                  isActive={selectedCategory === ''}
                  onClick={() => setSelectedCategory('')}
                />
                {categories.map((cat) => (
                  <CategoryCard
                    key={cat}
                    category={cat}
                    isActive={selectedCategory === cat}
                    onClick={() => setSelectedCategory(cat)}
                  />
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
              <div className="section-header">
                <h2 className="section-title">Popular Dishes</h2>
                <label className="veg-filter">
                  <input
                    type="checkbox"
                    checked={vegOnly}
                    onChange={(e) => setVegOnly(e.target.checked)}
                  />
                  <span>🟢 Veg Only</span>
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

          {/* Cart Sidebar */}
          <CartSidebar />
        </div>
      </div>
    </div>
  );
};

export default Home;
