import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Truck, Shield, HeadphonesIcon, Star,
  ChevronRight, Flame, Gift,Tag
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Product, Category } from '../types';
import apiClient from '../utils/api';
import { motion } from 'framer-motion';

const categoryIcons: Record<string, string> = {
  'Electronic Gadget': '📱',
  'Home & Kitchen Appliances': '🍳',
  'Made In Rwanda': '🇷🇼',
  'Musical Instrument': '🎸',
  'Personal Care': '💄',
};

const fallbackCategories = [
  { _id: '1', name: 'Electronic Gadget' },
  { _id: '2', name: 'Home & Kitchen Appliances' },
  { _id: '3', name: 'Made In Rwanda' },
  { _id: '4', name: 'Musical Instrument' },
  { _id: '5', name: 'Personal Care' },
];

const bannerSlides = [
  {
    title: "Season Sale",
    subtitle: "Up to 50% Off on Top Products",
    desc: "Shop the latest home appliances, electronics, and personal care products with free delivery across Rwanda.",
    cta: "Shop Now",
    bg: "linear-gradient(135deg, #1a56db 0%, #1648c0 50%, #0f3a9e 100%)",
    tag: "🔥 HOT DEALS",
  },
  {
    title: "New Arrivals",
    subtitle: "Fresh Electronics Just Landed",
    desc: "Be the first to own the latest tech gadgets in Rwanda. Brand new stock available now.",
    cta: "Explore Now",
    bg: "linear-gradient(135deg, #0a1628 0%, #0f3a9e 60%, #1a56db 100%)",
    tag: "✨ JUST IN",
  },
  {
    title: "Made In Rwanda",
    subtitle: "Support Local Artisans & Brands",
    desc: "Discover authentic Rwandan-made products. Quality crafted right here at home.",
    cta: "Shop Local",
    bg: "linear-gradient(135deg, #1d4a2c 0%, #1a56db 100%)",
    tag: "🇷🇼 LOCAL PRIDE",
  },
];

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [flashDeals, setFlashDeals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBanner, setActiveBanner] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, catRes] = await Promise.all([
          apiClient.get('/products?sort=newest&limit=20'),

          apiClient.get('/products/categories'),
        ]);

        // Directly set products from the `data` property of the API response.
        if (productsRes.data && Array.isArray(productsRes.data.data)) {
          setProducts(productsRes.data.data);
        } else {
          setProducts([]);
          console.warn('Could not find products array in API response:', productsRes.data);
        }

        const flashDealsRes = await apiClient.get('/products?flashDeal=true&limit=5');
        if (flashDealsRes.data && Array.isArray(flashDealsRes.data.data)) {
          setFlashDeals(flashDealsRes.data.data);
        } else {
          console.warn('Could not find flash deals array in API response:', flashDealsRes.data);
        }

        // Directly set categories from the `data` property of the API response.
        if (catRes.data && Array.isArray(catRes.data.data)) {
          const rawCats = catRes.data.data;
          if (rawCats.length > 0 && typeof rawCats[0] === 'string') {
            setCategories(rawCats.map((name: string, i: number) => ({ _id: `cat-${i}`, name })));
          } else {
            setCategories(rawCats);
          }
        } else {
          console.warn('Could not find categories array in API response:', catRes.data);
        }
      } catch (err) {
        console.error('❌ Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveBanner(p => (p + 1) % bannerSlides.length), 5000);
    return () => clearInterval(t);
  }, []);

  const slide = bannerSlides[activeBanner];
  const cats = categories.length > 0 ? categories : fallbackCategories;

  return (
    <div style={{ backgroundColor: '#f0f4ff', fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}>

      {/* ══════════════════════════════════════
          HERO — Sidebar + Banner + Mini panels
      ══════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 py-4">
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 200px', gap: 12, alignItems: 'start' }}>

          {/* Category Sidebar */}
          <div style={{ backgroundColor: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 12px rgba(26,86,219,0.08)' }} className="hidden md:block">
            <div style={{ backgroundColor: '#1a56db', padding: '12px 16px' }}>
              <span style={{ color: 'white', fontWeight: 800, fontSize: 14 }}>All Categories</span>
            </div>
            {cats.map((cat) => (
              <Link
                key={cat._id}
                to={`/shop?category=${encodeURIComponent(cat.name)}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', fontSize: 13, color: '#333', textDecoration: 'none', borderBottom: '1px solid #f0f4ff', transition: 'all 0.15s' }}
                className="hover:bg-blue-50 hover:text-blue-700"
              >
                <span>{categoryIcons[cat.name] || '🛍️'} {cat.name}</span>
                <ChevronRight style={{ width: 13, height: 13, color: '#aaa' }} />
              </Link>
            ))}
          </div>

          {/* Hero Banner */}
          <div style={{ borderRadius: 10, overflow: 'hidden', position: 'relative', minHeight: 340 }}>
            <motion.div
              key={activeBanner}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45 }}
              style={{ background: slide.bg, minHeight: 340, padding: '40px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}
            >
              <div style={{ position: 'absolute', right: -30, top: -30, width: 260, height: 260, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)' }} />
              <div style={{ position: 'absolute', right: 80, bottom: -60, width: 180, height: 180, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)' }} />

              <span style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.18)', color: 'white', padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 800, marginBottom: 16, width: 'fit-content', backdropFilter: 'blur(10px)' }}>
                {slide.tag}
              </span>
              <h1 style={{ fontSize: 46, fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 8 }}>{slide.title}</h1>
              <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.9)', fontWeight: 700, marginBottom: 12 }}>{slide.subtitle}</p>
              <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14, maxWidth: 400, marginBottom: 28, lineHeight: 1.65 }}>{slide.desc}</p>
              <Link
                to="/shop"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: 'white', color: '#1a56db', padding: '12px 28px', borderRadius: 6, fontWeight: 800, fontSize: 15, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.18)', width: 'fit-content', transition: 'transform 0.2s' }}
                className="hover:scale-105"
              >
                {slide.cta} <ArrowRight style={{ width: 17, height: 17 }} />
              </Link>

              {/* Dots */}
              <div style={{ position: 'absolute', bottom: 18, right: 20, display: 'flex', gap: 6 }}>
                {bannerSlides.map((_, i) => (
                  <button key={i} onClick={() => setActiveBanner(i)} style={{ width: i === activeBanner ? 22 : 8, height: 8, borderRadius: 4, backgroundColor: i === activeBanner ? 'white' : 'rgba(255,255,255,0.45)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Mini Promo Panels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} className="hidden lg:flex">
            {[
              { label: '🔥 Flash Deals', desc: 'Today only', bg: '#fff0f0', border: '#fecaca', color: '#dc2626', link: '/shop?sort=discount' },
              { label: '✨ New Arrivals', desc: 'Just landed', bg: '#eff6ff', border: '#bfdbfe', color: '#1a56db', link: '/shop?sort=newest' },
              { label: '🇷🇼 Made in RW', desc: 'Support local', bg: '#f0fdf4', border: '#bbf7d0', color: '#16a34a', link: `/shop?category=${encodeURIComponent('Made In Rwanda')}` },
            ].map((panel, i) => (
              <Link key={i} to={panel.link} style={{ backgroundColor: panel.bg, border: `1px solid ${panel.border}`, borderRadius: 8, padding: '14px 16px', textDecoration: 'none', display: 'block', transition: 'all 0.2s' }} className="hover:shadow-md hover:scale-[1.02]">
                <div style={{ fontWeight: 800, fontSize: 14, color: panel.color }}>{panel.label}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{panel.desc}</div>
                <div style={{ fontSize: 11, color: panel.color, marginTop: 6, fontWeight: 700 }}>Shop now →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TRUST BADGES
      ══════════════════════════════════════ */}
      <section style={{ backgroundColor: 'white', borderTop: '1px solid #e0e7ff', borderBottom: '1px solid #e0e7ff' }}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {[
              { icon: <Truck style={{ width: 22, height: 22, color: '#1a56db' }} />, title: 'Free Delivery', desc: 'Across Rwanda' },
              { icon: <Shield style={{ width: 22, height: 22, color: '#1a56db' }} />, title: 'Safe Returns', desc: '7-day policy' },
              { icon: <HeadphonesIcon style={{ width: 22, height: 22, color: '#1a56db' }} />, title: '24/7 Support', desc: 'Always here' },
              { icon: <Tag style={{ width: 22, height: 22, color: '#1a56db' }} />, title: 'Best Prices', desc: 'Guaranteed' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderRight: i < 3 ? '1px solid #e0e7ff' : 'none' }}>
                <div style={{ backgroundColor: '#eff6ff', padding: 8, borderRadius: 8 }}>{item.icon}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#0a1628' }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CATEGORIES GRID
      ══════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 py-5">
        <div style={{ backgroundColor: 'white', borderRadius: 10, padding: '20px 24px', boxShadow: '0 2px 12px rgba(26,86,219,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0a1628', margin: 0 }}>Shop by Category</h2>
            <Link to="/categories" style={{ color: '#1a56db', fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
              View All <ChevronRight style={{ width: 15, height: 15 }} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            {cats.slice(0, 5).map((cat) => (
              <Link
                key={cat._id}
                to={`/shop?category=${encodeURIComponent(cat.name)}`}
                style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '14px 8px', borderRadius: 10, border: '1.5px solid #e0e7ff', transition: 'all 0.2s' }}
                className="hover:border-blue-400 hover:bg-blue-50 group"
              >
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                  {categoryIcons[cat.name] || '🛍️'}
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#334155', textAlign: 'center', lineHeight: 1.3 }} className="group-hover:text-blue-700">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          PRODUCTS — Full grid, visible on load
      ══════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 pb-6">
        <div style={{ backgroundColor: 'white', borderRadius: 10, padding: '20px 24px', boxShadow: '0 2px 12px rgba(26,86,219,0.07)' }}>
          {/* Section Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 14, borderBottom: '2px solid #1a56db' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Star style={{ width: 20, height: 20, color: '#1a56db', fill: '#1a56db' }} />
              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0a1628', margin: 0 }}>Just For You</h2>
              <span style={{ backgroundColor: '#eff6ff', color: '#1a56db', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, border: '1px solid #bfdbfe' }}>
                New Arrivals
              </span>
            </div>
            <Link to="/shop" style={{ color: '#1a56db', fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
              See All <ChevronRight style={{ width: 15, height: 15 }} />
            </Link>
          </div>

          {loading ? (
            /* Loading skeleton */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #e0e7ff' }}>
                  <div style={{ backgroundColor: '#e0e7ff', height: 160, animation: 'pulse 1.5s infinite' }} />
                  <div style={{ padding: 12 }}>
                    <div style={{ backgroundColor: '#e0e7ff', height: 12, borderRadius: 4, marginBottom: 8 }} />
                    <div style={{ backgroundColor: '#e0e7ff', height: 12, borderRadius: 4, width: '60%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
              <p style={{ fontSize: 15 }}>No products yet. Check back soon!</p>
            </div>
          )}

          {products.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: 28 }}>
              <Link
                to="/shop"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: '#1a56db', color: 'white', padding: '12px 36px', borderRadius: 6, fontWeight: 800, fontSize: 15, textDecoration: 'none', boxShadow: '0 4px 14px rgba(26,86,219,0.35)', transition: 'all 0.2s' }}
                className="hover:bg-blue-700 hover:scale-105"
              >
                View All Products <ArrowRight style={{ width: 18, height: 18 }} />
              </Link>
            </div>
          )}
        </div>
      </section>

       {/* ══════════════════════════════════════
          FLASH DEAL STRIP
      ══════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 pb-6">
        <div style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1a56db 100%)', borderRadius: 10, padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 16px rgba(26,86,219,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Flame style={{ width: 36, height: 36, color: '#fbbf24' }} />
            <div>
              <div style={{ color: '#fbbf24', fontWeight: 900, fontSize: 20 }}>🔥 Flash Deals</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>Limited time offers — don't miss out!</div>
            </div>
          </div>
          <Link to="/shop?sort=discount" style={{ backgroundColor: 'white', color: '#1a56db', padding: '10px 24px', borderRadius: 6, fontWeight: 800, fontSize: 14, textDecoration: 'none' }}
            className="hover:bg-blue-50 transition-colors">
            Grab Deals →
          </Link>
        </div>
      </section>

       {/* ══════════════════════════════════════
          FLASH DEAL SECTION
      ══════════════════════════════════════ */}
      {flashDeals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-5">
          <div style={{ backgroundColor: 'white', borderRadius: 10, padding: '20px 24px', boxShadow: '0 2px 12px rgba(26,86,219,0.07)' }}>
            {/* Section Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 14, borderBottom: '2px solid #1a56db' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Flame style={{ width: 20, height: 20, color: '#1a56db', fill: '#1a56db' }} />
                <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0a1628', margin: 0 }}>Flash Deals</h2>
              </div>
              <Link to="/shop?flashDeal=true" style={{ color: '#1a56db', fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
                See All <ChevronRight style={{ width: 15, height: 15 }} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
              {flashDeals.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          3-COLUMN PROMO PANELS
      ══════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 pb-6">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[
            { title: '🇷🇼 Made in Rwanda', desc: 'Support local businesses', link: `/shop?category=${encodeURIComponent('Made In Rwanda')}`, bg: 'linear-gradient(135deg, #1d4a2c, #16a34a)', btn: 'Shop Local' },
            { title: '🎵 Musical Instruments', desc: 'For every musician', link: `/shop?category=${encodeURIComponent('Musical Instrument')}`, bg: 'linear-gradient(135deg, #0a1628, #1a56db)', btn: 'Explore Now' },
            { title: '💄 Personal Care', desc: 'Look & feel your best', link: `/shop?category=${encodeURIComponent('Personal Care')}`, bg: 'linear-gradient(135deg, #4a0a6a, #9333ea)', btn: 'Shop Beauty' },
          ].map((promo, i) => (
            <div key={i} style={{ background: promo.bg, borderRadius: 10, padding: '24px 20px', color: 'white', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: -16, bottom: -16, width: 90, height: 90, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)' }} />
              <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 6 }}>{promo.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, marginBottom: 16 }}>{promo.desc}</p>
              <Link to={promo.link} style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', padding: '7px 18px', borderRadius: 5, fontSize: 13, fontWeight: 700, textDecoration: 'none' }} className="hover:bg-white/30">
                {promo.btn} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          BOTTOM CTA
      ══════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1a56db 100%)', padding: '60px 0' }}>
        <div className="max-w-7xl mx-auto px-4" style={{ textAlign: 'center' }}>
          <Gift style={{ width: 44, height: 44, color: '#fbbf24', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: 34, fontWeight: 900, color: 'white', marginBottom: 12 }}>Transform Your Home Today</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, marginBottom: 32 }}>
            Rwanda's best marketplace for quality home appliances, electronics & more
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/shop" style={{ backgroundColor: 'white', color: '#1a56db', padding: '13px 36px', borderRadius: 6, fontWeight: 800, fontSize: 16, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }} className="hover:bg-blue-50">
              Start Shopping →
            </Link>
            <Link to="/contact" style={{ backgroundColor: 'transparent', color: 'white', padding: '13px 36px', borderRadius: 6, fontWeight: 800, fontSize: 16, textDecoration: 'none', border: '2px solid rgba(255,255,255,0.4)' }} className="hover:bg-white/10">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; } 50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default Home;