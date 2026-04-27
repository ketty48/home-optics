import express from 'express';
import {
  addOrderItems,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderToDelivered,
  updateOrderStatus,
  cancelOrder,
  retryPayment,
  getGuestOrders,
  trackGuestOrdersByEmail,
} from '../controllers/orderController';
import { protect, optionalProtect, authorize } from '../middleware/auth';

const router = express.Router();

// --- Static-segment routes MUST come before /:id to avoid param shadowing ---

// Public guest routes
router.route('/guest/myorders').post(getGuestOrders);
router.route('/guest/track').post(trackGuestOrdersByEmail);

// Authenticated user routes (static paths first)
router.route('/myorders').get(protect, getMyOrders);

// Root route:
//   POST — optionalProtect so authenticated users get order.user set,
//           but guests (no token) still create orders without a user.
//   GET  — admin only.
router.route('/').post(optionalProtect, addOrderItems);
router.route('/').get(protect, authorize('admin'), getOrders);

// --- Dynamic /:id routes come after all static paths ---

// optionalProtect: sets req.user from JWT if present, but doesn't block guests.
// Required so the controller can verify ownership for authenticated users' orders.
router.route('/:id').get(optionalProtect, getOrderById);
router.route('/:id/retry-payment').post(retryPayment);
router.route('/:id/cancel').put(protect, cancelOrder);
router.route('/:id/deliver').put(protect, authorize('admin'), updateOrderToDelivered);
router.route('/:id/status').put(protect, authorize('admin'), updateOrderStatus);

export default router;