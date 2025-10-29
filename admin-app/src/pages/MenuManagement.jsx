import React, { useState, useEffect } from 'react';
import { menuAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import './MenuManagement.css';

const categories = ['Starter', 'Main Course', 'Dessert', 'Beverage', 'Snacks', 'Combo'];

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course',
    isVeg: true,
    isAvailable: true,
    stock: 100,
    preparationTime: 30,
    image: '',
    tags: ''
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const response = await menuAPI.getAll(); // Get all items (no filter for admin)
      console.log('Menu items response:', response.data);
      if (response.data.success) {
        setMenuItems(response.data.menuItems);
      }
    } catch (error) {
      console.error('Fetch menu items error:', error);
      toast.error('Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      preparationTime: parseInt(formData.preparationTime),
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
    };

    try {
      if (editingItem) {
        const response = await menuAPI.update(editingItem._id, data);
        if (response.data.success) {
          toast.success('Menu item updated successfully!');
        }
      } else {
        const response = await menuAPI.create(data);
        if (response.data.success) {
          toast.success('Menu item added successfully!');
        }
      }
      fetchMenuItems();
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (item) => {
    console.log('Edit clicked for item:', item);
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      stock: item.stock || 100,
      preparationTime: item.preparationTime,
      image: item.image || '',
      tags: item.tags?.join(', ') || ''
    });
    setShowModal(true);
    console.log('Modal should be shown, showModal:', true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await menuAPI.delete(id);
      toast.success('Menu item deleted successfully!');
      fetchMenuItems();
    } catch (error) {
      toast.error('Failed to delete menu item');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Main Course',
      isVeg: true,
      isAvailable: true,
      stock: 100,
      preparationTime: 30,
      image: '',
      tags: ''
    });
  };

  if (loading) return <div className="loading">Loading menu...</div>;

  return (
    <div className="menu-management-page">
      <div className="menu-header">
        <h1>Menu Management</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          Add New Item
        </button>
      </div>

      <div className="menu-grid">
        {menuItems.map((item) => (
          <div key={item._id} className="menu-item-card card">
            <div className="item-image">
              <img src={item.image} alt={item.name} />
              <span className={`veg-indicator ${item.isVeg ? 'veg' : 'non-veg'}`}>
                {item.isVeg ? '🟢' : '🔴'}
              </span>
            </div>
            <div className="item-details">
              <h3>{item.name}</h3>
              <p className="item-description">{item.description}</p>
              <div className="item-info">
                <span className="item-price">₹{item.price}</span>
                <span className="item-category">{item.category}</span>
              </div>
              <div className="item-tags">
                {item.tags?.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
              <div className="item-status">
                <span className={`badge ${item.isAvailable ? 'badge-success' : 'badge-danger'}`}>
                  {item.isAvailable ? 'Available' : 'Unavailable'}
                </span>
                <span className="prep-time">⏱️ {item.preparationTime} mins</span>
              </div>
              <div className="item-stock">
                <span className={`stock-info ${item.stock === 0 ? 'out-of-stock' : item.stock < 10 ? 'low-stock' : ''}`}>
                  📦 Stock: {item.stock} {item.stock < 10 && item.stock > 0 ? '(Low)' : ''} {item.stock === 0 ? '(Out of Stock)' : ''}
                </span>
              </div>
              <div className="item-actions">
                <button className="btn btn-outline" onClick={() => handleEdit(item)}>
                  <Edit size={16} />
                  Edit
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(item._id)}>
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal menu-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="input-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  required
                />
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="input-group">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Prep Time (mins)</label>
                  <input
                    type="number"
                    value={formData.preparationTime}
                    onChange={(e) => setFormData({...formData, preparationTime: e.target.value})}
                    required
                    min="5"
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="input-group">
                <label>Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  placeholder="Popular, Spicy, Bestseller"
                />
              </div>

              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isVeg}
                    onChange={(e) => setFormData({...formData, isVeg: e.target.checked})}
                  />
                  Vegetarian
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                  />
                  Available
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
