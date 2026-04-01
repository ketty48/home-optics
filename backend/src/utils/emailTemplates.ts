import { IOrder } from '../models/Order';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * Generates the order confirmation email for the customer.
 */
export const customerConfirmationTemplate = (order: IOrder, customerName: string): { subject: string; html: string; text: string } => {
  const orderId = order._id.toString().slice(-8).toUpperCase();
  const subject = `Order Confirmation #${orderId} from HomeOptics`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2>Thank you for your order, ${customerName}!</h2>
      <p>Your order <strong>#${orderId}</strong> has been placed successfully.</p>
      <p>We've received it and will begin processing it shortly. We will notify you again once your items have been shipped.</p>
      <h3>Order Summary:</h3>
      <p><strong>Total:</strong> RWF ${order.totalPrice.toLocaleString()}</p>
      <p><strong>Payment Method:</strong> ${order.paymentMethod === 'CashOnDelivery' ? 'Cash on Delivery' : 'Online Payment'}</p>
      <br/>
      <a href="${FRONTEND_URL}/order/${order._id}" style="background-color: #1a56db; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px;">View Your Order</a>
      <p style="margin-top: 20px; font-size: 12px; color: #777;">Thank you for shopping with HomeOptics!</p>
    </div>
  `;
  const text = `Thank you for your order, ${customerName}! Your order #${orderId} has been placed successfully. Total: RWF ${order.totalPrice.toLocaleString()}. View your order: ${FRONTEND_URL}/order/${order._id}`;
  return { subject, html, text };
};

/**
 * Generates the payment confirmation email for the customer.
 */
export const paymentConfirmationTemplate = (order: IOrder, customerName: string): { subject: string; html: string; text: string } => {
  const orderId = order._id.toString().slice(-8).toUpperCase();
  const subject = `Payment Confirmed for Order #${orderId} - HomeOptics`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2>Payment Confirmed, ${customerName}!</h2>
      <p>We've received your payment for order <strong>#${orderId}</strong>. Your order is now being processed.</p>
      <h3>Payment Summary:</h3>
      <p><strong>Amount Paid:</strong> RWF ${order.totalPrice.toLocaleString()}</p>
      <p><strong>Transaction ID:</strong> ${order.paymentResult?.id || 'N/A'}</p>
      <p><strong>Date:</strong> ${order.paidAt ? new Date(order.paidAt).toLocaleString() : 'N/A'}</p>
      <br/>
      <a href="${FRONTEND_URL}/order/${order._id}" style="background-color: #057a55; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px;">Track Your Order</a>
      <p style="margin-top: 20px; font-size: 12px; color: #777;">Thank you for shopping with HomeOptics!</p>
    </div>
  `;
  const text = `Payment Confirmed! Your payment of RWF ${order.totalPrice.toLocaleString()} for order #${orderId} has been received. Track your order: ${FRONTEND_URL}/order/${order._id}`;
  return { subject, html, text };
};

/**
 * Generates the new order notification for the admin.
 */
export const adminNotificationTemplate = (order: IOrder): { subject: string; html: string; text: string } => {
  const orderId = order._id.toString().slice(-8).toUpperCase();
  const subject = `[New Order] A new order #${orderId} has been placed!`;
  const html = `
    <h1>New Order Received!</h1>
    <p>A new order <strong>#${orderId}</strong> has been placed for a total of <strong>RWF ${order.totalPrice.toLocaleString()}</strong>.</p>
    <p>Please log in to the admin dashboard to view the details and process the order.</p>
  `;
  const text = `New Order Received! Order #${orderId}. Total: RWF ${order.totalPrice.toLocaleString()}.`;
  return { subject, html, text };
};