import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Loader, AlertCircle, ArrowRight, Eye, XCircle } from 'lucide-react';
import apiClient from '../utils/api';
import { Order } from '../types';
import toast from 'react-hot-toast';

const PendingPayments = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payingId, setPayingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnpaidOrders = async () => {
      try {
        setLoading(true);
        // Fetch orders filtered by isPaid=false from the backend
        const { data } = await apiClient.get('/orders/myorders?isPaid=false');
        
        // Further filter for Online orders that haven't been cancelled
        const onlineUnpaid = data.data.filter((o: Order) => o.paymentMethod === 'Online' && o.status !== 'Cancelled');
        setOrders(onlineUnpaid);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load pending payments');
      } finally {
        setLoading(false);
      }
    };

    fetchUnpaidOrders();
  }, []);

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

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }
    setCancellingId(orderId);
    try {
      await apiClient.put(`/orders/${orderId}/cancel`);
      toast.success('Order has been cancelled.');
      setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Loader className="w-10 h-10 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Pending Payments</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm text-center border border-gray-200">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard size={32} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Pending Payments</h2>
          <p className="text-gray-600 mb-6">Great! You have no outstanding online payments.</p>
          <Link to="/shop" className="btn btn-primary inline-flex items-center gap-2">
            Continue Shopping <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.orderItems.length} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                      Fr {order.totalPrice.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        Unpaid
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-4">
                      <Link to={`/order/${order._id}`} className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                        <Eye size={16} /> Details
                      </Link>
                      <button 
                        onClick={() => handlePayNow(order._id)} 
                        disabled={payingId === order._id || cancellingId === order._id}
                        className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1 disabled:opacity-50 transition-colors shadow-sm"
                      >
                        {payingId === order._id ? (
                          <><Loader size={14} className="animate-spin" /> Processing...</>
                        ) : (
                          <><CreditCard size={14} /> Pay Now</>
                        )}
                      </button>
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        disabled={payingId === order._id || cancellingId === order._id}
                        className="text-red-600 hover:text-red-900 flex items-center gap-1 disabled:opacity-50"
                      >
                        {cancellingId === order._id ? (
                          <><Loader size={14} className="animate-spin" /> Cancelling...</>
                        ) : (
                          <><XCircle size={14} /> Cancel</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingPayments;