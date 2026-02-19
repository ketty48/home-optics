import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { useState } from 'react';
import { Product } from '../types';
import { useCartStore } from '../store/cartStore';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  // Main image — prefer isMain, fallback to first
  const mainImage =
    product.images?.find((img) => img.isMain)?.url ||
    product.images?.[0]?.url ||
    '';

  // Hover image — second image if available
  const hoverImage = product.images?.[1]?.url;
  const [isHovered, setIsHovered] = useState(false);

  const discountPercent =
    product.discountPercentage ||
    (product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: 'white',
        borderRadius: 10,
        overflow: 'hidden',
        border: isHovered ? '1.5px solid #1a56db' : '1.5px solid #e0e7ff',
        boxShadow: isHovered
          ? '0 8px 24px rgba(26,86,219,0.14)'
          : '0 2px 8px rgba(26,86,219,0.05)',
        transition: 'border 0.2s, box-shadow 0.2s',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        fontFamily: "'Nunito', 'Segoe UI', sans-serif",
      }}
    >
      <Link to={`/product/${product.slug}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Image */}
        <div style={{ position: 'relative', backgroundColor: '#f8faff', overflow: 'hidden', aspectRatio: '1' }}>
          <img
            src={isHovered && hoverImage ? hoverImage : mainImage}
            alt={product.name}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.4s ease',
              transform: isHovered ? 'scale(1.06)' : 'scale(1)',
            }}
            onError={e => { e.currentTarget.src = '/placeholder.png'; }}
          />

          {/* Discount badge */}
          {discountPercent > 0 && (
            <span style={{
              position: 'absolute', top: 8, left: 8,
              backgroundColor: '#dc2626', color: 'white',
              padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 800,
            }}>
              -{discountPercent}%
            </span>
          )}

           {/* Flash Deal badge */}
           {product.isFlashDeal && (
            <span style={{
              position: 'absolute', top: 8, right: 8,
              backgroundColor: '#fbbf24', color: '#0a1628',
              padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 800,
            }}>
             ⚡ Flash Deal
            </span>
          )}

          {/* Featured badge */}
          {/* {product.isFeatured && (
            <span style={{
              position: 'absolute', top: discountPercent > 0 ? 30 : 8, left: 8,
              backgroundColor: '#1a56db', color: 'white',
              padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 800,
            }}>
              Featured
            </span>
          )} */}

          {/* Out of stock overlay */}
          {product.stock <= 0 && (
            <div style={{
              position: 'absolute', inset: 0,
              backgroundColor: 'rgba(15,23,42,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{
                backgroundColor: 'white', color: '#64748b',
                padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 800,
              }}>
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '10px 12px 4px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Category */}
          <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {product.category}
          </span>

          {/* Name */}
          <h3 style={{
            fontSize: 14, fontWeight: 700, color: '#0a1628', margin: 0, lineHeight: 1.35,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {product.name}
          </h3>

          {/* Rating + price row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 15, fontWeight: 900, color: '#1a56db' }}>
                Fr {product.price.toLocaleString()}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span style={{ fontSize: 11, color: '#94a3b8', textDecoration: 'line-through' }}>
                  Fr {product.compareAtPrice.toLocaleString()}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Star style={{ width: 13, height: 13, color: '#f59e0b', fill: '#f59e0b' }} />
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                {product.rating > 0 ? product.rating.toFixed(1) : 'New'}
              </span>
            </div>
          </div>

          {/* Low stock warning */}
          {product.stock > 0 && product.stock <= 5 && (
            <span style={{ fontSize: 10, color: '#f59e0b', fontWeight: 700 }}>
              ⚠ Only {product.stock} left!
            </span>
          )}
        </div>
      </Link>

      {/* Add to Cart */}
      <div style={{ padding: '8px 12px 12px' }}>
        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            backgroundColor: added ? '#16a34a' : (product.stock > 0 ? '#1a56db' : '#e2e8f0'),
            color: product.stock > 0 ? 'white' : '#94a3b8',
            border: 'none', borderRadius: 7, padding: '9px 0',
            fontSize: 13, fontWeight: 700, cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
            transition: 'background-color 0.2s',
          }}
        >
          <ShoppingCart style={{ width: 15, height: 15 }} />
          {added ? '✓ Added!' : 'Add to Cart'}
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;