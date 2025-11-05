import React, { useState, useEffect } from 'react';
import { fishAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Upload, X, Power, Settings } from 'lucide-react';
import './FishManagement.css';

const FishManagement = () => {
  const [fish, setFish] = useState([]);
  const [gameSettings, setGameSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingFish, setEditingFish] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    species: 'Other',
    image: '',
    pricePerKg: '',
    availableStock: '',
    isAvailable: true,
    description: '',
    weightOptions: [0.5, 1, 1.5, 2, 2.5],
    gameSprite: '',
    spriteFrames: 8,
    spriteWidth: 64
  });

  const [weightInput, setWeightInput] = useState('');

  const speciesOptions = [
    'Pomfret', 'Kingfish', 'Mackerel', 'Tuna', 'Salmon',
    'Sardine', 'Prawns', 'Crab', 'Squid', 'Lobster', 'Other'
  ];

  useEffect(() => {
    fetchFishAndSettings();
  }, []);

  const fetchFishAndSettings = async () => {
    setLoading(true);
    try {
      const [fishRes, settingsRes] = await Promise.all([
        fishAPI.getAllFish(),
        fishAPI.getGameSettings()
      ]);

      if (fishRes.data.success) {
        setFish(fishRes.data.fish);
      }

      if (settingsRes.data.success) {
        setGameSettings(settingsRes.data.settings);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load fish data');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    const formDataImg = new FormData();
    formDataImg.append('image', file);

    try {
      const response = await fishAPI.uploadImage(formDataImg);
      if (response.data.success) {
        setFormData({ ...formData, image: response.data.imageUrl });
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSpriteUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error('Sprite image size should be less than 20MB');
      return;
    }

    setUploading(true);
    const formDataImg = new FormData();
    formDataImg.append('image', file);

    try {
      const response = await fishAPI.uploadImage(formDataImg);
      if (response.data.success) {
        setFormData({ ...formData, gameSprite: response.data.imageUrl });
        toast.success('Sprite uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading sprite:', error);
      toast.error('Failed to upload sprite');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.image || !formData.pricePerKg || !formData.availableStock) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      if (editingFish) {
        const response = await fishAPI.updateFish(editingFish._id, formData);
        if (response.data.success) {
          toast.success('Fish updated successfully');
          fetchFishAndSettings();
          closeModal();
        }
      } else {
        const response = await fishAPI.createFish(formData);
        if (response.data.success) {
          toast.success('Fish added successfully');
          fetchFishAndSettings();
          closeModal();
        }
      }
    } catch (error) {
      console.error('Error saving fish:', error);
      toast.error(error.response?.data?.message || 'Failed to save fish');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this fish?')) return;

    try {
      const response = await fishAPI.deleteFish(id);
      if (response.data.success) {
        toast.success('Fish deleted successfully');
        fetchFishAndSettings();
      }
    } catch (error) {
      console.error('Error deleting fish:', error);
      toast.error('Failed to delete fish');
    }
  };

  const handleToggleGame = async () => {
    try {
      const newStatus = !gameSettings.fishingGameEnabled;
      const response = await fishAPI.toggleGame({ enabled: newStatus });

      if (response.data.success) {
        setGameSettings(response.data.settings);
        toast.success(`Fishing game ${newStatus ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      console.error('Error toggling game:', error);
      toast.error('Failed to toggle game status');
    }
  };

  const addWeightOption = () => {
    const weight = parseFloat(weightInput);
    if (isNaN(weight) || weight < 0.1 || weight > 10) {
      toast.error('Please enter a valid weight between 0.1kg and 10kg');
      return;
    }
    if (formData.weightOptions.includes(weight)) {
      toast.error('This weight option already exists');
      return;
    }
    setFormData({
      ...formData,
      weightOptions: [...formData.weightOptions, weight].sort((a, b) => a - b)
    });
    setWeightInput('');
  };

  const removeWeightOption = (weight) => {
    if (formData.weightOptions.length <= 1) {
      toast.error('At least one weight option is required');
      return;
    }
    setFormData({
      ...formData,
      weightOptions: formData.weightOptions.filter(w => w !== weight)
    });
  };

  const openModal = (fishItem = null) => {
    if (fishItem) {
      setEditingFish(fishItem);
      setFormData({
        name: fishItem.name,
        species: fishItem.species,
        image: fishItem.image,
        pricePerKg: fishItem.pricePerKg,
        availableStock: fishItem.availableStock,
        isAvailable: fishItem.isAvailable,
        description: fishItem.description || '',
        weightOptions: fishItem.weightOptions || [0.5, 1, 1.5, 2, 2.5],
        gameSprite: fishItem.gameSprite || '',
        spriteFrames: fishItem.spriteFrames || 8,
        spriteWidth: fishItem.spriteWidth || 64
      });
    } else {
      setEditingFish(null);
      setFormData({
        name: '',
        species: 'Other',
        image: '',
        pricePerKg: '',
        availableStock: '',
        isAvailable: true,
        description: '',
        weightOptions: [0.5, 1, 1.5, 2, 2.5],
        gameSprite: '',
        spriteFrames: 8,
        spriteWidth: 64
      });
    }
    setWeightInput('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingFish(null);
  };

  if (loading) {
    return (
      <div className="fish-management-container">
        <div className="loading">Loading fish data...</div>
      </div>
    );
  }

  return (
    <div className="fish-management-container">
      <div className="fish-header">
        <h1>Fish Inventory Management</h1>

        <div className="header-actions">
          <div className="game-status">
            <span className={`status-indicator ${gameSettings?.fishingGameEnabled ? 'active' : 'inactive'}`}>
              {gameSettings?.fishingGameEnabled ? 'Game Active' : 'Game Inactive'}
            </span>
            <button
              className={`toggle-game-btn ${gameSettings?.fishingGameEnabled ? 'active' : ''}`}
              onClick={handleToggleGame}
            >
              <Power size={18} />
              {gameSettings?.fishingGameEnabled ? 'Disable Game' : 'Enable Game'}
            </button>
          </div>

          <button className="add-fish-btn" onClick={() => openModal()}>
            <Plus size={20} />
            Add New Fish
          </button>
        </div>
      </div>

      <div className="fish-stats">
        <div className="stat-card">
          <h3>{fish.length}</h3>
          <p>Total Fish Types</p>
        </div>
        <div className="stat-card">
          <h3>{fish.filter(f => f.isAvailable).length}</h3>
          <p>Available</p>
        </div>
        <div className="stat-card">
          <h3>{fish.reduce((sum, f) => sum + f.availableStock, 0)}</h3>
          <p>Total Stock</p>
        </div>
        <div className="stat-card">
          <h3>{gameSettings?.preparationStyles?.length || 0}</h3>
          <p>Preparation Styles</p>
        </div>
      </div>

      <div className="fish-table-container">
        <table className="fish-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Species</th>
              <th>Price/Kg</th>
              <th>Stock</th>
              <th>Weight Range</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fish.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  No fish added yet. Click "Add New Fish" to get started.
                </td>
              </tr>
            ) : (
              fish.map((fishItem) => (
                <tr key={fishItem._id}>
                  <td>
                    <img src={fishItem.image} alt={fishItem.name} className="fish-thumbnail" />
                  </td>
                  <td className="fish-name">{fishItem.name}</td>
                  <td>{fishItem.species}</td>
                  <td className="price">₹{fishItem.pricePerKg}</td>
                  <td>
                    <span className={`stock ${fishItem.availableStock === 0 ? 'out-of-stock' : ''}`}>
                      {fishItem.availableStock}
                    </span>
                  </td>
                  <td>{fishItem.weightOptions?.join(', ') || 'N/A'}kg</td>
                  <td>
                    <span className={`status-badge ${fishItem.isAvailable ? 'available' : 'unavailable'}`}>
                      {fishItem.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="actions">
                    <button
                      className="edit-btn"
                      onClick={() => openModal(fishItem)}
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(fishItem._id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Fish Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingFish ? 'Edit Fish' : 'Add New Fish'}</h2>
              <button className="close-btn" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="fish-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Fresh Pomfret"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Species *</label>
                  <select
                    value={formData.species}
                    onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                    required
                  >
                    {speciesOptions.map(species => (
                      <option key={species} value={species}>{species}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price per Kg (₹) *</label>
                  <input
                    type="number"
                    value={formData.pricePerKg}
                    onChange={(e) => setFormData({ ...formData, pricePerKg: e.target.value })}
                    placeholder="400"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Available Stock *</label>
                  <input
                    type="number"
                    value={formData.availableStock}
                    onChange={(e) => setFormData({ ...formData, availableStock: e.target.value })}
                    placeholder="10"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Weight Options (kg) *</label>
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input
                      type="number"
                      step="0.1"
                      value={weightInput}
                      onChange={(e) => setWeightInput(e.target.value)}
                      placeholder="Enter weight (e.g., 1.5)"
                      min="0.1"
                      max="10"
                      style={{ flex: 1 }}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addWeightOption())}
                    />
                    <button
                      type="button"
                      onClick={addWeightOption}
                      className="btn btn-outline"
                      style={{ padding: '8px 16px' }}
                    >
                      Add Weight
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {formData.weightOptions.map(weight => (
                      <div
                        key={weight}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          background: '#f0f0f0',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      >
                        <span>{weight}kg</span>
                        <X
                          size={16}
                          onClick={() => removeWeightOption(weight)}
                          style={{ cursor: 'pointer', color: '#ff6b6b' }}
                        />
                      </div>
                    ))}
                  </div>
                  <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                    Users can select from these weight options when ordering
                  </small>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Fresh premium quality fish..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Fish Image (for Cart) *</label>
                <div className="image-upload-area">
                  {formData.image ? (
                    <div className="image-preview">
                      <img src={formData.image} alt="Preview" />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => setFormData({ ...formData, image: '' })}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="upload-label">
                      <Upload size={32} />
                      <span>{uploading ? 'Uploading...' : 'Click to upload image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        style={{ display: 'none' }}
                      />
                    </label>
                  )}
                </div>
                <small style={{ color: '#666', fontSize: '12px' }}>This image will be shown in the cart and orders</small>
              </div>

              <div className="form-group">
                <label>Game Sprite (Optional)</label>
                <div className="image-upload-area">
                  {formData.gameSprite ? (
                    <div className="image-preview">
                      <img src={formData.gameSprite} alt="Sprite Preview" />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => setFormData({ ...formData, gameSprite: '' })}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="upload-label">
                      <Upload size={32} />
                      <span>{uploading ? 'Uploading sprite...' : 'Click to upload sprite sheet'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSpriteUpload}
                        disabled={uploading}
                        style={{ display: 'none' }}
                      />
                    </label>
                  )}
                </div>
                <small style={{ color: '#666', fontSize: '12px' }}>Upload a horizontal sprite sheet for fishing game animation</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Sprite Frames</label>
                  <input
                    type="number"
                    value={formData.spriteFrames}
                    onChange={(e) => setFormData({ ...formData, spriteFrames: e.target.value })}
                    placeholder="8"
                    min="1"
                  />
                  <small style={{ color: '#666', fontSize: '12px' }}>Number of animation frames</small>
                </div>

                <div className="form-group">
                  <label>Sprite Width (px)</label>
                  <input
                    type="number"
                    value={formData.spriteWidth}
                    onChange={(e) => setFormData({ ...formData, spriteWidth: e.target.value })}
                    placeholder="64"
                    min="16"
                  />
                  <small style={{ color: '#666', fontSize: '12px' }}>Width of each frame in pixels</small>
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  />
                  <span>Mark as available</span>
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingFish ? 'Update Fish' : 'Add Fish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FishManagement;
