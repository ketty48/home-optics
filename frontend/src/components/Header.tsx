import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, ChevronDown, Bell, Globe, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import apiClient from '../utils/api';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('All Categories');
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const totalItems = useCartStore((state) => state.getTotalItems());

  const [searchCategories, setSearchCategories] = useState<string[]>(['All Categories']);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiClient.get('/products/categories');
        if (res.data?.data && Array.isArray(res.data.data)) {
          setSearchCategories(['All Categories', ...res.data.data]);
        }
      } catch (error) {
        console.error('Failed to fetch search categories:', error);
      }
    };
    fetchCategories();
  }, []);
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery);
    if (searchCategory && searchCategory !== 'All Categories') params.set('category', searchCategory);
    navigate(`/shop?${params.toString()}`);
  };

  return (
    <header style={{ fontFamily: "'Nunito', 'Segoe UI', sans-serif" }} className="sticky top-0 z-50">
      {/* Top Info Bar */}
      <div style={{ backgroundColor: '#0a1628', color: '#aac4ee', fontSize: 12 }}>
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <MapPin style={{ width: 12, height: 12, color: '#4fa3f7' }} />
              Deliver to Rwanda
            </span>
            <span style={{ color: '#4fa3f7' }}>|</span>
            <span className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
              <Globe style={{ width: 12, height: 12 }} />
              English / RWF
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <span className="cursor-pointer hover:text-white">Sell on Home Optics</span>
            <span style={{ color: '#4fa3f7' }}>|</span>
            <span className="cursor-pointer hover:text-white">Help Center</span>
            <span style={{ color: '#4fa3f7' }}>|</span>
            <Bell style={{ width: 12, height: 12, cursor: 'pointer' }} className="hover:text-white" />
          </div>
        </div>
      </div>

      {/* Main Header — Blue */}
      <div style={{ backgroundColor: '#1a56db' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0" style={{ textDecoration: 'none' }}>
            <div style={{ backgroundColor: 'white', borderRadius: 8, padding: '6px 10px' }}>
              <span style={{ color: '#1a56db', fontWeight: 900, fontSize: 18 }}>HO</span>
            </div>
            <div className="hidden md:block">
              <span style={{ color: 'white', fontWeight: 900, fontSize: 20 }}>Home</span>
              <span style={{ color: '#bdd7ff', fontWeight: 900, fontSize: 20 }}>Optics</span>
            </div>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-3xl">
            <form onSubmit={handleSearch} style={{ display: 'flex', backgroundColor: 'white', borderRadius: 4, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
              <select
                value={searchCategory}
                onChange={e => setSearchCategory(e.target.value)}
                className="hidden md:block"
                style={{ border: 'none', borderRight: '1px solid #e0e7ff', padding: '0 12px', fontSize: 13, color: '#333', backgroundColor: '#f0f4ff', outline: 'none', minWidth: 150 }}
              >
                {searchCategories.map(c => <option key={c}>{c}</option>)}
              </select>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, and more..."
                style={{ flex: 1, padding: '10px 16px', border: 'none', outline: 'none', fontSize: 14 }}
              />
              <button type="submit" style={{ backgroundColor: '#1a56db', color: 'white', padding: '0 22px', border: 'none', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
                className="hover:bg-blue-700 transition-colors">
                <Search style={{ width: 16, height: 16 }} />
                <span className="hidden sm:block" style={{ fontSize: 14 }}>Search</span>
              </button>
            </form>
            {/* Hot searches */}
            <div className="hidden md:flex gap-4 mt-1">
              {['Blenders', 'Air Fryer', 'Smart TV', 'Headphones', 'Hair Dryer'].map(t => (
                <Link key={t} to={`/shop?q=${t}`} style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, textDecoration: 'none' }} className="hover:text-white">{t}</Link>
              ))}
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link to="/cart" style={{ color: 'white', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none' }}>
              <div style={{ position: 'relative' }}>
                <ShoppingCart style={{ width: 24, height: 24 }} />
                {totalItems > 0 && (
                  <span style={{ position: 'absolute', top: -8, right: -8, backgroundColor: '#f59e0b', color: 'white', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>
                    {totalItems}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 10, marginTop: 2 }}>Cart</span>
            </Link>

            {isAuthenticated ? (
              <div className="group" style={{ position: 'relative' }}>
                <button style={{ color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <User style={{ width: 24, height: 24 }} />
                  <span style={{ fontSize: 10, marginTop: 2 }}>{user?.firstName}</span>
                </button>
                <div className="group-hover:!block" style={{ display: 'none', position: 'absolute', right: 0, top: '100%', width: 200, backgroundColor: 'white', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', padding: '8px 0', zIndex: 100 }}>
                  <Link to="/profile" style={{ display: 'block', padding: '8px 16px', fontSize: 13, color: '#333', textDecoration: 'none' }} className="hover:bg-blue-50">My Profile</Link>
                  <Link to="/orders" style={{ display: 'block', padding: '8px 16px', fontSize: 13, color: '#333', textDecoration: 'none' }} className="hover:bg-blue-50">My Orders</Link>
                  <hr style={{ margin: '4px 0', borderColor: '#f0f0f0' }} />
                  <button onClick={logout} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px', fontSize: 13, color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer' }} className="hover:bg-red-50">Logout</button>
                </div>
              </div>
            ) : (
              <Link to="/login" style={{ color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none' }}>
                <User style={{ width: 24, height: 24 }} />
                <span style={{ fontSize: 10, marginTop: 2 }}>Sign In</span>
              </Link>
            )}

            <button className="md:hidden" style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X style={{ width: 24, height: 24 }} /> : <Menu style={{ width: 24, height: 24 }} />}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Sub-Nav */}
      <nav style={{ backgroundColor: '#1648c0' }} className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center">
          <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', backgroundColor: '#0f3a9e', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
            <Menu style={{ width: 16, height: 16 }} />
            All Categories
            <ChevronDown style={{ width: 14, height: 14 }} />
          </button>
          {isAuthenticated && user?.role === 'admin' ? (
            <>
              <Link to="/admin/products" style={{ color: '#bdd7ff', padding: '10px 16px', fontSize: 13, textDecoration: 'none', fontWeight: 600 }} className="hover:text-white hover:bg-white/10">Products</Link>
              <Link to="/admin/categories" style={{ color: '#bdd7ff', padding: '10px 16px', fontSize: 13, textDecoration: 'none', fontWeight: 600 }} className="hover:text-white hover:bg-white/10">Categories</Link>
              <Link to="/admin/orders" style={{ color: '#bdd7ff', padding: '10px 16px', fontSize: 13, textDecoration: 'none', fontWeight: 600 }} className="hover:text-white hover:bg-white/10">Orders</Link>
            </>
          ) : (
            <>
              <Link to="/" style={{ color: '#bdd7ff', padding: '10px 16px', fontSize: 13, textDecoration: 'none', fontWeight: 600 }} className="hover:text-white hover:bg-white/10">Home</Link>
              <Link to="/shop" style={{ color: '#bdd7ff', padding: '10px 16px', fontSize: 13, textDecoration: 'none', fontWeight: 600 }} className="hover:text-white hover:bg-white/10">Shop</Link>
              <Link to={`/shop?category=${encodeURIComponent('Electronic Gadget')}`} style={{ color: '#bdd7ff', padding: '10px 16px', fontSize: 13, textDecoration: 'none', fontWeight: 600 }} className="hover:text-white hover:bg-white/10">Electronics</Link>
              <Link to={`/shop?category=${encodeURIComponent('Home & Kitchen Appliances')}`} style={{ color: '#bdd7ff', padding: '10px 16px', fontSize: 13, textDecoration: 'none', fontWeight: 600 }} className="hover:text-white hover:bg-white/10">Home & Kitchen</Link>
              <Link to={`/shop?category=${encodeURIComponent('Made In Rwanda')}`} style={{ color: '#fde68a', padding: '10px 16px', fontSize: 13, textDecoration: 'none', fontWeight: 700 }} className="hover:text-yellow-200 hover:bg-white/10">🇷🇼 Made In Rwanda</Link>
              <Link to="/about" style={{ color: '#bdd7ff', padding: '10px 16px', fontSize: 13, textDecoration: 'none', fontWeight: 600 }} className="hover:text-white hover:bg-white/10">About</Link>
              <Link to="/contact" style={{ color: '#bdd7ff', padding: '10px 16px', fontSize: 13, textDecoration: 'none', fontWeight: 600 }} className="hover:text-white hover:bg-white/10">Contact</Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div style={{ backgroundColor: '#1a56db', borderTop: '1px solid rgba(255,255,255,0.1)' }} className="md:hidden">
          <div className="px-4 py-3">
            <input type="text" placeholder="Search products..." style={{ width: '100%', padding: '10px 16px', borderRadius: 4, border: 'none', outline: 'none', fontSize: 14, marginBottom: 12 }} />
            <nav className="flex flex-col">
              {[
                { label: 'Home', to: '/' }, { label: 'Shop', to: '/shop' },
                { label: 'Electronics', to: `/shop?category=${encodeURIComponent('Electronic Gadget')}` },
                { label: 'Home & Kitchen', to: `/shop?category=${encodeURIComponent('Home & Kitchen Appliances')}` },
                { label: '🇷🇼 Made In Rwanda', to: `/shop?category=${encodeURIComponent('Made In Rwanda')}` },
                { label: 'About', to: '/about' }, { label: 'Contact', to: '/contact' },
              ].map(link => (
                <Link key={link.label} to={link.to} style={{ color: '#bdd7ff', padding: '10px 0', fontSize: 14, textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }} onClick={() => setIsMenuOpen(false)}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;