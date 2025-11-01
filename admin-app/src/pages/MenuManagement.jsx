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
    tags: '',
    discountEnabled: false,
    discountType: 'percentage',
    discountValue: 0,
    discountLabel: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);

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

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setSelectedImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) return formData.image;

    setUploading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('image', selectedImage);

      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/menu/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Image uploaded successfully!');
        return data.imageUrl;
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      toast.error('Failed to upload image');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Upload image first if a new image is selected
      let imageUrl = formData.image;
      if (selectedImage) {
        imageUrl = await uploadImage();
      }

      const data = {
        ...formData,
        image: imageUrl,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        preparationTime: parseInt(formData.preparationTime),
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        discount: {
          enabled: formData.discountEnabled,
          type: formData.discountType,
          value: parseFloat(formData.discountValue) || 0,
          label: formData.discountLabel || ''
        }
      };

      // Remove discount fields from top level
      delete data.discountEnabled;
      delete data.discountType;
      delete data.discountValue;
      delete data.discountLabel;

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
    setSelectedImage(null);
    setImagePreview('');
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
      tags: item.tags?.join(', ') || '',
      discountEnabled: item.discount?.enabled || false,
      discountType: item.discount?.type || 'percentage',
      discountValue: item.discount?.value || 0,
      discountLabel: item.discount?.label || ''
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
    setSelectedImage(null);
    setImagePreview('');
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
      tags: '',
      discountEnabled: false,
      discountType: 'percentage',
      discountValue: 0,
      discountLabel: ''
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
                <label>Menu Item Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="file-input"
                />
                <small className="help-text">Max size: 5MB. Formats: JPG, PNG, GIF, WEBP</small>

                {(imagePreview || formData.image) && (
                  <div className="image-preview-container">
                    <img
                      src={imagePreview || formData.image}
                      alt="Preview"
                      className="image-preview"
                    />
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview('');
                        setFormData({...formData, image: ''});
                      }}
                    >
                      Remove Image
                    </button>
                  </div>
                )}

                {uploading && (
                  <div className="upload-status">
                    <span>Uploading image...</span>
                  </div>
                )}
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

              <div className="input-group discount-toggle">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.discountEnabled}
                    onChange={(e) => setFormData({...formData, discountEnabled: e.target.checked})}
                  />
                  <span>Enable Discount Badge</span>
                </label>
              </div>

              {formData.discountEnabled && (
                <div className="discount-section">
                  <div className="form-row">
                    <div className="input-group">
                      <label>Discount Type</label>
                      <select
                        value={formData.discountType}
                        onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₹)</option>
                      </select>
                    </div>

                    <div className="input-group">
                      <label>Discount Value</label>
                      <input
                        type="number"
                        value={formData.discountValue}
                        onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                        placeholder={formData.discountType === 'percentage' ? '20' : '50'}
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Custom Badge Label (Optional)</label>
                    <input
                      type="text"
                      value={formData.discountLabel}
                      onChange={(e) => setFormData({...formData, discountLabel: e.target.value})}
                      placeholder="e.g., SALE, HOT DEAL (leave empty for auto: '20% OFF')"
                    />
                    <small className="help-text">
                      Leave empty to auto-generate label like "20% OFF" or "₹50 OFF"
                    </small>
                  </div>
                </div>
              )}

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
