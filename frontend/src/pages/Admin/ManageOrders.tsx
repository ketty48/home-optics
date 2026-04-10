import { useEffect, useState } from 'react';
import {
  Clock, Package, Truck, CheckCircle, XCircle,
  ChevronDown, Loader, Search, ChevronLeft, ChevronRight, ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../utils/api';

interface OrderItem {
  name: string;
  qty: number;
  price: number;
  image: string;
}

interface Order {
  _id: string;
  guestDetails?: { firstName: string; lastName: string; email: string };
  user?: { firstName: string; lastName: string; email: string } | string;
  orderItems: OrderItem[];
  shippingAddress: { address: string; city: string; country: string; phone: string };
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
  paymentMethod: string;
}

const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const;

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  Pending:    { icon: Clock,       color: 'text-yellow-700', bg: 'bg-yellow-100' },
  Processing: { icon: Package,     color: 'text-blue-700',   bg: 'bg-blue-100'   },
  Shipped:    { icon: Truck,       color: 'text-purple-700', bg: 'bg-purple-100' },
  Delivered:  { icon: CheckCircle, color: 'text-green-700',  bg: 'bg-green-100'  },
  Cancelled:  { icon: XCircle,     color: 'text-red-700',    bg: 'bg-red-100'    },
};

const getCustomerName = (order: Order) => {
  if (order.guestDetails) return `${order.guestDetails.firstName} ${order.guestDetails.lastName}`;
  if (order.user && typeof order.user === 'object') return `${order.user.firstName} ${order.user.lastName}`;
  return 'Guest';
};

const PAGE_SIZE = 15;

const ManageOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchOrders = async (p: number, status: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(PAGE_SIZE) });
      if (status !== 'All') params.set('status', status);
      const res = await apiClient.get(`/orders?${params}`);
      setOrders(res.data.data);
      setTotalOrders(res.data.totalOrders ?? res.data.data.length);
      setTotalPages(res.data.totalPages ?? 1);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(page, filterStatus); }, [page, filterStatus]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await apiClient.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus as Order['status'] } : o))
      );
      toast.success(`Order updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    setPage(1);
    setExpandedId(null);
  };

  const filtered = search.trim()
    ? orders.filter((o) => {
        const q = search.toLowerCase();
        return o._id.toLowerCase().includes(q) || getCustomerName(o).toLowerCase().includes(q);
      })
    : orders;

  // Reusable status dropdown
  const StatusSelect = ({ order }: { order: Order }) => {
    const isUpdating = updatingId === order._id;
    return (
      <div className="relative inline-block">
        <select
          disabled={isUpdating}
          value={order.status}
          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
          className="text-xs border border-gray-200 rounded-lg pl-2 pr-6 py-1 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer disabled:opacity-50 w-full"
        >
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {isUpdating
          ? <Loader size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 animate-spin text-gray-400 pointer-events-none" />
          : <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        }
      </div>
    );
  };

  // Reusable expandable detail panel
  const OrderDetail = ({ order }: { order: Order }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs p-3 bg-gray-50 rounded-xl border border-gray-100">
      <div>
        <p className="font-semibold text-gray-700 mb-2">Items ({order.orderItems.length})</p>
        <div className="space-y-1.5">
          {order.orderItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-white rounded-lg p-2 border border-gray-100">
              <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{item.name}</p>
                <p className="text-gray-400">Qty: {item.qty} · Fr {item.price.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="font-semibold text-gray-700 mb-2">Shipping</p>
        <div className="bg-white rounded-lg p-3 border border-gray-100 text-gray-600 space-y-1">
          <p>{order.shippingAddress.address}</p>
          <p>{order.shippingAddress.city}, {order.shippingAddress.country}</p>
          <p>📞 {order.shippingAddress.phone}</p>
          <p className="pt-1 font-medium text-gray-700">Payment: {order.paymentMethod}</p>
          {order.isPaid && order.paidAt && (
            <p className="text-green-600">Paid: {new Date(order.paidAt).toLocaleDateString()}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-3 sm:p-6 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{totalOrders} total orders</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-3 space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
        <div className="relative sm:flex-1 sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID or name…"
            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['All', ...STATUS_OPTIONS].map((s) => (
            <button
              key={s}
              onClick={() => handleFilterChange(s)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                filterStatus === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table + Cards */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-14 text-center text-gray-400 text-sm">No orders found.</div>
        ) : (
          <>
            {/* ── Desktop table (sm and up) ── */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">Total</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((order) => {
                    const cfg = statusConfig[order.status] ?? statusConfig['Pending'];
                    const StatusIcon = cfg.icon;
                    const isExpanded = expandedId === order._id;
                    return (
                      <>
                        <tr key={order._id} className={`hover:bg-gray-50 transition-colors ${isExpanded ? 'bg-blue-50/20' : ''}`}>
                          <td className="px-4 py-3 font-mono text-xs text-gray-400">#{order._id.slice(-6).toUpperCase()}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-800 text-xs">{getCustomerName(order)}</p>
                            <p className="text-xs text-gray-400">{order.user && typeof order.user === 'object' ? 'Registered' : 'Guest'}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-xs text-gray-900">Fr {order.totalPrice.toLocaleString()}</p>
                            <span className={`text-xs font-medium ${order.isPaid ? 'text-green-600' : 'text-red-500'}`}>
                              {order.isPaid ? '✓ Paid' : '✗ Unpaid'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mb-1.5 ${cfg.bg} ${cfg.color}`}>
                              <StatusIcon size={10} />{order.status}
                            </div>
                            <StatusSelect order={order} />
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : order._id)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-0.5"
                            >
                              {isExpanded ? <><ChevronUp size={12} />Hide</> : <><ChevronDown size={12} />View</>}
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${order._id}-exp`}>
                            <td colSpan={6} className="px-4 py-3">
                              <OrderDetail order={order} />
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Mobile cards (below sm) ── */}
            <div className="sm:hidden divide-y divide-gray-100">
              {filtered.map((order) => {
                const cfg = statusConfig[order.status] ?? statusConfig['Pending'];
                const StatusIcon = cfg.icon;
                const isExpanded = expandedId === order._id;
                return (
                  <div key={order._id}>
                    <div className="p-4 space-y-2">
                      {/* Row 1: ID + date + amount */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-gray-400">#{order._id.slice(-6).toUpperCase()}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                            <StatusIcon size={9} />{order.status}
                          </span>
                        </div>
                        <span className="font-bold text-sm text-gray-900">Fr {order.totalPrice.toLocaleString()}</span>
                      </div>

                      {/* Row 2: Customer + paid badge */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{getCustomerName(order)}</p>
                          <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()} · {order.paymentMethod}</p>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {order.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </div>

                      {/* Row 3: Status select + expand */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 max-w-[160px]">
                          <StatusSelect order={order} />
                        </div>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : order._id)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-0.5"
                        >
                          {isExpanded ? <><ChevronUp size={12} />Hide</> : <><ChevronDown size={12} />Details</>}
                        </button>
                      </div>
                    </div>

                    {/* Expandable detail */}
                    {isExpanded && (
                      <div className="px-4 pb-4">
                        <OrderDetail order={order} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const n = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-7 h-7 rounded-lg text-xs font-medium ${n === page ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    {n}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageOrders;
