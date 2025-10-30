import express from 'express';
import MenuItem from '../models/MenuItem.js';
import { verifySuperAdmin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

// Get all menu items (public)
router.get('/', async (req, res) => {
  try {
    const { category, isVeg, available } = req.query;

    let filter = {};

    if (category) {
      filter.category = category;
    }

    if (isVeg !== undefined) {
      filter.isVeg = isVeg === 'true';
    }

    if (available !== undefined) {
      filter.isAvailable = available === 'true';
    } else {
      // By default, show only available items
      filter.isAvailable = true;
    }

    const menuItems = await MenuItem.find(filter).sort({ category: 1, name: 1 });

    res.json({
      success: true,
      count: menuItems.length,
      menuItems
    });
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Get single menu item
router.get('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      menuItem
    });
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Upload image to Cloudinary (Super Admin only)
router.post('/upload-image', verifySuperAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Upload image buffer to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'food-delivery/menu-items',
        resource_type: 'image',
        transformation: [
          { width: 800, height: 600, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({
            success: false,
            message: 'Failed to upload image'
          });
        }

        res.json({
          success: true,
          imageUrl: result.secure_url,
          publicId: result.public_id
        });
      }
    );

    // Write buffer to upload stream
    uploadStream.end(req.file.buffer);

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during image upload'
    });
  }
});

// Add menu item (Super Admin only)
router.post('/', verifySuperAdmin, async (req, res) => {
  try {
    const { name, description, price, image, category, isVeg, isAvailable, stock, preparationTime, tags } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const menuItem = new MenuItem({
      name,
      description,
      price,
      image,
      category,
      isVeg,
      isAvailable,
      stock,
      preparationTime,
      tags
    });

    await menuItem.save();

    // Emit stock update event to all clients
    const io = req.app.get('io');
    io.emit('menu-item-added', menuItem);

    res.status(201).json({
      success: true,
      message: 'Menu item added successfully',
      menuItem
    });
  } catch (error) {
    console.error('Add menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Update menu item (Super Admin only)
router.put('/:id', verifySuperAdmin, async (req, res) => {
  try {
    const { name, description, price, image, category, isVeg, isAvailable, stock, preparationTime, tags } = req.body;

    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    const oldStock = menuItem.stock;

    if (name) menuItem.name = name;
    if (description) menuItem.description = description;
    if (price) menuItem.price = price;
    if (image) menuItem.image = image;
    if (category) menuItem.category = category;
    if (isVeg !== undefined) menuItem.isVeg = isVeg;
    if (isAvailable !== undefined) menuItem.isAvailable = isAvailable;
    if (stock !== undefined) menuItem.stock = stock;
    if (preparationTime) menuItem.preparationTime = preparationTime;
    if (tags) menuItem.tags = tags;

    await menuItem.save();

    // Emit stock update event if stock changed
    if (stock !== undefined && stock !== oldStock) {
      const io = req.app.get('io');
      io.emit('stock-updated', {
        itemId: menuItem._id,
        item: menuItem,
        oldStock,
        newStock: menuItem.stock
      });
    }

    res.json({
      success: true,
      message: 'Menu item updated successfully',
      menuItem
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Delete menu item (Super Admin only)
router.delete('/:id', verifySuperAdmin, async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Get categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await MenuItem.distinct('category');

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

export default router;
