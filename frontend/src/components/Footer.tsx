import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin, ChevronRight, Shield, Truck, RefreshCw, Award } from 'lucide-react';
import apiClient from '../utils/api';

const Footer = () => {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiClient.get('/products/categories');
        if (res.data?.data && Array.isArray(res.data.data)) {
          setCategories(res.data.data.slice(0, 5)); // Limit to 5 for the footer
        }
      } catch (error) {
        console.error('Failed to fetch footer categories:', error);
      }
    };
    fetchCategories();
  }, []);
  return (
    <footer style={{ fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}>
      {/* Trust Strip */}
      <div style={{ backgroundColor: '#1a56db' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {[
              { icon: <Truck style={{ width: 18, height: 18 }} />, text: 'Free Nationwide Delivery' },
              { icon: <Shield style={{ width: 18, height: 18 }} />, text: '100% Secure Payments' },
              { icon: <RefreshCw style={{ width: 18, height: 18 }} />, text: 'Easy Returns & Exchanges' },
              { icon: <Award style={{ width: 18, height: 18 }} />, text: 'Quality Guaranteed' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'white', padding: '10px 16px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.25)' : 'none' }}>
                {item.icon}
                <span style={{ fontSize: 13, fontWeight: 700 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div style={{ backgroundColor: '#0a1628' }}>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr', gap: 36 }}>

            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ backgroundColor: '#1a56db', borderRadius: 8, padding: '6px 10px' }}>
                  <span style={{ color: 'white', fontWeight: 900, fontSize: 18 }}>HO</span>
                </div>
                <span style={{ color: 'white', fontWeight: 900, fontSize: 20 }}>Home Optics</span>
              </div>
              <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.75, marginBottom: 20 }}>
                Rwanda's trusted online marketplace for quality home appliances, electronics, musical instruments, and personal care products. Delivering happiness to your door.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { icon: <Facebook style={{ width: 16, height: 16 }} />, href: 'https://facebook.com' },
                  { icon: <Instagram style={{ width: 16, height: 16 }} />, href: 'https://instagram.com' },
                  { icon: <Youtube style={{ width: 16, height: 16 }} />, href: 'https://youtube.com' },
                ].map((s, i) => (
                  <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                    style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'all 0.2s', textDecoration: 'none' }}
                    className="hover:bg-blue-600 hover:text-white">
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h4 style={{ color: 'white', fontWeight: 800, fontSize: 14, marginBottom: 16, paddingBottom: 8, borderBottom: '2px solid #1a56db' }}>Categories</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {categories.map(cat => (
                  <li key={cat} style={{ marginBottom: 8 }}>
                    <Link to={`/shop?category=${encodeURIComponent(cat)}`} style={{ color: '#64748b', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }} className="hover:text-blue-400">
                      <ChevronRight style={{ width: 12, height: 12 }} />{cat}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={{ color: 'white', fontWeight: 800, fontSize: 14, marginBottom: 16, paddingBottom: 8, borderBottom: '2px solid #1a56db' }}>Quick Links</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  { label: 'About Us', to: '/about' },
                  { label: 'Contact Us', to: '/contact' },
                  { label: 'Privacy Policy', to: '/privacy' },
                  { label: 'Terms & Conditions', to: '/terms' },
                  { label: 'Sell With Us', to: '/sell' },
                  { label: 'Help Center', to: '/help' },
                ].map(l => (
                  <li key={l.label} style={{ marginBottom: 8 }}>
                    <Link to={l.to} style={{ color: '#64748b', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }} className="hover:text-blue-400">
                      <ChevronRight style={{ width: 12, height: 12 }} />{l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* My Account */}
            <div>
              <h4 style={{ color: 'white', fontWeight: 800, fontSize: 14, marginBottom: 16, paddingBottom: 8, borderBottom: '2px solid #1a56db' }}>My Account</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  { label: 'Sign In / Register', to: '/login' },
                  { label: 'My Profile', to: '/profile' },
                  { label: 'My Orders', to: '/orders' },
                  { label: 'Shopping Cart', to: '/cart' },
                  { label: 'Wishlist', to: '/wishlist' },
                ].map(l => (
                  <li key={l.label} style={{ marginBottom: 8 }}>
                    <Link to={l.to} style={{ color: '#64748b', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }} className="hover:text-blue-400">
                      <ChevronRight style={{ width: 12, height: 12 }} />{l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 style={{ color: 'white', fontWeight: 800, fontSize: 14, marginBottom: 16, paddingBottom: 8, borderBottom: '2px solid #1a56db' }}>Contact Us</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <MapPin style={{ width: 15, height: 15, color: '#1a56db', flexShrink: 0, marginTop: 2 }} />
                  <span style={{ color: '#64748b', fontSize: 13 }}>Kigali, Rwanda</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Phone style={{ width: 15, height: 15, color: '#1a56db', flexShrink: 0 }} />
                  <a href="tel:+250786418362" style={{ color: '#64748b', fontSize: 13, textDecoration: 'none' }} className="hover:text-blue-400">+250 786 418 362</a>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Mail style={{ width: 15, height: 15, color: '#1a56db', flexShrink: 0 }} />
                  <a href="mailto:hohorw23@gmail.com" style={{ color: '#64748b', fontSize: 13, textDecoration: 'none' }} className="hover:text-blue-400">hohorw23@gmail.com</a>
                </li>
              </ul>

              {/* Newsletter */}
              <div style={{ marginTop: 20 }}>
                <p style={{ color: '#94a3b8', fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Subscribe for deals</p>
                <div style={{ display: 'flex' }}>
                  <input type="email" placeholder="Your email..."
                    style={{ flex: 1, padding: '9px 12px', fontSize: 12, backgroundColor: '#1e293b', border: '1px solid #334155', color: 'white', outline: 'none', borderRadius: '5px 0 0 5px' }}
                  />
                  <button style={{ backgroundColor: '#1a56db', color: 'white', padding: '9px 14px', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 800, borderRadius: '0 5px 5px 0' }}
                    className="hover:bg-blue-700">GO</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ backgroundColor: '#060e1a', borderTop: '1px solid #1e293b' }}>
        <div className="max-w-7xl mx-auto px-4 py-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <p style={{ color: '#475569', fontSize: 12 }}>© 2026 Home Optics Rwanda — All Rights Reserved</p>
          <div style={{ display: 'flex', gap: 16 }}>
            {['Privacy Policy', 'Terms of Use', 'Cookies'].map(l => (
              <Link key={l} to="#" style={{ color: '#475569', fontSize: 12, textDecoration: 'none' }} className="hover:text-blue-400">{l}</Link>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ color: '#475569', fontSize: 11 }}>We accept:</span>
            {['MTN MoMo', 'Airtel Money', 'Visa', 'Cash'].map(m => (
              <span key={m} style={{ backgroundColor: '#1e293b', color: '#64748b', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, border: '1px solid #334155' }}>{m}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;