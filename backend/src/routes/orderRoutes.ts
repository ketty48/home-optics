import express from 'express';
import {
  addOrderItems,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderToDelivered,
  cancelOrder,
  retryPayment,
  getGuestOrders,
  trackGuestOrdersByEmail,
} from '../controllers/orderController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// --- Public Routes ---
// These can be accessed by anyone (guests or logged-in users).
// Authorization is handled inside the controller where needed.
router.route('/guest/myorders').post(getGuestOrders);
router.route('/guest/track').post(trackGuestOrdersByEmail); // This was the missing route
router.route('/:id').get(getOrderById);
router.route('/:id/retry-payment').post(retryPayment);
router.route('/').post(addOrderItems); // Public so guests can create orders

// --- Authenticated User Routes ---
// These routes require a user to be logged in.
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id/cancel').put(protect, cancelOrder);

// --- Admin Routes ---
// These routes require a user to be logged in and have an 'admin' role.
router.route('/').get(protect, authorize('admin'), getOrders);
router.route('/:id/deliver').put(protect, authorize('admin'), updateOrderToDelivered);

export default router;