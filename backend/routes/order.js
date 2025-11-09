import express from 'express';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import Fish from '../models/Fish.js';
import { verifyUser } from '../middleware/auth.js';

const router = express.Router();

// Create new order
router.post('/', verifyUser, async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod, specialInstructions } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    if (!deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: 'Delivery address is required'
      });
    }

    // Validate and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      // Check if it's a fish item
      if (item.isFish && item.variant) {
        // Handle fish item from fishing game
        const fish = await Fish.findById(item.menuItem);

        if (!fish) {
          return res.status(404).json({
            success: false,
            message: `Fish item not found: ${item.menuItem}`
          });
        }

        if (!fish.isAvailable) {
          return res.status(400).json({
            success: false,
            message: `${fish.name} is currently unavailable`
          });
        }

        // Check fish stock
        if (fish.availableStock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `${fish.name} is out of stock`
          });
        }

        // Calculate fish item price based on variant
        const { weight, pricePerKg, preparationPrice } = item.variant;
        const fishPrice = (weight * pricePerKg) + preparationPrice;

        orderItems.push({
          menuItem: fish._id,
          name: `${fish.name} (${item.variant.preparation}) - ${weight}kg`,
          price: fishPrice,
          quantity: item.quantity,
          variant: item.variant,
          isFish: true
        });

        totalAmount += fishPrice * item.quantity;
      } else {
        // Handle regular menu item
        const menuItem = await MenuItem.findById(item.menuItem);

        if (!menuItem) {
          return res.status(404).json({
            success: false,
            message: `Menu item not found: ${item.menuItem}`
          });
        }

        if (!menuItem.isAvailable) {
          return res.status(400).json({
            success: false,
            message: `${menuItem.name} is currently unavailable`
          });
        }

        // Check stock availability
        if (menuItem.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `${menuItem.name} is out of stock or insufficient quantity available`
          });
        }

        orderItems.push({
          menuItem: menuItem._id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: item.quantity
        });

        totalAmount += menuItem.price * item.quantity;
      }
    }

    // Create order
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      paymentMethod: paymentMethod || 'razorpay',
      specialInstructions,
      statusHistory: [{
        status: 'placed',
        timestamp: new Date(),
        note: 'Order placed successfully'
      }]
    });

    await order.save();

    // Emit new order event to admin
    const io = req.app.get('io');
    io.to('admin').emit('new-order', {
      order: order,
      message: `New ${paymentMethod.toUpperCase()} order received!`
    });

    // For COD orders, reduce stock immediately and send email
    if (paymentMethod === 'cod') {
      // Reduce stock for each item
      for (const item of items) {
        if (item.isFish) {
          // Reduce fish stock
          const updatedFish = await Fish.findByIdAndUpdate(
            item.menuItem,
            { $inc: { availableStock: -item.quantity } },
            { new: true }
          );

          // Emit fish stock update event
          if (updatedFish) {
            io.emit('fish-stock-updated', {
              fishId: updatedFish._id,
              fish: updatedFish,
              newStock: updatedFish.availableStock
            });
          }
        } else {
          // Reduce menu item stock
          const updatedItem = await MenuItem.findByIdAndUpdate(
            item.menuItem,
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
      }

      // Email notifications removed - using phone-based SMS OTP authentication now
    }
    // For Razorpay, stock will be reduced after payment verification

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
});

// Get all orders for user
router.get('/', verifyUser, async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;

    let filter = { user: req.user._id };

    if (status) {
      filter.orderStatus = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
      .populate('items.menuItem')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// Get single order
router.get('/:id', verifyUser, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('items.menuItem');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
});

// Cancel order
router.patch('/:id/cancel', verifyUser, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order can be cancelled
    if (['delivered', 'cancelled'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel ${order.orderStatus} order`
      });
    }

    order.orderStatus = 'cancelled';
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: 'Cancelled by customer'
    });

    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order'
    });
  }
});

export default router;
