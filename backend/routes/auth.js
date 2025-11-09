import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { generateOTP, sendOTPSMS } from '../utils/sms.js';
import { verifyUser } from '../middleware/auth.js';

const router = express.Router();

// Request OTP for login/signup
router.post('/request-otp', async (req, res) => {
  try {
    let { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Normalize phone number - add +91 if not present
    phone = phone.trim();
    if (!phone.startsWith('+91')) {
      phone = '+91' + phone.replace(/^91/, ''); // Remove 91 if present and add +91
    }

    // Validate Indian phone format
    const phoneRegex = /^(\+91)[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number. Please enter a valid Indian mobile number.'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // TEMPORARY: Log OTP for testing when SMS delivery fails
    console.log(`🔐 OTP for ${phone}: ${otp} (Expires in 10 minutes)`);

    // Find or create user
    let user = await User.findOne({ phone });

    if (!user) {
      user = new User({ phone });
    }

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP SMS
    const smsResult = await sendOTPSMS(phone, otp);

    if (!smsResult.success) {
      return res.status(500).json({
        success: false,
        message: smsResult.error || 'Failed to send OTP. Please try again.'
      });
    }

    res.json({
      success: true,
      message: 'OTP sent successfully to your phone'
    });
  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error. Please try again later.'
    });
  }
});

// Verify OTP and login/signup
router.post('/verify-otp', async (req, res) => {
  try {
    let { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required'
      });
    }

    // Normalize phone number
    phone = phone.trim();
    if (!phone.startsWith('+91')) {
      phone = '+91' + phone.replace(/^91/, '');
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please request a new OTP.'
      });
    }

    // Check if OTP is expired
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Verify OTP
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      });
    }

    // Update user verification status
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, phone: user.phone, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Get current user profile
router.get('/profile', verifyUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-otp -otpExpiry');

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Update user profile
router.put('/profile', verifyUser, async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) {
      // Normalize phone number
      let normalizedPhone = phone.trim();
      if (!normalizedPhone.startsWith('+91')) {
        normalizedPhone = '+91' + normalizedPhone.replace(/^91/, '');
      }
      user.phone = normalizedPhone;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

export default router;
