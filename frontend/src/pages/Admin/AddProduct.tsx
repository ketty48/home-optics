import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, Plus, Upload, Trash2, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../utils/api';

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
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

  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiClient.get('/products/categories');
        setCategories(res.data.data);
      } catch (error) {
        console.error('Failed to fetch categories');
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.images.length === 0) {
           toast.error('Please upload at least one product image.');
           return;
         }

    if (formData.isFlashDeal && !formData.flashDealEndDate) {
      toast.error('Please upload at least one product image.');
      return;
    }
    setLoading(true);

    try {
      const productData = {
        ...formData,
        price: Number(formData.price),
        compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : undefined,
        stock: Number(formData.stock),
        images: formData.images.map((img) => ({ ...img, alt: formData.name })),
        isActive: formData.isActive,
        isFlashDeal: formData.isFlashDeal,
        flashDealEndDate: formData.flashDealEndDate
      };

      await apiClient.post('/products', productData);
      toast.success('Product created successfully');
      navigate('/shop');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

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

    const uploadPromises = Array.from(files).map((file) => {
      const uploadData = new FormData();
      uploadData.append('image', file);
      return apiClient.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    });

    try {
      const responses = await Promise.all(uploadPromises);
      const newImageUrls = responses.map((res) => res.data);

      const newImages = newImageUrls.map((url, index) => ({
        url,
        alt: formData.name || 'Product image',
        isMain: formData.images.length === 0 && index === 0
      }));

      setFormData((prev) => ({ ...prev, images: [...prev.images, ...newImages] }));
      toast.success(`${newImageUrls.length} image(s) uploaded successfully`);
    } catch (error) {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (urlToRemove: string) => {
    setFormData((prev) => {
      const updatedImages = prev.images.filter((img) => img.url !== urlToRemove);
      // If main image is removed, make the new first image main
      if (prev.images.find((img) => img.url === urlToRemove)?.isMain && updatedImages.length > 0) {
        updatedImages[0].isMain = true;
      }
      return { ...prev, images: updatedImages };
    });
  };

  const handleSetMainImage = (urlToSetAsMain: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img) => ({
        ...img,
        isMain: img.url === urlToSetAsMain
      }))
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom max-w-3xl">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Name</label>
              <input
                type="text"
                name="name"
                required
                className="input mt-1"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                required
                rows={4}
                className="input mt-1"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Price (Fr)</label>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  className="input mt-1"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Original Price (Fr)</label>
                <input
                  type="number"
                  name="compareAtPrice"
                  min="0"
                  className="input mt-1"
                  value={formData.compareAtPrice}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                <input
                  type="number"
                  name="stock"
                  required
                  min="0"
                  className="input mt-1"
                  value={formData.stock}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  name="category"
                  required
                  className="input mt-1"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">SKU</label>
                <input
                  type="text"
                  name="sku"
                  required
                  className="input mt-1"
                  value={formData.sku}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Product Images</label>
              <div className="mt-1">
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg border border-gray-300 transition-colors flex items-center space-x-2">
                  {uploading ? <Loader className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  <span className="text-sm font-medium text-gray-700">
                    {uploading ? 'Uploading...' : 'Upload Images'}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleImageUpload}
                    accept="image/*"
                    disabled={uploading}
                    multiple
                  />
                </label>
              </div>
              {formData.images.length > 0 && (
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {formData.images.map((image) => (
                    <div key={image.url} className="relative group">
                      <img
                        src={image.url}
                        alt="Preview"
                        className={`h-24 w-24 object-cover rounded-md border-2 ${
                          image.isMain ? 'border-primary-600' : 'border-transparent'
                        }`}
                      />
                      <div className="absolute top-0 right-0 flex flex-col items-center p-1 bg-black bg-opacity-50 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" onClick={() => handleRemoveImage(image.url)} className="text-white hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => handleSetMainImage(image.url)} className={`mt-1 ${image.isMain ? 'text-yellow-400' : 'text-white hover:text-yellow-400'}`}>
                          <Star className={`w-4 h-4 ${image.isMain ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={formData.isActive}
                onChange={handleChange}
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Product is Active
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="isFlashDeal"
                name="isFlashDeal"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={formData.isFlashDeal}
                onChange={handleChange}
              />
              <label htmlFor="isFlashDeal" className="ml-2 block text-sm text-gray-900">Set as Flash Deal</label>
            </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Flash Deal End Date</label>
                <input
                  type="datetime-local"
                  name="flashDealEndDate"
                  className="input mt-1"
                  required={formData.isFlashDeal}
                  value={formData.flashDealEndDate}
                  onChange={handleChange}
                />
              </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex items-center space-x-2"
              >
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                <span>Create Product</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;