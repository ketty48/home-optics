import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../utils/api';
import ProductForm, { ProductFormData, emptyFormData } from '../../components/ProductForm';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState<ProductFormData>(emptyFormData);
  const [productName, setProductName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get(`/products/${id}`);
        const p = res.data.data;
        setProductName(p.name);
        setFormData({
          name: p.name,
          description: p.description,
          price: String(p.price),
          compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : '',
          category: p.category,
          stock: String(p.stock),
          sku: p.sku,
          images: p.images || [],
          isActive: p.isActive,
          isFlashDeal: p.isFlashDeal,
          flashDealEndDate: p.flashDealEndDate ? p.flashDealEndDate.substring(0, 16) : '',
        });
      } catch {
        toast.error('Failed to load product');
        navigate('/admin/products');
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [id, navigate]);

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
        images: formData.images.map(img => ({ ...img, alt: formData.name })),
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
    <ProductForm
      title="Edit Product"
      subtitle={productName}
      submitLabel="Save Changes"
      SubmitIcon={Save}
      formData={formData}
      setFormData={setFormData}
      loading={loading}
      onSubmit={handleSubmit}
    />
  );
};

export default EditProduct;
