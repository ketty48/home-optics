import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product } from '../types';
import apiClient from '../utils/api';
import ProductCard from '../components/ProductCard';
import { formatDistanceToNow } from 'date-fns';
import {
   ShoppingCart, Star, Minus, Plus,
  ChevronRight, Truck, Shield, RefreshCw, Heart
} from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { motion } from 'framer-motion';

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [timeRemaining, setTimeRemaining] = useState('');

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/products/slug/${slug}`);
        const p = res.data?.data ?? res.data;
        setProduct(p);
        if (p?.images?.length > 0) {
          setMainImage(p.images[0].url);
        }
        if (p?.category) {
          try {
            const relatedRes = await apiClient.get(`/products?category=${encodeURIComponent(p.category)}&limit=5`);
            const relatedData = relatedRes.data?.data ?? relatedRes.data;
            const filtered = Array.isArray(relatedData)
              ? relatedData.filter((item: Product) => item._id !== p._id).slice(0, 4)
              : [];
            setRelatedProducts(filtered);
          } catch (e) { console.error(e); }
        }
        if (p?.isFlashDeal && p.flashDealEndDate) {
          const endDate = new Date(p.flashDealEndDate);

          const interval = setInterval(() => {
            setTimeRemaining(formatDistanceToNow(endDate, { addSuffix: true }));
          }, 1000);

            return () => clearInterval(interval);


        }
      } catch (err) {
        setError('Product not found.');
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
    }
  };

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => {
      const n = prev + amount;
      if (n < 1) return 1;
      if (product && n > product.stock) return product.stock;
      return n;
    });
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', backgroundColor: '#f0f4ff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: '4px solid #e0e7ff', borderTop: '4px solid #1a56db', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#1a56db', fontWeight: 700, fontSize: 14 }}>Loading product...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !product) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: '#f0f4ff' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0a1628', marginBottom: 12 }}>{error || 'Product not found.'}</h2>
        <Link to="/shop" style={{ backgroundColor: '#1a56db', color: 'white', padding: '12px 28px', borderRadius: 6, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>
          ← Back to Shop
        </Link>
      </div>
    );
  }

  const mainImg = product.images?.find(i => i.isMain) || product.images?.[0];
  const discountPercent = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : product.discountPercentage || 0;

  return (
    <div style={{ backgroundColor: '#f0f4ff', minHeight: '100vh', fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}>

      {/* Breadcrumb */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e0e7ff' }}>
        <div className="max-w-7xl mx-auto px-4 py-3" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b' }}>
          <Link to="/" style={{ color: '#1a56db', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
          <ChevronRight style={{ width: 14, height: 14 }} />
          <Link to="/shop" style={{ color: '#1a56db', textDecoration: 'none', fontWeight: 600 }}>Shop</Link>
          <ChevronRight style={{ width: 14, height: 14 }} />
          <Link to={`/shop?category=${encodeURIComponent(product.category)}`} style={{ color: '#1a56db', textDecoration: 'none', fontWeight: 600 }}>
            {product.category}
          </Link>
          <ChevronRight style={{ width: 14, height: 14 }} />
          <span style={{ color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{product.name}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>

          {/* ── LEFT: Image Gallery ── */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <div style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, boxShadow: '0 2px 16px rgba(26,86,219,0.08)', position: 'sticky', top: 80 }}>

              {/* Main Image — fixed height + contain so product is never cropped */}
              <div style={{
                position: 'relative',
                borderRadius: 10,
                overflow: 'hidden',
                backgroundColor: '#f8faff',
                height: 320,                  /* fixed height — not full bleed */
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #e0e7ff',
              }}>
                <img
                  src={mainImage || mainImg?.url}
                  alt={product.name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',      /* show full product, no cropping */
                    padding: 16,
                    transition: 'transform 0.35s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                />

                {/* Discount badge */}
                {discountPercent > 0 && (
                  <div style={{ position: 'absolute', top: 12, left: 12, backgroundColor: '#dc2626', color: 'white', padding: '4px 10px', borderRadius: 6, fontWeight: 800, fontSize: 13 }}>
                    -{discountPercent}%
                  </div>
                )}

                {/* Out of stock overlay */}
                {product.stock <= 0 && (
                  <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ backgroundColor: 'white', color: '#dc2626', padding: '8px 20px', borderRadius: 6, fontWeight: 800, fontSize: 15 }}>Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images?.length > 1 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setMainImage(img.url)}
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 8,
                        overflow: 'hidden',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 4,
                        backgroundColor: '#f8faff',
                        outline: mainImage === img.url ? '3px solid #1a56db' : '2px solid #e0e7ff',
                        outlineOffset: 2,
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <img
                        src={img.url}
                        alt={img.alt}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* ── RIGHT: Product Info ── */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

              {/* Category tag */}
              <Link
                to={`/shop?category=${encodeURIComponent(product.category)}`}
                style={{ display: 'inline-block', backgroundColor: '#eff6ff', color: '#1a56db', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, textDecoration: 'none', border: '1px solid #bfdbfe', width: 'fit-content', marginBottom: 10 }}
              >
                {product.category}
              </Link>

              {/* Product Name */}
              <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0a1628', lineHeight: 1.2, marginBottom: 12 }}>
                {product.name}
              </h1>

              {/* Flash Deal Timer */}
              {product.isFlashDeal && (
                <div style={{ fontSize: 16, fontWeight: 700, color: '#dc2626', marginBottom: 10 }}>🔥 Hurry, deal ends {timeRemaining}!</div>
              )}

              {/* Rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} style={{ width: 16, height: 16, color: i < Math.floor(product.rating) ? '#f59e0b' : '#e2e8f0', fill: i < Math.floor(product.rating) ? '#f59e0b' : '#e2e8f0' }} />
                  ))}
                </div>
                <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                  {product.rating > 0 ? product.rating.toFixed(1) : 'No ratings yet'}
                </span>
                <span style={{ color: '#cbd5e1' }}>|</span>
                <span style={{ fontSize: 13, color: '#64748b' }}>{product.numReviews} reviews</span>
                <span style={{ color: '#cbd5e1' }}>|</span>
                <span style={{ fontSize: 13, color: product.stock > 0 ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
                  {product.stock > 0 ? `✓ In Stock (${product.stock})` : '✗ Out of Stock'}
                </span>
              </div>

              {/* Price box */}
              <div style={{ backgroundColor: '#f8faff', border: '1px solid #e0e7ff', borderRadius: 10, padding: '16px 20px', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 32, fontWeight: 900, color: '#1a56db' }}>
                    Fr {product.price.toLocaleString()}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <>
                      <span style={{ fontSize: 18, color: '#94a3b8', textDecoration: 'line-through', fontWeight: 600 }}>
                        Fr {product.compareAtPrice.toLocaleString()}
                      </span>
                      <span style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '3px 10px', borderRadius: 6, fontSize: 13, fontWeight: 800 }}>
                        Save {discountPercent}%
                      </span>
                    </>
                  )}
                </div>
                <p style={{ color: '#64748b', fontSize: 12, marginTop: 6 }}>Price in Rwandan Franc (RWF) · Free delivery included</p>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontWeight: 800, fontSize: 14, color: '#0a1628', marginBottom: 8 }}>Description</h3>
                <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.75, whiteSpace: 'pre-line', margin: 0 }}>
                  {product.description}
                </p>
              </div>

              {/* SKU + Brand */}
              <div style={{ display: 'flex', gap: 20, fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>
                {product.sku && <span>SKU: <strong style={{ color: '#64748b' }}>{product.sku}</strong></span>}
            
              </div>

              {/* Quantity + Add to Cart + Wishlist */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                {/* Qty stepper */}
                <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #e0e7ff', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    style={{ padding: '10px 13px', backgroundColor: '#f8faff', border: 'none', cursor: 'pointer', color: '#1a56db', display: 'flex', alignItems: 'center' }}
                    className="hover:bg-blue-100 transition-colors"
                  >
                    <Minus style={{ width: 15, height: 15 }} />
                  </button>
                  <span style={{ padding: '10px 16px', fontWeight: 800, fontSize: 15, color: '#0a1628', borderLeft: '2px solid #e0e7ff', borderRight: '2px solid #e0e7ff', minWidth: 48, textAlign: 'center' }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    style={{ padding: '10px 13px', backgroundColor: '#f8faff', border: 'none', cursor: 'pointer', color: '#1a56db', display: 'flex', alignItems: 'center' }}
                    className="hover:bg-blue-100 transition-colors"
                  >
                    <Plus style={{ width: 15, height: 15 }} />
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  style={{
                    flex: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    backgroundColor: addedToCart ? '#16a34a' : (product.stock > 0 ? '#1a56db' : '#e2e8f0'),
                    color: product.stock > 0 ? 'white' : '#94a3b8',
                    padding: '12px 20px', borderRadius: 8, border: 'none',
                    cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                    fontWeight: 800, fontSize: 15, transition: 'all 0.25s',
                    boxShadow: product.stock > 0 ? '0 4px 14px rgba(26,86,219,0.3)' : 'none',
                  }}
                >
                  <ShoppingCart style={{ width: 18, height: 18 }} />
                  {addedToCart ? '✓ Added to Cart!' : product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>

                {/* Wishlist */}
                <button
                  style={{ padding: '11px', border: '2px solid #e0e7ff', borderRadius: 8, backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 }}
                  className="hover:border-blue-400 hover:bg-blue-50"
                >
                  <Heart style={{ width: 18, height: 18, color: '#94a3b8' }} />
                </button>
              </div>

              {/* Trust badges */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { icon: <Truck style={{ width: 16, height: 16, color: '#1a56db' }} />, label: 'Free Delivery', sub: 'Across Rwanda' },
                  { icon: <RefreshCw style={{ width: 16, height: 16, color: '#1a56db' }} />, label: 'Easy Returns', sub: '7-day policy' },
                  { icon: <Shield style={{ width: 16, height: 16, color: '#1a56db' }} />, label: 'Secure Payment', sub: 'MoMo & Visa' },
                ].map((badge, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#f8faff', border: '1px solid #e0e7ff', borderRadius: 8, padding: '9px 10px' }}>
                    <div style={{ backgroundColor: '#eff6ff', padding: 5, borderRadius: 6, flexShrink: 0 }}>{badge.icon}</div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#0a1628' }}>{badge.label}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>{badge.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div style={{ marginTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {product.tags.map((tag: string, i: number) => (
                    <span key={i} style={{ backgroundColor: '#eff6ff', color: '#1a56db', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: '1px solid #bfdbfe' }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid #e0e7ff' }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0a1628', marginBottom: 20 }}>Related Products</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Back to Shop */}
        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #e0e7ff' }}>
          <Link
            to="/shop"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#1a56db', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}
            className="hover:underline"
          >
            ← Continue Shopping
          </Link>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ProductDetail;