import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, Package, Tag, TrendingUp,
  AlertTriangle, Clock, CheckCircle, Truck,
  XCircle, Plus, ArrowRight,
} from 'lucide-react';
import apiClient from '../../utils/api';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCategories: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
}

interface RecentOrder {
  _id: string;
  guestDetails?: { firstName: string; lastName: string };
  user?: { firstName: string; lastName: string } | string;
  totalPrice: number;
  status: string;
  isPaid: boolean;
  createdAt: string;
  orderItems: { name: string; qty: number }[];
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  Pending:    { label: 'Pending',    icon: Clock,       color: 'text-yellow-700', bg: 'bg-yellow-100' },
  Processing: { label: 'Processing', icon: Package,     color: 'text-blue-700',   bg: 'bg-blue-100'   },
  Shipped:    { label: 'Shipped',    icon: Truck,       color: 'text-purple-700', bg: 'bg-purple-100' },
  Delivered:  { label: 'Delivered',  icon: CheckCircle, color: 'text-green-700',  bg: 'bg-green-100'  },
  Cancelled:  { label: 'Cancelled',  icon: XCircle,     color: 'text-red-700',    bg: 'bg-red-100'    },
};

const StatCard = ({ label, value, icon: Icon, color, bg, to }: {
  label: string; value: string | number; icon: React.ElementType;
  color: string; bg: string; to: string;
}) => (
  <Link
    to={to}
    className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow"
    style={{ textDecoration: 'none' }}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
      <Icon size={20} className={color} />
    </div>
    <div className="min-w-0">
      <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5 truncate">{label}</p>
    </div>
  </Link>
);

const getOrderName = (order: RecentOrder) => {
  if (order.guestDetails) return `${order.guestDetails.firstName} ${order.guestDetails.lastName}`;
  if (order.user && typeof order.user === 'object') return `${order.user.firstName} ${order.user.lastName}`;
  return 'Customer';
};

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [productsRes, ordersRes, categoriesRes] = await Promise.all([
          apiClient.get('/products?limit=500'),
          apiClient.get('/orders?limit=500'),
          apiClient.get('/products/categories/all'),
        ]);

        const products = productsRes.data.data as { stock: number; isActive: boolean }[];
        const orders = ordersRes.data.data as RecentOrder[];
        const categories = categoriesRes.data.data as unknown[];

        const totalRevenue = orders
          .filter((o) => o.isPaid)
          .reduce((sum, o) => sum + o.totalPrice, 0);

        setStats({
          totalProducts: products.length,
          totalOrders: ordersRes.data.totalOrders ?? orders.length,
          totalCategories: categories.length,
          totalRevenue,
          pendingOrders: orders.filter((o) => o.status === 'Pending').length,
          lowStockProducts: products.filter((p) => p.stock <= 5).length,
        });
        setRecentOrders(orders.slice(0, 8));
      } catch {
        // stats stays null
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Welcome back — here's what's happening.</p>
        </div>
        <Link
          to="/admin/products/add"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white flex-shrink-0"
          style={{ backgroundColor: '#1a56db', textDecoration: 'none' }}
        >
          <Plus size={14} />
          <span className="hidden sm:inline">Add Product</span>
          <span className="sm:hidden">Add</span>
        </Link>
      </div>

      {/* Stat cards — 2 cols on mobile, 3 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        <StatCard label="Products"      value={stats?.totalProducts ?? '—'}    icon={ShoppingBag}   color="text-blue-600"   bg="bg-blue-50"   to="/admin/products"   />
        <StatCard label="Orders"        value={stats?.totalOrders ?? '—'}      icon={Package}       color="text-purple-600" bg="bg-purple-50" to="/admin/orders"      />
        <StatCard label="Categories"    value={stats?.totalCategories ?? '—'}  icon={Tag}           color="text-teal-600"   bg="bg-teal-50"   to="/admin/categories"  />
        <StatCard label="Revenue"       value={stats ? `Fr ${stats.totalRevenue.toLocaleString()}` : '—'} icon={TrendingUp} color="text-green-600" bg="bg-green-50" to="/admin/orders" />
        <StatCard label="Pending"       value={stats?.pendingOrders ?? '—'}    icon={Clock}         color="text-yellow-600" bg="bg-yellow-50" to="/admin/orders"      />
        <StatCard label="Low Stock"     value={stats?.lowStockProducts ?? '—'} icon={AlertTriangle} color="text-red-600"    bg="bg-red-50"    to="/admin/products"   />
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Recent Orders</h2>
          <Link
            to="/admin/orders"
            className="flex items-center gap-1 text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
            style={{ textDecoration: 'none' }}
          >
            View all <ArrowRight size={13} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400 text-sm">No orders yet.</div>
        ) : (
          <>
            {/* Desktop table — hidden on mobile */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-5 py-3">Order</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Total</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((order) => {
                    const cfg = statusConfig[order.status] ?? statusConfig['Pending'];
                    const StatusIcon = cfg.icon;
                    return (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 font-mono text-xs text-gray-500">#{order._id.slice(-6).toUpperCase()}</td>
                        <td className="px-5 py-3 font-medium text-gray-800 text-xs">{getOrderName(order)}</td>
                        <td className="px-5 py-3 font-semibold text-gray-900 text-xs">Fr {order.totalPrice.toLocaleString()}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                            <StatusIcon size={10} />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-400 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards — shown only on small screens */}
            <div className="sm:hidden divide-y divide-gray-100">
              {recentOrders.map((order) => {
                const cfg = statusConfig[order.status] ?? statusConfig['Pending'];
                const StatusIcon = cfg.icon;
                return (
                  <div key={order._id} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-xs text-gray-400">#{order._id.slice(-6).toUpperCase()}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                          <StatusIcon size={9} />
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-gray-800 truncate">{getOrderName(order)}</p>
                      <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 flex-shrink-0">Fr {order.totalPrice.toLocaleString()}</p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Products',  desc: 'Edit, activate or delete products',     to: '/admin/products',   icon: ShoppingBag, color: 'text-blue-600',   bg: 'bg-blue-50'   },
          { label: 'Orders',    desc: 'Update order status and track shipments', to: '/admin/orders',     icon: Package,     color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Categories',desc: 'Add or remove product categories',       to: '/admin/categories', icon: Tag,         color: 'text-teal-600',   bg: 'bg-teal-50'   },
        ].map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3"
            style={{ textDecoration: 'none' }}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${item.bg}`}>
              <item.icon size={18} className={item.color} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
              <p className="text-xs text-gray-500 truncate">{item.desc}</p>
            </div>
            <ArrowRight size={15} className="text-gray-300 flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
