import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Plus, Search, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../utils/api';
import { Product } from '../../types';
import ConfirmModal from '../../components/ConfirmModal';

const ManageProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const res = await apiClient.get('/products?limit=200');
      setProducts(res.data.data);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/products/${id}`);
      toast.success('Product deleted');
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      toast.error('Failed to delete product');
    } finally {
      setConfirmId(null);
    }
  };

  const filtered = products.filter((p) =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{products.length} total</p>
        </div>
        <Link
          to="/admin/products/add"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white hover:opacity-90 flex-shrink-0"
          style={{ backgroundColor: '#1a56db', textDecoration: 'none' }}
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Add Product</span>
          <span className="sm:hidden">Add</span>
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or category…"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-14 flex flex-col items-center gap-3 text-gray-400">
            <ShoppingBag size={32} className="opacity-30" />
            <p className="text-sm">No products found.</p>
            <Link to="/admin/products/add" className="text-sm text-blue-600 font-medium hover:underline">
              Add your first product
            </Link>
          </div>
        ) : (
          <>
            {/* ── Desktop table (sm and up) ── */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 text-left">Product</th>
                    <th className="px-5 py-3 text-left">Category</th>
                    <th className="px-5 py-3 text-left">Price</th>
                    <th className="px-5 py-3 text-left">Stock</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            className="h-10 w-10 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                            src={product.images[0]?.url}
                            alt={product.name}
                          />
                          <div>
                            <p className="font-medium text-gray-900 leading-tight text-sm">{product.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">SKU: {product.sku}</p>
                          </div>
                          {product.isFlashDeal && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 font-semibold px-2 py-0.5 rounded-full">⚡</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{product.category}</td>
                      <td className="px-5 py-3">
                        <span className="font-semibold text-gray-900 text-xs">Fr {product.price.toLocaleString()}</span>
                        {product.compareAtPrice && (
                          <span className="ml-1 text-xs text-gray-400 line-through">Fr {product.compareAtPrice.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium ${product.stock <= 5 ? 'text-red-600' : 'text-gray-700'}`}>
                          {product.stock}{product.stock <= 5 && <span className="ml-1 text-red-400">(low)</span>}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {product.isActive
                          ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Active</span>
                          : <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">Inactive</span>
                        }
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/admin/products/edit/${product._id}`} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors">
                            <Edit size={15} />
                          </Link>
                          <button onClick={() => setConfirmId(product._id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile cards (below sm) ── */}
            <div className="sm:hidden divide-y divide-gray-100">
              {filtered.map((product) => (
                <div key={product._id} className="flex items-center gap-3 px-4 py-3">
                  <img
                    className="h-12 w-12 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                    src={product.images[0]?.url}
                    alt={product.name}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-semibold text-gray-900 text-sm truncate">{product.name}</p>
                      {product.isFlashDeal && <span className="text-xs">⚡</span>}
                    </div>
                    <p className="text-xs text-gray-400">{product.category}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs font-bold text-gray-900">Fr {product.price.toLocaleString()}</span>
                      <span className={`text-xs ${product.stock <= 5 ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                        Stock: {product.stock}
                      </span>
                      {product.isActive
                        ? <span className="text-xs bg-green-100 text-green-700 font-semibold px-1.5 py-0.5 rounded-full">Active</span>
                        : <span className="text-xs bg-gray-100 text-gray-500 font-semibold px-1.5 py-0.5 rounded-full">Inactive</span>
                      }
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <Link to={`/admin/products/edit/${product._id}`} className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors">
                      <Edit size={16} />
                    </Link>
                    <button onClick={() => setConfirmId(product._id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={!!confirmId}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => confirmId && handleDelete(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
};

export default ManageProducts;
