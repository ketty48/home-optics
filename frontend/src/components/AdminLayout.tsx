import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Tag, Package,
  LogOut, ExternalLink, Menu, X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';

const navItems = [
  { label: 'Dashboard',  to: '/admin/dashboard',  icon: LayoutDashboard, exact: true  },
  { label: 'Products',   to: '/admin/products',   icon: ShoppingBag,     exact: false },
  { label: 'Categories', to: '/admin/categories', icon: Tag,             exact: false },
  { label: 'Orders',     to: '/admin/orders',     icon: Package,         exact: false },
];

const pageTitles: Record<string, string> = {
  '/admin/dashboard':    'Dashboard',
  '/admin/products':     'Products',
  '/admin/products/add': 'Add Product',
  '/admin/categories':   'Categories',
  '/admin/orders':       'Orders',
};

const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const pageTitle =
    Object.entries(pageTitles).find(([path]) =>
      location.pathname === path ||
      (path !== '/admin/dashboard' && location.pathname.startsWith(path))
    )?.[1] ?? 'Admin';

  return (
    // overflow-x-hidden prevents the sliding sidebar from causing a horizontal scrollbar
    <div className="min-h-screen bg-gray-100 overflow-x-hidden">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside
        className={`fixed top-0 left-0 h-screen w-60 z-30 flex flex-col
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ backgroundColor: '#0f172a' }}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 flex-shrink-0">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-2.5"
            style={{ textDecoration: 'none' }}
            onClick={() => setSidebarOpen(false)}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#1a56db' }}
            >
              <span className="text-white font-black text-sm">HO</span>
            </div>
            <span className="text-white font-bold text-sm leading-tight">
              HomeOptics<br />
              <span className="text-slate-400 font-normal text-xs">Admin Panel</span>
            </span>
          </Link>
          <button
            className="lg:hidden text-white/50 hover:text-white p-1 rounded"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 overflow-y-auto space-y-0.5 px-2">
          <p className="px-3 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Menu
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.exact}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-white/10 hover:text-slate-100'
                }`
              }
            >
              <item.icon size={17} className="flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User + bottom actions */}
        <div className="border-t border-white/10 p-3 flex-shrink-0 space-y-0.5">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.firstName?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
          </div>
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            style={{ textDecoration: 'none' }}
          >
            <ExternalLink size={15} />
            View Store
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-5 py-3 flex items-center justify-between sticky top-0 z-10 h-14">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h2 className="font-semibold text-gray-800 text-sm">{pageTitle}</h2>
          </div>
          <span className="hidden sm:inline text-xs text-gray-400">HomeOptics Admin</span>
        </header>

        {/* Page content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
