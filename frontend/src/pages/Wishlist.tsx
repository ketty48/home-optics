import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, ArrowLeft, Share2 } from 'lucide-react';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';

const Wishlist = () => {
  const { items, removeItem, clearWishlist, getTotalItems } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addItem);
  const totalItems = getTotalItems();

  const handleMoveToCart = (productId: string) => {
    const product = items.find((p) => p._id === productId);
    if (product) {
      addToCart(product);
      removeItem(productId);
    }
  };

  const handleMoveAllToCart = () => {
    items.forEach((product) => addToCart(product));
    clearWishlist();
  };

  /* ── Empty state ── */
  if (items.length === 0) {
    return (
      <div style={{ minHeight: '80vh', backgroundColor: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}>
        <div style={{ textAlign: 'center', maxWidth: 360, padding: '0 16px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: 16, padding: '48px 40px', boxShadow: '0 2px 16px rgba(26,86,219,0.08)', border: '1px solid #e0e7ff' }}>
            <div style={{ width: 72, height: 72, backgroundColor: '#fff1f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Heart style={{ width: 34, height: 34, color: '#fca5a5' }} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0a1628', marginBottom: 8 }}>Your wishlist is empty</h1>
            <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 28 }}>Save items you love by clicking the heart icon on any product.</p>
            <Link
              to="/shop"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: '#1a56db', color: 'white', padding: '12px 28px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 12px rgba(26,86,219,0.3)' }}
            >
              <ArrowLeft style={{ width: 16, height: 16 }} />
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4ff', fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Page Title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0a1628', marginBottom: 4 }}>My Wishlist</h1>
            <p style={{ fontSize: 13, color: '#94a3b8' }}>{totalItems} {totalItems === 1 ? 'item' : 'items'} saved</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleMoveAllToCart}
              style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#1a56db', color: 'white', padding: '9px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, boxShadow: '0 4px 12px rgba(26,86,219,0.25)' }}
            >
              <ShoppingCart style={{ width: 15, height: 15 }} />
              Move All to Cart
            </button>
            <button
              onClick={clearWishlist}
              style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: 'white', color: '#dc2626', padding: '9px 18px', borderRadius: 8, border: '1.5px solid #fee2e2', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}
            >
              <Trash2 style={{ width: 15, height: 15 }} />
              Clear All
            </button>
          </div>
        </div>

        {/* Wishlist Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          <AnimatePresence>
            {items.map((product) => {
              const mainImage =
                product.images?.find((img) => img.isMain)?.url ||
                product.images?.[0]?.url || '';
              const discountPercent =
                product.discountPercentage ||
                (product.compareAtPrice && product.compareAtPrice > product.price
                  ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
                  : 0);

              return (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  layout
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: '1.5px solid #e0e7ff',
                    boxShadow: '0 2px 8px rgba(26,86,219,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Product Image */}
                  <Link to={`/product/${product.slug}`} style={{ textDecoration: 'none', position: 'relative', display: 'block' }}>
                    <div style={{ position: 'relative', backgroundColor: '#f8faff', aspectRatio: '1', overflow: 'hidden' }}>
                      <img
                        src={mainImage}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                        onError={e => { e.currentTarget.src = '/placeholder.png'; }}
                      />

                      {/* Discount badge */}
                      {discountPercent > 0 && (
                        <span style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#dc2626', color: 'white', padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 800 }}>
                          -{discountPercent}%
                        </span>
                      )}

                      {/* Out of stock overlay */}
                      {product.stock <= 0 && (
                        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ backgroundColor: 'white', color: '#64748b', padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 800 }}>
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {product.category}
                    </span>
                    <Link to={`/product/${product.slug}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0a1628', margin: 0, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {product.name}
                      </h3>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                      <span style={{ fontSize: 16, fontWeight: 900, color: '#1a56db' }}>
                        Fr {product.price.toLocaleString()}
                      </span>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'line-through' }}>
                          Fr {product.compareAtPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Low stock warning */}
                    {product.stock > 0 && product.stock <= 5 && (
                      <span style={{ fontSize: 10, color: '#f59e0b', fontWeight: 700 }}>
                        ⚠ Only {product.stock} left!
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ padding: '0 14px 14px', display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleMoveToCart(product._id)}
                      disabled={product.stock <= 0}
                      style={{
                        flex: 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        backgroundColor: product.stock > 0 ? '#1a56db' : '#e2e8f0',
                        color: product.stock > 0 ? 'white' : '#94a3b8',
                        border: 'none', borderRadius: 7, padding: '9px 0',
                        fontSize: 12, fontWeight: 700, cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <ShoppingCart style={{ width: 14, height: 14 }} />
                      {product.stock > 0 ? 'Move to Cart' : 'Out of Stock'}
                    </button>

                    <button
                      onClick={() => removeItem(product._id)}
                      title="Remove from wishlist"
                      style={{ padding: '9px 11px', backgroundColor: '#fff1f2', border: '1.5px solid #fee2e2', borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.2s' }}
                    >
                      <Trash2 style={{ width: 14, height: 14, color: '#dc2626' }} />
                    </button>

                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({ title: product.name, url: `${window.location.origin}/product/${product.slug}` });
                        } else {
                          navigator.clipboard.writeText(`${window.location.origin}/product/${product.slug}`);
                        }
                      }}
                      title="Share product"
                      style={{ padding: '9px 11px', backgroundColor: '#f0f4ff', border: '1.5px solid #e0e7ff', borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.2s' }}
                    >
                      <Share2 style={{ width: 14, height: 14, color: '#1a56db' }} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Bottom CTA */}
        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #e0e7ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Link
            to="/shop"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#1a56db', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}
          >
            ← Continue Shopping
          </Link>
          <Link
            to="/cart"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#f0f4ff', color: '#1a56db', padding: '9px 20px', borderRadius: 8, fontWeight: 700, fontSize: 13, textDecoration: 'none', border: '1.5px solid #e0e7ff' }}
          >
            <ShoppingCart style={{ width: 15, height: 15 }} />
            View Cart
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
