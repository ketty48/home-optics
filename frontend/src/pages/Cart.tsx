import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { Trash2, Minus, Plus, ShoppingCart, ArrowLeft, Shield, Truck, Tag } from 'lucide-react';

const Cart = () => {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems } = useCartStore();
  const totalItems = getTotalItems();

  /* ── Empty state ── */
  if (items.length === 0) {
    return (
      <div style={{ minHeight: '80vh', backgroundColor: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}>
        <div style={{ textAlign: 'center', maxWidth: 360, padding: '0 16px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: 16, padding: '48px 40px', boxShadow: '0 2px 16px rgba(26,86,219,0.08)', border: '1px solid #e0e7ff' }}>
            <div style={{ width: 72, height: 72, backgroundColor: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <ShoppingCart style={{ width: 34, height: 34, color: '#bfdbfe' }} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0a1628', marginBottom: 8 }}>Your cart is empty</h1>
            <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 28 }}>Looks like you haven't added anything yet.</p>
            <Link
              to="/shop"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: '#1a56db', color: 'white', padding: '12px 28px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 12px rgba(26,86,219,0.3)' }}
            >
              <ArrowLeft style={{ width: 16, height: 16 }} />
              Continue Shopping
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
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0a1628', marginBottom: 4 }}>Shopping Cart</h1>
          <p style={{ fontSize: 13, color: '#94a3b8' }}>{totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* ── LEFT: Cart Items ── */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Column headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 8, padding: '0 16px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}
              className="hidden sm:grid">
              <span>Product</span>
              <span style={{ textAlign: 'center' }}>Unit Price</span>
              <span style={{ textAlign: 'center' }}>Quantity</span>
              <span style={{ textAlign: 'right' }}>Total</span>
            </div>

            {items.map((item) => {
              const itemImage = item.images?.find((img: any) => img.isMain)?.url || item.images?.[0]?.url;
              return (
                <div
                  key={item._id}
                  style={{ backgroundColor: 'white', borderRadius: 12, border: '1.5px solid #e0e7ff', padding: '14px 16px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', alignItems: 'center', gap: 12, boxShadow: '0 1px 6px rgba(26,86,219,0.05)' }}
                  className="max-sm:flex max-sm:flex-wrap"
                >
                  {/* Product info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <Link to={`/products/${item.slug}`} style={{ flexShrink: 0 }}>
                      <div style={{ width: 64, height: 64, borderRadius: 8, overflow: 'hidden', backgroundColor: '#f8faff', border: '1px solid #e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                          src={itemImage}
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }}
                          onError={e => { e.currentTarget.src = '/placeholder.png'; }}
                        />
                      </div>
                    </Link>
                    <div style={{ minWidth: 0 }}>
                      <Link
                        to={`/products/${item.slug}`}
                        style={{ fontWeight: 700, fontSize: 14, color: '#0a1628', textDecoration: 'none', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.35 }}
                        className="hover:text-blue-600"
                      >
                        {item.name}
                      </Link>
                      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{item.category}</p>
                      {/* Mobile price */}
                      <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }} className="sm:hidden">
                        Fr {item.price.toLocaleString()} each
                      </p>
                    </div>
                  </div>

                  {/* Unit price */}
                  <div style={{ display: 'flex', justifyContent: 'center' }} className="hidden sm:flex">
                    <span style={{ fontSize: 14, color: '#475569', fontWeight: 600 }}>Fr {item.price.toLocaleString()}</span>
                  </div>

                  {/* Quantity stepper */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', border: '2px solid #e0e7ff', borderRadius: 8, overflow: 'hidden' }}>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        style={{ padding: '6px 10px', backgroundColor: '#f8faff', border: 'none', cursor: 'pointer', color: '#1a56db', display: 'flex', alignItems: 'center' }}
                        className="hover:bg-blue-100 transition-colors"
                      >
                        <Minus style={{ width: 13, height: 13 }} />
                      </button>
                      <span style={{ padding: '6px 12px', fontWeight: 800, fontSize: 14, color: '#0a1628', borderLeft: '2px solid #e0e7ff', borderRight: '2px solid #e0e7ff', minWidth: 36, textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        style={{ padding: '6px 10px', backgroundColor: '#f8faff', border: 'none', cursor: 'pointer', color: '#1a56db', display: 'flex', alignItems: 'center' }}
                        className="hover:bg-blue-100 transition-colors"
                      >
                        <Plus style={{ width: 13, height: 13 }} />
                      </button>
                    </div>
                  </div>

                  {/* Total + remove */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
                    <span style={{ fontWeight: 900, fontSize: 15, color: '#1a56db' }}>
                      Fr {(item.price * item.quantity).toLocaleString()}
                    </span>
                    <button
                      onClick={() => removeItem(item._id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
                      className="hover:bg-red-50 text-gray-300 hover:text-red-400"
                    >
                      <Trash2 style={{ width: 15, height: 15 }} />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Continue shopping */}
            <div style={{ paddingTop: 8 }}>
              <Link
                to="/shop"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#1a56db', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}
                className="hover:underline"
              >
                <ArrowLeft style={{ width: 14, height: 14 }} />
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* ── RIGHT: Order Summary ── */}
          <div style={{ width: 320, flexShrink: 0 }}>
            <div style={{ backgroundColor: 'white', borderRadius: 12, border: '1.5px solid #e0e7ff', padding: 24, boxShadow: '0 2px 16px rgba(26,86,219,0.08)', position: 'sticky', top: 80 }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0a1628', marginBottom: 20 }}>Order Summary</h2>

              {/* Line items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                  <span style={{ fontWeight: 700, color: '#0a1628' }}>Fr {getTotalPrice().toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>Shipping</span>
                  <span style={{ color: '#16a34a', fontWeight: 700, fontSize: 13 }}>FREE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>Tax</span>
                  <span style={{ color: '#94a3b8', fontSize: 12, fontStyle: 'italic' }}>Calculated at checkout</span>
                </div>
              </div>

              {/* Total */}
              <div style={{ borderTop: '2px solid #e0e7ff', marginTop: 16, paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 900, fontSize: 16, color: '#0a1628' }}>Total</span>
                <span style={{ fontWeight: 900, fontSize: 22, color: '#1a56db' }}>Fr {getTotalPrice().toLocaleString()}</span>
              </div>

              {/* Checkout button */}
              <Link
                to="/checkout"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#1a56db', color: 'white', padding: '13px', borderRadius: 8, fontWeight: 800, fontSize: 15, textDecoration: 'none', marginTop: 20, boxShadow: '0 4px 14px rgba(26,86,219,0.35)', transition: 'all 0.2s' }}
                className="hover:bg-blue-700"
              >
                Proceed to Checkout →
              </Link>

              <p style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 10 }}>
                Secure checkout · Free delivery across Rwanda
              </p>

              {/* Trust mini-badges */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f4ff' }}>
                {[
                  { icon: <Shield style={{ width: 14, height: 14, color: '#1a56db' }} />, label: 'Secure' },
                  { icon: <Truck style={{ width: 14, height: 14, color: '#1a56db' }} />, label: 'Free Delivery' },
                  { icon: <Tag style={{ width: 14, height: 14, color: '#1a56db' }} />, label: 'Best Price' },
                ].map((b, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <div style={{ backgroundColor: '#eff6ff', padding: 6, borderRadius: 6 }}>{b.icon}</div>
                    <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;