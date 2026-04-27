import { useEffect, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Package, Truck, CheckCircle, XCircle, Clock, Loader } from 'lucide-react';
import apiClient from '../utils/api';
import { Order, User } from '../types';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [paying, setPaying] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await apiClient.get(`/orders/${id}`);
        setOrder(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load order');
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  // Handle Payment Verification on Redirect
  useEffect(() => {
    const verifyPayment = async () => {
      const params = new URLSearchParams(location.search);
      const status = params.get('status');
      const transaction_id = params.get('transaction_id');

      if (status === 'successful' && transaction_id && id && !verifying) {
        setVerifying(true);
        const toastId = toast.loading('Verifying payment...');
        
        try {
          const { data } = await apiClient.post('/payment/verify', {
            transaction_id,
            orderId: id
          });
          
          setOrder(data.data);
          toast.success('Payment successful!', { id: toastId });
          // Clear query params
          navigate(`/order/${id}`, { replace: true });
        } catch (err: any) {
          toast.error(err.response?.data?.message || 'Payment verification failed', { id: toastId });
        } finally {
          setVerifying(false);
        }
      }
    };

    if (location.search) {
      verifyPayment();
    }
  }, [location, id, navigate]);

  const handleCancelOrder = async () => {
    setShowCancelModal(false);
    setCancelling(true);
    try {
      const res = await apiClient.put(`/orders/${id}/cancel`);
      setOrder(res.data.data);
      toast.success('Order cancelled successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handlePayNow = async () => {
    if (!order) return;

    setPaying(true);
    try {
      // This endpoint regenerates the payment link for an existing unpaid order.
      const res = await apiClient.post(`/orders/${order._id}/retry-payment`);
      const paymentUrl = res.data.data.paymentUrl;

      if (paymentUrl) {
        toast.success('Redirecting to payment...');
        window.location.href = paymentUrl;
      } else {
        throw new Error('Could not retrieve payment link.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex flex-col items-center justify-center">
        <div className="text-red-500 mb-4 text-xl font-semibold">{error || 'Order not found'}</div>
        <Link to="/orders" className="btn btn-primary flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
      </div>
    );
  }

  const user = order.user as User; // This can be null for guest orders
  const guest = order.guestDetails;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom max-w-4xl">
        <div className="mb-6">
          <Link to="/orders" className="text-gray-500 hover:text-primary-600 flex items-center gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to My Orders
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</h1>
              <p className="text-gray-500 text-sm mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
            </div>
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium capitalize
              ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'}`}>
              {order.status === 'Delivered' && <CheckCircle className="w-4 h-4 mr-2" />}
              {order.status === 'Cancelled' && <XCircle className="w-4 h-4 mr-2" />}
              {order.status !== 'Delivered' && order.status !== 'Cancelled' && <Clock className="w-4 h-4 mr-2" />}
              {order.status}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-500" />
                <h2 className="font-semibold text-gray-900">Order Items</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {order.orderItems.map((item, index) => (
                  <div key={index} className="p-6 flex items-center gap-4">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-contain object-center"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900">
                        <Link to={`/product/${item.product}`} className="hover:underline">
                          {item.name}
                        </Link>
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Qty: {item.qty} × Fr {item.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right font-medium text-gray-900">
                      Fr {(item.qty * item.price).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Notes */}
            {order.orderNotes && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                  <h2 className="font-semibold text-gray-900">Order Notes</h2>
                </div>
                <div className="p-6 text-sm text-gray-600 italic">"{order.orderNotes}"</div>
              </div>
            )}

            {/* Shipping & Payment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-gray-500" />
                  <h2 className="font-semibold text-gray-900">Shipping Info</h2>
                </div>
                <div className="p-6 text-sm text-gray-600 space-y-2">
                  <p><span className="font-medium text-gray-900">Name:</span> {user ? `${user.firstName} ${user.lastName}` : (guest ? `${guest.firstName} ${guest.lastName}` : 'N/A')}</p>
                  <p><span className="font-medium text-gray-900">Phone:</span> {order.shippingAddress.phone}</p>
                  {guest?.email && (
                    <p><span className="font-medium text-gray-900">Email:</span> {guest.email}</p>
                  )}
                  <p><span className="font-medium text-gray-900">Address:</span><br />
                    {order.shippingAddress.address}<br />
                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                    {order.shippingAddress.country}
                  </p>
                  <div className={`mt-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${order.isDelivered ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {order.isDelivered ? `Delivered at ${order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : ''}` : 'Not Delivered'}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-gray-500" />
                  <h2 className="font-semibold text-gray-900">Payment Info</h2>
                </div>
                <div className="p-6 text-sm text-gray-600 space-y-2">
                  <p><span className="font-medium text-gray-900">Method:</span> {order.paymentMethod}</p>
                  <div className={`mt-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${order.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {order.isPaid
                      ? `Paid on ${new Date(order.paidAt!).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}`
                      : 'Not Paid'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 sticky top-24">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-900">Order Summary</h2>
              </div>
              <div className="p-6 space-y-4 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Items Subtotal</span>
                  <span>Fr {order.itemsPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Fr {order.shippingPrice.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between font-bold text-lg text-gray-900">
                  <span>Total</span>
                  <span className="text-primary-600">Fr {order.totalPrice.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="px-6 pb-6 space-y-3">
                {/* Pay Now Button for unpaid online orders */}
                {order.paymentMethod === 'Online' && !order.isPaid && order.status !== 'Cancelled' && (
                  <button
                    onClick={handlePayNow}
                    disabled={paying}
                    className="w-full btn btn-primary flex items-center justify-center gap-2"
                  >
                    {paying ? <><Loader className="w-5 h-5 animate-spin" /> Processing...</> : 'Pay Now'}
                  </button>
                )}

                {/* Cancel Button for pending orders */}
                {order.status === 'Pending' && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    disabled={cancelling}
                    className="w-full btn bg-red-50 text-red-600 hover:bg-red-100 border-red-200">
                    {cancelling ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showCancelModal}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        confirmLabel="Yes, Cancel Order"
        onConfirm={handleCancelOrder}
        onCancel={() => setShowCancelModal(false)}
      />
    </div>
  );
};

export default OrderDetails;