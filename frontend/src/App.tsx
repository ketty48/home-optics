import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Login from './pages/Login';
import ProductDetail from './pages/ProductDetail';
import Register from './pages/Register';
import AddProduct from './pages/Admin/AddProduct';
import EditProduct from './pages/Admin/EditProduct';
import ManageProducts from './pages/Admin/ManageProducts';
import ManageOrders from './pages/Admin/ManageOrders';
import ManageCategories from './pages/Admin/ManageCategories';
import Dashboard from './pages/Admin/Dashboard';
import Categories from './pages/Categories';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import PlaceOrder from './pages/PlaceOrder';
import PendingPayments from './pages/PendingPayment';
import Wishlist from './pages/Wishlist';
import { useAuthStore } from './store/authStore';
import AdminRoute from './components/AdminRoute';

const PublicLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-grow">
      <Outlet />
    </main>
    <Footer />
  </div>
);

function App() {
  const loadUser = useAuthStore((state) => state.loadUser);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Admin routes — renders AdminLayout (sidebar), no public Header/Footer */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/products/add" element={<AddProduct />} />
          <Route path="/admin/products/edit/:id" element={<EditProduct />} />
          <Route path="/admin/products" element={<ManageProducts />} />
          <Route path="/admin/categories" element={<ManageCategories />} />
          <Route path="/admin/orders" element={<ManageOrders />} />
        </Route>

        {/* Public routes — wrapped in Header + Footer */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/placeorder" element={<PlaceOrder />} />
          <Route path="/pending-payments" element={<PendingPayments />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/order/:id" element={<OrderDetails />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="*" element={
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
              <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
              <p className="text-gray-500 mb-8">The page you are looking for doesn't exist or has been moved.</p>
              <a href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Go Back Home</a>
            </div>
          } />
        </Route>
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { background: '#363636', color: '#fff' },
          success: {
            duration: 3000,
            iconTheme: { primary: '#10b981', secondary: '#fff' }
          },
          error: {
            duration: 4000,
            iconTheme: { primary: '#ef4444', secondary: '#fff' }
          }
        }}
      />
    </BrowserRouter>
  );
}

export default App;
