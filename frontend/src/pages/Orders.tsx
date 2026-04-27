import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, XCircle, CheckCircle, CreditCard, Loader, Search, Mail, Package } from 'lucide-react';
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
  // true once a guest has successfully searched (so we don't re-show the promo panel)
  const [guestSearchDone, setGuestSearchDone] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

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
        setOrders([]);
        toast.error(message);
      } finally {
        setIsTracking(false);
      }
    } else {
      // Assume it's an Order ID — navigate directly to the detail page
      navigate(`/order/${query}`);
    }
  };

  // Called from the guest promo panel's dedicated email input
  const handleGuestEmailSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = trackInput.trim();
    if (!email) {
      emailInputRef.current?.focus();
      return;
    }
    setIsTracking(true);
    setError('');
    try {
      const { data } = await apiClient.post('/orders/guest/track', { email });
      setOrders(data.data);
      setGuestSearchDone(true);
      const newIds = data.data.map((o: Order) => o._id);
      localStorage.setItem('guestOrderIds', JSON.stringify(newIds));
      toast.success(`Found ${data.data.length} order(s) for this email.`);
    } catch (err: any) {
      const message = err.response?.data?.message || 'No orders found for this email.';
      setError(message);
      setOrders([]);
      toast.error(message);
    } finally {
      setIsTracking(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Loader className="w-10 h-10 animate-spin text-blue-600" />
    </div>
  );

  // Guest with no orders yet → show prominent email lookup panel
  const showGuestPanel = !isAuthenticated && orders.length === 0 && !guestSearchDone;

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900 m-0">
          {isAuthenticated ? 'My Orders' : 'Track Your Order'}
        </h1>

        {/* Top search bar — always visible for quick Order-ID or email lookup */}
        <form onSubmit={handleTrackOrder} className="flex w-full md:w-auto gap-2">
          <input
            type="text"
            value={trackInput}
            onChange={(e) => setTrackInput(e.target.value)}
            placeholder="Enter email or Order ID"
            className="flex-1 md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          />
          <button
            type="submit"
            disabled={isTracking}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 w-28 disabled:opacity-60 text-sm"
          >
            {isTracking ? <Loader size={16} className="animate-spin" /> : <><Search size={16} /> Search</>}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-center text-sm">{error}</div>
      )}

      {/* ── Guest promo panel ── */}
      {showGuestPanel && (
        <div style={{ fontFamily: "'Nunito','Segoe UI',sans-serif" }}>
          <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header strip */}
            <div style={{ background: 'linear-gradient(135deg,#1a56db,#3b82f6)', padding: '28px 32px' }}>
              <div className="flex items-center gap-3 mb-2">
                <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', padding: 10 }}>
                  <Package style={{ width: 24, height: 24, color: 'white' }} />
                </div>
                <h2 style={{ color: 'white', fontWeight: 900, fontSize: 20, margin: 0 }}>Find Your Order</h2>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, margin: 0 }}>
                Enter the email address you used at checkout to view all your orders.
              </p>
            </div>

            {/* Form */}
            <div style={{ padding: '28px 32px' }}>
              <form onSubmit={handleGuestEmailSearch}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                  Email Address
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Mail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9ca3af', pointerEvents: 'none' }} />
                    <input
                      ref={emailInputRef}
                      type="email"
                      required
                      value={trackInput}
                      onChange={(e) => setTrackInput(e.target.value)}
                      placeholder="you@example.com"
                      style={{ width: '100%', paddingLeft: 38, paddingRight: 12, paddingTop: 10, paddingBottom: 10, border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                      onFocus={e => (e.target.style.borderColor = '#1a56db')}
                      onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isTracking}
                    style={{ backgroundColor: '#1a56db', color: 'white', padding: '10px 20px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 14, cursor: isTracking ? 'not-allowed' : 'pointer', opacity: isTracking ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
                  >
                    {isTracking ? <Loader size={15} className="animate-spin" /> : <><Search size={15} /> Find Orders</>}
                  </button>
                </div>
              </form>

              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#6b7280' }}>Have an Order ID?</span>
                <button
                  type="button"
                  onClick={() => emailInputRef.current?.focus()}
                  style={{ fontSize: 12, color: '#1a56db', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  onFocus={() => {}}
                >
                  Enter it in the search bar above
                </button>
              </div>

              {error && (
                <div style={{ marginTop: 14, backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>
                  {error}
                </div>
              )}
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#9ca3af' }}>
            Want to save your orders?{' '}
            <Link to="/register" style={{ color: '#1a56db', fontWeight: 700, textDecoration: 'none' }}>Create an account</Link>
            {' '}or{' '}
            <Link to="/login" style={{ color: '#1a56db', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      )}

      {/* ── "no results after search" empty state ── */}
      {!showGuestPanel && orders.length === 0 && !loading && !error && (
        <div className="bg-white p-12 rounded-lg shadow-sm text-center border border-gray-200">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-blue-300" />
          </div>
          <p className="text-gray-700 font-semibold mb-2">No orders found</p>
          <p className="text-sm text-gray-500 mb-6">
            {isAuthenticated
              ? "You haven't placed any orders yet."
              : 'No orders matched that email. Try a different address, or enter your Order ID in the search bar.'}
          </p>
          <Link to="/shop" className="text-blue-600 hover:underline text-sm font-semibold">Start Shopping</Link>
        </div>
      )}

      {/* ── Orders table ── */}
      {orders.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
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
          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-gray-100">
            {orders.map((order) => (
              <div key={order._id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 text-sm">#{order._id.slice(-6).toUpperCase()}</span>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{order.status}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                  <span className="font-semibold text-gray-900">Fr {order.totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  {order.isPaid ? <span className="text-green-600 flex items-center gap-1 text-xs"><CheckCircle size={13} /> Paid</span> : <span className="text-red-500 flex items-center gap-1 text-xs"><XCircle size={13} /> Not Paid</span>}
                  <div className="flex items-center gap-3">
                    <Link to={`/order/${order._id}`} className="text-blue-600 flex items-center gap-1 text-xs font-semibold"><Eye size={14} /> Details</Link>
                    {!order.isPaid && order.paymentMethod === 'Online' && order.status !== 'Cancelled' && (
                      <button onClick={() => handlePayNow(order._id)} disabled={payingId === order._id} className="text-green-600 flex items-center gap-1 text-xs font-semibold disabled:opacity-50">
                        {payingId === order._id ? <Loader size={13} className="animate-spin" /> : <><CreditCard size={13} /> Pay Now</>}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
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