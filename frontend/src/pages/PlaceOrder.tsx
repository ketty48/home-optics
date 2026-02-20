import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import apiClient from '../utils/api';
import toast from 'react-hot-toast';
import { Loader, Package, Truck, CreditCard, AlertCircle, User as UserIcon, Edit } from 'lucide-react';

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  const [shippingAddress, setShippingAddress] = useState<any>(null);
  const [guestDetails, setGuestDetails] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Price calculations
  const itemsPrice = getTotalPrice();
  // The backend will ultimately set the final shipping price. This is for display purposes.
  const shippingPrice = shippingAddress?.country === 'Rwanda' ? 0 : 5000; // Example shipping cost
  const taxPrice = Math.round(0.18 * itemsPrice); // 18% VAT
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  useEffect(() => {
    const storedShippingAddress = localStorage.getItem('shippingAddress');
    const storedPaymentMethod = localStorage.getItem('paymentMethod');
    const storedGuestDetails = localStorage.getItem('guestDetails');
    const storedOrderNotes = localStorage.getItem('orderNotes');
    // guestDetails are optional (only for guests), so we don't block if missing

    if (!storedShippingAddress) {
      toast.error('Please provide a shipping address.');
      navigate('/checkout');
      return;
    }
    if (items.length === 0) {
        navigate('/cart');
        return;
    }

    setShippingAddress(JSON.parse(storedShippingAddress));
    if (storedGuestDetails) {
      setGuestDetails(JSON.parse(storedGuestDetails));
    }
    if (storedOrderNotes) {
      setOrderNotes(JSON.parse(storedOrderNotes));
    }
    setPaymentMethod(JSON.parse(storedPaymentMethod || '""'));
  }, [navigate, items, isAuthenticated]);

  const placeOrderHandler = async () => {
    setLoading(true);
    setError('');
    try {
      const storedGuestDetails = localStorage.getItem('guestDetails');
      const guestDetails = storedGuestDetails ? JSON.parse(storedGuestDetails) : undefined;

      const orderItems = items.map(item => ({
        name: item.name,
        qty: item.quantity,
        image: item.images?.find((img: any) => img.isMain)?.url || item.images?.[0]?.url || '/placeholder.png',
        price: item.price,
        product: item._id,
      }));

      const orderData = {
        orderItems,
        shippingAddress,
        guestDetails,
        orderNotes,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      };

      const { data } = await apiClient.post('/orders', orderData);
      // The backend now returns the order and an optional paymentUrl
      const createdOrder = data.data.order;
      const paymentUrl = data.data.paymentUrl;

      // If it's a guest order, save the ID to local storage to allow viewing later
      if (!isAuthenticated) {
        const guestOrderIds = JSON.parse(localStorage.getItem('guestOrderIds') || '[]');
        guestOrderIds.push(createdOrder._id);
        localStorage.setItem('guestOrderIds', JSON.stringify(guestOrderIds));
      }

      clearCart();
      localStorage.removeItem('shippingAddress');
      localStorage.removeItem('paymentMethod');
      localStorage.removeItem('guestDetails');
      localStorage.removeItem('orderNotes');

      if (paymentMethod !== 'CashOnDelivery' && paymentUrl) {
        // For online payments, redirect to Flutterwave
        toast.success('Order placed! Redirecting to payment...');
        window.location.href = paymentUrl;
      } else {
        // For Cash on Delivery, go to the order details page
        toast.success('Order placed successfully!');
        navigate(`/order/${createdOrder._id}`);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to place order. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!shippingAddress || !paymentMethod || (!guestDetails && !isAuthenticated)) {
    return null; // Or a loading spinner, while useEffect redirects
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Review Your Order</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserIcon className="w-5 h-5 text-gray-500" />
                  <h2 className="font-semibold text-gray-900">Contact Information</h2>
                </div>
                <Link to="/checkout" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <Edit className="w-3 h-3" /> Edit
                </Link>
              </div>
              <div className="p-6 text-sm text-gray-600 space-y-2">
                <p><strong className="font-medium text-gray-900">Name:</strong> {isAuthenticated ? `${user?.firstName} ${user?.lastName}` : `${guestDetails?.firstName} ${guestDetails?.lastName}`}</p>
                <p><strong className="font-medium text-gray-900">Email:</strong> {isAuthenticated ? user?.email : guestDetails?.email}</p>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-gray-500" />
                  <h2 className="font-semibold text-gray-900">Shipping Details</h2>
                </div>
                <Link to="/checkout" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <Edit className="w-3 h-3" /> Edit
                </Link>
              </div>
              <div className="p-6 text-sm text-gray-600 space-y-2">
                <p><strong className="font-medium text-gray-900">Address:</strong> {shippingAddress.address}, {shippingAddress.city}, {shippingAddress.postalCode}</p>
                <p><strong className="font-medium text-gray-900">Country:</strong> {shippingAddress.country}</p>
                <p><strong className="font-medium text-gray-900">Phone:</strong> {shippingAddress.phone}</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-500" />
                  <h2 className="font-semibold text-gray-900">Payment Method</h2>
                </div>
                <Link to="/checkout" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <Edit className="w-3 h-3" /> Edit
                </Link>
              </div>
              <div className="p-6 text-sm text-gray-600">
                <p><strong className="font-medium text-gray-900">Method:</strong> {paymentMethod === 'CashOnDelivery' ? 'Cash on Delivery' : 'Online Payment'}</p>
              </div>
            </div>

            {/* Order Notes */}
            {orderNotes && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
                  <h2 className="font-semibold text-gray-900">Order Notes</h2>
                </div>
                <div className="p-6 text-sm text-gray-600 italic">"{orderNotes}"</div>
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
                <Package className="w-5 h-5 text-gray-500" />
                <h2 className="font-semibold text-gray-900">Order Items</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item._id} className="p-6 flex items-center gap-4">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                      <img
                        src={item.images?.find((img: any) => img.isMain)?.url || item.images?.[0]?.url || '/placeholder.png'}
                        alt={item.name}
                        className="h-full w-full object-contain object-center"
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-sm">
                      <h4 className="text-sm font-medium text-gray-900">
                        <Link to={`/product/${item.slug}`} className="hover:underline">
                          {item.name}
                        </Link>
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.quantity} × Fr {item.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right font-medium text-gray-900">
                      Fr {(item.quantity * item.price).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 sticky top-24">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-900">Order Summary</h2>
              </div>
              <div className="p-6 space-y-4 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Items Subtotal</span>
                  <span className="font-medium text-gray-900">Fr {itemsPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium text-gray-900">Fr {shippingPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (18%)</span>
                  <span className="font-medium text-gray-900">Fr {taxPrice.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between font-bold text-lg text-gray-900">
                  <span>Total</span>
                  <span className="text-blue-600 font-bold">Fr {totalPrice.toLocaleString()}</span>
                </div>
              </div>
              
              {error && (
                <div className="px-6 pb-4">
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                  </div>
                </div>
              )}

              <div className="p-6">
                <button 
                  onClick={placeOrderHandler} 
                  disabled={loading || items.length === 0}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader className="w-5 h-5 animate-spin" /> : (paymentMethod !== 'CashOnDelivery' ? 'Proceed to Payment' : 'Place Order')}
                </button>
                {paymentMethod !== 'CashOnDelivery' && (
                  <p className="text-xs text-center text-gray-500 mt-3">
                    You will be redirected to Flutterwave to complete your payment securely.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;