import express from 'express';
import Address from '../models/Address.js';
import User from '../models/User.js';
import { verifyUser } from '../middleware/auth.js';

const router = express.Router();

// Get all addresses for logged-in user
router.get('/', verifyUser, async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user._id }).sort({ isDefault: -1, createdAt: -1 });

    res.json({
      success: true,
      addresses
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Add new address
router.post('/', verifyUser, async (req, res) => {
  try {
    const { fullName, phone, addressLine1, addressLine2, city, state, pincode, landmark, addressType, isDefault } = req.body;

    // Validate required fields
    if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // If this address is set as default, remove default from other addresses
    if (isDefault) {
      await Address.updateMany(
        { userId: req.user._id },
        { isDefault: false }
      );
    }

    const address = new Address({
      userId: req.user._id,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      landmark,
      addressType: addressType || 'Home',
      isDefault: isDefault || false
    });

    await address.save();

    // Add address reference to user
    await User.findByIdAndUpdate(req.user._id, {
      $push: { addresses: address._id }
    });

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      address
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Update address
router.put('/:id', verifyUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone, addressLine1, addressLine2, city, state, pincode, landmark, addressType, isDefault } = req.body;

    const address = await Address.findOne({ _id: id, userId: req.user._id });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // If this address is set as default, remove default from other addresses
    if (isDefault && !address.isDefault) {
      await Address.updateMany(
        { userId: req.user._id, _id: { $ne: id } },
        { isDefault: false }
      );
    }

    // Update fields
    if (fullName) address.fullName = fullName;
    if (phone) address.phone = phone;
    if (addressLine1) address.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) address.addressLine2 = addressLine2;
    if (city) address.city = city;
    if (state) address.state = state;
    if (pincode) address.pincode = pincode;
    if (landmark !== undefined) address.landmark = landmark;
    if (addressType) address.addressType = addressType;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await address.save();

    res.json({
      success: true,
      message: 'Address updated successfully',
      address
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Delete address
router.delete('/:id', verifyUser, async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Remove address reference from user
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { addresses: id }
    });

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Set address as default
router.patch('/:id/set-default', verifyUser, async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findOne({ _id: id, userId: req.user._id });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Remove default from all addresses
    await Address.updateMany(
      { userId: req.user._id },
      { isDefault: false }
    );

    // Set this address as default
    address.isDefault = true;
    await address.save();

    res.json({
      success: true,
      message: 'Default address updated successfully',
      address
    });
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

export default router;
