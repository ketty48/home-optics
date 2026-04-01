import { Response } from 'express';
import axios from 'axios';
import { AuthRequest } from '../middleware/auth';
import Order from '../models/Order';
import sendEmail from '../utils/sendEmail';
import { customerConfirmationTemplate, adminNotificationTemplate } from '../utils/emailTemplates';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      guestDetails,
      orderNotes,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400).json({ success: false, message: 'No order items' });
      return;
    }

    const order = new Order({
      orderItems,
      user: req.user?._id, // Will be undefined for guests
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      guestDetails: req.user ? undefined : guestDetails, // Only save guest details if not logged in
      orderNotes,
    });

    const createdOrder = await order.save();

    // Send order confirmation emails (non-blocking)
    const customerName = req.user
      ? `${req.user.firstName} ${req.user.lastName}`
      : createdOrder.guestDetails
        ? `${createdOrder.guestDetails.firstName} ${createdOrder.guestDetails.lastName}`
        : 'Customer';
    const customerEmail = req.user?.email || createdOrder.guestDetails?.email;

    if (customerEmail) {
      const { subject, html, text } = customerConfirmationTemplate(createdOrder, customerName);
      sendEmail({ to: customerEmail, subject, html, text }).catch(console.error);
    }
    if (process.env.ADMIN_EMAIL) {
      const { subject, html, text } = adminNotificationTemplate(createdOrder);
      sendEmail({ to: process.env.ADMIN_EMAIL, subject, html, text }).catch(console.error);
    }

    let paymentUrl = null;
    // If payment is online, initiate payment with Flutterwave
    if (createdOrder.paymentMethod === 'Online') {
      let customerEmail, customerName, customerPhone;
      
      if (req.user) {
        customerEmail = req.user.email;
        customerName = `${req.user.firstName} ${req.user.lastName}`;
        customerPhone = req.user.phone || createdOrder.shippingAddress.phone;
      } else if (createdOrder.guestDetails) {
        customerEmail = createdOrder.guestDetails.email;
        customerName = `${createdOrder.guestDetails.firstName} ${createdOrder.guestDetails.lastName}`;
        customerPhone = createdOrder.shippingAddress.phone;
      } else {
        // Fallback, though guestDetails should exist for guests
        customerEmail = 'guest@safehome.com';
        customerName = 'Guest Customer';
        customerPhone = createdOrder.shippingAddress.phone;
      }

      const payload = {
        tx_ref: `${createdOrder._id}-${Date.now()}`,
        amount: createdOrder.totalPrice,
        currency: "RWF",
        redirect_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order/${createdOrder._id}`,
        customer: {
          email: customerEmail,
          phonenumber: customerPhone,
          name: customerName,
        },
      };

      try {
        const response = await axios.post('https://api.flutterwave.com/v3/payments', payload, {
          headers: {
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
          }
        });
        if (response.data.status === 'success') {
          paymentUrl = response.data.data.link;
        }
      } catch (fwError) {
        console.error("Flutterwave initiation failed:", fwError);
        // Don't fail the whole order creation, just log and proceed without a paymentUrl
      }
    }

    res.status(201).json({
      success: true,
      data: { order: createdOrder, paymentUrl },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Retry payment for an order
// @route   POST /api/orders/:id/retry-payment
// @access  Private
export const retryPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id).populate('user');

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (order.isPaid) {
      res.status(400).json({ success: false, message: 'Order is already paid' });
      return;
    }

    if (order.paymentMethod !== 'Online') {
      res.status(400).json({ success: false, message: 'Order is not eligible for online payment' });
      return;
    }

    // Determine customer details (User or Guest)
    let customerEmail, customerName, customerPhone;
    
    if (order.user) {
      const user = order.user as any;
      customerEmail = user.email;
      customerName = `${user.firstName} ${user.lastName}`;
      customerPhone = user.phone || order.shippingAddress.phone;
    } else if (order.guestDetails) {
      customerEmail = order.guestDetails.email;
      customerName = `${order.guestDetails.firstName} ${order.guestDetails.lastName}`;
      customerPhone = order.shippingAddress.phone;
    } else {
      customerEmail = 'guest@safehome.com';
      customerName = 'Guest Customer';
      customerPhone = order.shippingAddress.phone;
    }

    const payload = {
      tx_ref: `${order._id}-${Date.now()}`,
      amount: order.totalPrice,
      currency: "RWF",
      redirect_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order/${order._id}`,
      customer: {
        email: customerEmail,
        phonenumber: customerPhone,
        name: customerName,
      },
    };

    const response = await axios.post('https://api.flutterwave.com/v3/payments', payload, {
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
      }
    });

    if (response.data.status === 'success') {
      res.status(200).json({
        success: true,
        data: {
          paymentUrl: response.data.data.link
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Could not initiate payment with Flutterwave' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email');

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    // Public access for guest orders, ownership check for user orders
    const isGuestOrder = !order.user;
    const isOwner = req.user && order.user && order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user?.role === 'admin';

    if (isGuestOrder || isOwner || isAdmin) {
      res.status(200).json({ success: true, data: order });
    } else {
      res.status(401).json({ success: false, message: 'Not authorized to view this order' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10; // Set a default limit
    const skip = (page - 1) * limit;

    const query: any = { user: req.user?._id };
    if (req.query.isPaid !== undefined) {
      query.isPaid = req.query.isPaid === 'true';
    }

    const count = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    res.status(200).json({
      success: true,
      data: orders,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get guest orders by IDs
// @route   POST /api/orders/guest/myorders
// @access  Public
export const getGuestOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderIds } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    // Find orders that match the IDs and are guest orders (user is null)
    const orders = await Order.find({
      _id: { $in: orderIds },
      user: null
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Track guest orders by email
// @route   POST /api/orders/guest/track
// @access  Public
export const trackGuestOrdersByEmail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required' });
      return;
    }

    // Find orders that match the email and are guest orders (user is null)
    const orders = await Order.find({
      'guestDetails.email': email,
      user: null
    }).sort({ createdAt: -1 });

    if (orders.length === 0) {
        res.status(404).json({ success: false, message: 'No orders found for this email address.' });
        return;
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error while tracking orders.' });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.isPaid !== undefined) query.isPaid = req.query.isPaid === 'true';

    const count = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'id firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    res.status(200).json({
      success: true,
      data: orders,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalOrders: count,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
export const updateOrderToDelivered = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    order.isDelivered = true;
    order.deliveredAt = new Date();
    order.status = 'Delivered';

    const updatedOrder = await order.save();
    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    // Security check: Only the user who owns the order or an admin can cancel it.
    const isOwner = req.user && order.user && order.user.toString() === req.user._id.toString();
    const isAdmin = req.user?.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(401).json({ success: false, message: 'Not authorized to cancel this order' });
      return;
    }

    if (order.status !== 'Pending') {
      res.status(400).json({ success: false, message: 'Cannot cancel an order that is not pending.' });
      return;
    }

    order.status = 'Cancelled';
    const updatedOrder = await order.save();
    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};