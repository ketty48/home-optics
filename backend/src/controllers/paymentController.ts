import { Request, Response } from 'express';
import axios from 'axios';
import Order from '../models/Order';
import sendEmail from '../utils/sendEmail';
import { paymentConfirmationTemplate } from '../utils/emailTemplates';

export const verifyPayment = async (req: Request, res: Response) => {
  const { transaction_id, orderId } = req.body;

  if (!transaction_id || !orderId) {
    return res.status(400).json({ message: 'Missing transaction_id or orderId' });
  }

  try {
    // 1. Verify the transaction with Flutterwave via Axios
    const response = await axios.get(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
      }
    });

    const { status, amount, currency, customer } = response.data.data;

    if (status === "successful") {
      // 2. Find the order and populate user for email
      const order = await Order.findById(orderId).populate('user', 'firstName lastName email');
      
      if (order) {
        // Prevent re-processing a paid order
        if (order.isPaid) {
          return res.json({ success: true, message: "Order has already been paid", data: order });
        }

        // 3. Check if amount and currency match
        if (amount >= order.totalPrice && currency === "RWF") {
          order.isPaid = true;
          order.paidAt = new Date();
          order.status = 'Processing';
          order.paymentResult = {
            id: transaction_id,
            status: status,
            update_time: new Date().toISOString(),
            email_address: customer.email,
          };

          const updatedOrder = await order.save();

          // Send payment confirmation email (non-blocking)
          const user = order.user as any;
          const customerName = user
            ? `${user.firstName} ${user.lastName}`
            : order.guestDetails
              ? `${order.guestDetails.firstName} ${order.guestDetails.lastName}`
              : 'Customer';
          const customerEmail = user?.email || order.guestDetails?.email || customer.email;

          if (customerEmail) {
            const { subject, html, text } = paymentConfirmationTemplate(updatedOrder, customerName);
            sendEmail({ to: customerEmail, subject, html, text }).catch(console.error);
          }

          return res.json({ success: true, data: updatedOrder });
        }
      }
    }
    
    res.status(400).json({ success: false, message: "Payment verification failed or invalid amount" });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: "Server Error during verification", error: error.message });
  }
};