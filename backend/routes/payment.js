import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { verifyUser } from '../middleware/auth.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import MenuItem from '../models/MenuItem.js';
import { sendOrderConfirmation } from '../utils/email.js';

const router = express.Router();

// Lazy initialization of Razorpay
let razorpay = null;
const getRazorpay = () => {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return razorpay;
};

// Create Razorpay order
router.post('/create-order', verifyUser, async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Amount and order ID are required'
      });
    }

    // Verify order exists and belongs to user
    const order = await Order.findOne({ orderId, user: req.user._id });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const options = {
      amount: Math.round(amount * 100), // Amount in paise
      currency: 'INR',
      receipt: orderId,
      payment_capture: 1
    };

    const razorpayOrder = await getRazorpay().orders.create(options);

    // Update order with Razorpay order ID
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order'
    });
  }
});

// Verify payment
router.post('/verify-payment', verifyUser, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification parameters'
      });
    }

    // Generate signature for verification
    const text = razorpay_order_id + '|' + razorpay_payment_id;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    // Verify signature
    if (generated_signature !== razorpay_signature) {
      // Update order as failed
      await Order.findOneAndUpdate(
        { orderId, user: req.user._id },
        { paymentStatus: 'failed' }
      );

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Update order with payment details
    const order = await Order.findOneAndUpdate(
      { orderId, user: req.user._id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paymentStatus: 'completed',
        orderStatus: 'confirmed',
        $push: {
          statusHistory: {
            status: 'confirmed',
            timestamp: new Date(),
            note: 'Payment completed successfully'
          }
        }
      },
      { new: true }
    ).populate('items.menuItem');

    // Reduce stock for each item after successful payment
    const io = req.app.get('io');
    for (const item of order.items) {
      const updatedItem = await MenuItem.findByIdAndUpdate(
        item.menuItem._id,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      // Emit stock update event to all clients
      if (updatedItem) {
        io.emit('stock-updated', {
          itemId: updatedItem._id,
          item: updatedItem,
          newStock: updatedItem.stock
        });
      }
    }

    // Emit order status update to admins and specific user
    io.to('admin').emit('order-updated', {
      order: order,
      message: 'Order payment confirmed'
    });
    io.to(`user:${order.user}`).emit('order-status-changed', {
      orderId: order.orderId,
      status: order.orderStatus,
      paymentStatus: order.paymentStatus
    });

    // Send order confirmation email
    const user = await User.findById(req.user._id);
    if (user && user.email) {
      await sendOrderConfirmation(user.email, {
        orderId: order.orderId,
        totalAmount: order.totalAmount,
        address: order.deliveryAddress.fullAddress || `${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} ${order.deliveryAddress.zip}`
      });
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      order
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed'
    });
  }
});

// Get payment details
router.get('/payment/:paymentId', verifyUser, async (req, res) => {
  try {
    const payment = await getRazorpay().payments.fetch(req.params.paymentId);

    res.json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details'
    });
  }
});

export default router;
