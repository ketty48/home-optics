import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Loader, Save, Upload, Trash2, Star, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../utils/api';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    category: '',
    stock: '',
    sku: '',
    images: [] as { url: string; alt: string; isMain: boolean }[],
    isActive: true,
    isFlashDeal: false,
    flashDealEndDate: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, catRes] = await Promise.all([
          apiClient.get(`/products/${id}`),
          apiClient.get('/products/categories'),
        ]);
        const p = productRes.data.data;
        setFormData({
          name: p.name,
          description: p.description,
          price: p.price,
          compareAtPrice: p.compareAtPrice || '',
          category: p.category,
          stock: p.stock,
          sku: p.sku,
          images: p.images || [],
          isActive: p.isActive,
          isFlashDeal: p.isFlashDeal,
          flashDealEndDate: p.flashDealEndDate ? p.flashDealEndDate.substring(0, 16) : '',
        });
        setCategories(catRes.data.data);
      } catch {
        toast.error('Failed to load product');
        navigate('/admin/products');
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const responses = await Promise.all(
        Array.from(files).map((file) => {
          const fd = new FormData();
          fd.append('image', file);
          return apiClient.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        })
      );
      const newImages = responses.map((res, i) => ({
        url: res.data,
        alt: formData.name || 'Product image',
        isMain: formData.images.length === 0 && i === 0,
      }));
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...newImages] }));
      toast.success(`${responses.length} image(s) uploaded`);
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (url: string) => {
    setFormData((prev) => {
      const updated = prev.images.filter((img) => img.url !== url);
      if (prev.images.find((img) => img.url === url)?.isMain && updated.length > 0) updated[0].isMain = true;
      return { ...prev, images: updated };
    });
  };

  const handleSetMain = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img) => ({ ...img, isMain: img.url === url })),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.isFlashDeal && !formData.flashDealEndDate) { toast.error('Please set a flash deal end date.'); return; }
    setLoading(true);
    try {
      await apiClient.put(`/products/${id}`, {
        ...formData,
        price: Number(formData.price),
        compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : undefined,
        stock: Number(formData.stock),
        images: formData.images.map((img) => ({ ...img, alt: formData.name })),
      });
      toast.success('Product updated');
      navigate('/admin/products');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 max-w-3xl w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/products" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-sm text-gray-500 truncate max-w-xs">{formData.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic info */}
        <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Basic Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input type="text" name="name" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.name} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" required rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" value={formData.description} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select name="category" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={formData.category} onChange={handleChange}>
                <option value="">Select Category</option>
                {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <input type="text" name="sku" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.sku} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Pricing & stock */}
        <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Pricing & Stock</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (Fr)</label>
              <input type="number" name="price" required min="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.price} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Original Price <span className="text-gray-400 font-normal">optional</span></label>
              <input type="number" name="compareAtPrice" min="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.compareAtPrice} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input type="number" name="stock" required min="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.stock} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Product Images</h2>
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors">
            {uploading ? <Loader size={16} className="animate-spin" /> : <Upload size={16} />}
            {uploading ? 'Uploading…' : 'Upload Images'}
            <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" disabled={uploading} multiple />
          </label>
          {formData.images.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {formData.images.map((image) => (
                <div key={image.url} className="relative group">
                  <img src={image.url} alt="Preview" className={`h-20 w-full object-cover rounded-lg border-2 ${image.isMain ? 'border-blue-500' : 'border-transparent'}`} />
                  <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button type="button" onClick={() => handleSetMain(image.url)} className={`${image.isMain ? 'text-yellow-400' : 'text-white hover:text-yellow-400'}`}>
                      <Star size={15} className={image.isMain ? 'fill-current' : ''} />
                    </button>
                    <button type="button" onClick={() => handleRemoveImage(image.url)} className="text-white hover:text-red-400">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  {image.isMain && <span className="absolute bottom-1 left-1 text-xs bg-blue-600 text-white px-1 rounded">Main</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Options */}
        <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Options</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input id="isActive" name="isActive" type="checkbox" className="w-4 h-4 accent-blue-600" checked={formData.isActive} onChange={handleChange} />
            <span className="text-sm text-gray-800">Product is Active (visible in store)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input id="isFlashDeal" name="isFlashDeal" type="checkbox" className="w-4 h-4 accent-blue-600" checked={formData.isFlashDeal} onChange={handleChange} />
            <span className="text-sm text-gray-800">Set as Flash Deal ⚡</span>
          </label>
          {formData.isFlashDeal && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Flash Deal End Date</label>
              <input type="datetime-local" name="flashDealEndDate" required={formData.isFlashDeal} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.flashDealEndDate} onChange={handleChange} />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link to="/admin/products" className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors" style={{ textDecoration: 'none' }}>
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-opacity" style={{ backgroundColor: '#1a56db' }}>
            {loading ? <Loader size={15} className="animate-spin" /> : <Save size={15} />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
