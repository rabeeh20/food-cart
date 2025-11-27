import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { generateOTP, sendOTPEmail } from '../utils/email.js';
import { verifyUser } from '../middleware/auth.js';

const router = express.Router();

// Request OTP for login/signup
router.post('/request-otp', async (req, res) => {
  try {
    let { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Normalize email
    email = email.trim().toLowerCase();

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address. Please enter a valid email.'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log(`🔐 OTP for ${email}: ${otp} (Expires in 10 minutes)`);

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email });
    }

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP Email
    const emailResult = await sendOTPEmail(email, otp);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: emailResult.error || 'Failed to send OTP. Please try again.'
      });
    }

    res.json({
      success: true,
      message: 'OTP sent successfully to your email'
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
    let { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // Normalize email
    email = email.trim().toLowerCase();

    const user = await User.findOne({ email });

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
      { id: user._id, email: user.email, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
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
    const { name, email } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (email) {
      // Normalize email
      let normalizedEmail = email.trim().toLowerCase();
      user.email = normalizedEmail;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
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
