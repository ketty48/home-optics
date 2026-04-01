import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, XCircle, CheckCircle, CreditCard, Loader, Search } from 'lucide-react';
import apiClient from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { Order } from '../types';
import toast from 'react-hot-toast';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payingId, setPayingId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [trackInput, setTrackInput] = useState('');
  const [isTracking, setIsTracking] = useState(false);

  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setError('');
        setLoading(true);
        if (isAuthenticated) {
          const params = new URLSearchParams(searchParams);
          const { data } = await apiClient.get(`/orders/myorders?${params.toString()}`);
          setOrders(data.data);
          setTotalPages(data.totalPages);
          setCurrentPage(data.currentPage);
        } else {
          // Guest user flow
          const guestOrderIds = JSON.parse(localStorage.getItem('guestOrderIds') || '[]');
          if (guestOrderIds.length > 0) {
            const { data } = await apiClient.post('/orders/guest/myorders', { orderIds: guestOrderIds });
            setOrders(data.data);
          } else {
            setOrders([]); // No orders for guest
          }
          setTotalPages(1); // No pagination for guests for now
          setCurrentPage(1);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [searchParams, isAuthenticated]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(page));
    setSearchParams(params);
  };

  const handlePayNow = async (orderId: string) => {
    setPayingId(orderId);
    try {
      const { data } = await apiClient.post(`/orders/${orderId}/retry-payment`);
      if (data.data.paymentUrl) {
        toast.success('Redirecting to payment...');
        window.location.href = data.data.paymentUrl;
      } else {
        toast.error('Could not generate payment link');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setPayingId(null);
    }
  };

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = trackInput.trim();
    if (!query) return;

    // Check if input is an email
    if (query.includes('@') && query.includes('.')) {
      setIsTracking(true);
      setError('');
      try {
        const { data } = await apiClient.post('/orders/guest/track', { email: query });
        setOrders(data.data);
        toast.success(`Found ${data.data.length} order(s) for this email.`);
        
        // Persist the found order IDs for the guest session
        const newGuestOrderIds = data.data.map((o: Order) => o._id);
        localStorage.setItem('guestOrderIds', JSON.stringify(newGuestOrderIds));

      } catch (err: any) {
        const message = err.response?.data?.message || 'Could not find orders for this email.';
        setError(message);
        setOrders([]); // Clear orders list on error
        toast.error(message);
      } finally {
        setIsTracking(false);
      }
    } else {
      // Assume it's an Order ID and navigate
      navigate(`/order/${query}`);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Loader className="w-10 h-10 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900 m-0">My Orders</h1>
        
        <form onSubmit={handleTrackOrder} className="flex w-full md:w-auto gap-2">
          <input
            type="text"
            value={trackInput}
            onChange={(e) => setTrackInput(e.target.value)}
            placeholder="Enter Email or Order ID"
            className="flex-1 md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <button type="submit" disabled={isTracking} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 w-28 disabled:opacity-60">
            {isTracking ? <Loader size={18} className="animate-spin" /> : <><Search size={18} /> Track</>}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-center">{error}</div>
      )}

      {!loading && orders.length === 0 && !error ? (
        <div className="bg-white p-12 rounded-lg shadow-sm text-center border border-gray-200">
          <p className="text-gray-600 mb-4">You have no orders listed here.</p>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">If you placed an order as a guest, use the search bar above with your Order ID to view its details.</p>
          <Link to="/shop" className="text-blue-600 hover:underline">Start Shopping</Link>
        </div>
      ) : orders.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order._id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Fr {order.totalPrice.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {order.isPaid ? <span className="text-green-600 flex items-center gap-1"><CheckCircle size={14} /> Paid</span> : <span className="text-red-600 flex items-center gap-1"><XCircle size={14} /> Not Paid</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{order.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-3">
                      <Link to={`/order/${order._id}`} className="text-blue-600 hover:text-blue-900 flex items-center gap-1"><Eye size={16} /> Details</Link>
                      {!order.isPaid && order.paymentMethod === 'Online' && order.status !== 'Cancelled' && (
                        <button onClick={() => handlePayNow(order._id)} disabled={payingId === order._id} className="text-green-600 hover:text-green-900 flex items-center gap-1 disabled:opacity-50">
                          {payingId === order._id ? (
                            <><Loader size={16} className="animate-spin" /> Processing...</>
                          ) : (
                            <><CreditCard size={16} /> Pay Now</>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {isAuthenticated && totalPages > 1 && (
            <div className="bg-white px-4 py-4 flex items-center justify-center border-t border-gray-200">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    {[...Array(totalPages)].map((_, i) => (
                    <button
                        key={i}
                        onClick={() => handlePageChange(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === i + 1
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        {i + 1}
                    </button>
                    ))}
                </nav>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default Orders;