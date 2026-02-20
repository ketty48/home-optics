import express from 'express';
import { verifyPayment } from '../controllers/paymentController';

const router = express.Router();

// Route to verify payment
router.post('/verify', verifyPayment);

export default router;