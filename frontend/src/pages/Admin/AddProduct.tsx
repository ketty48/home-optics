import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../utils/api';
import ProductForm, { ProductFormData, emptyFormData } from '../../components/ProductForm';

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>(emptyFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.images.length === 0) { toast.error('Please upload at least one image.'); return; }
    if (formData.isFlashDeal && !formData.flashDealEndDate) { toast.error('Please set a flash deal end date.'); return; }
    setLoading(true);
    try {
      await apiClient.post('/products', {
        ...formData,
        price: Number(formData.price),
        compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : undefined,
        stock: Number(formData.stock),
        images: formData.images.map(img => ({ ...img, alt: formData.name })),
      });
      toast.success('Product created successfully');
      navigate('/admin/products');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProductForm
      title="Add Product"
      subtitle="Fill in the details below to create a new product."
      submitLabel="Create Product"
      SubmitIcon={Plus}
      formData={formData}
      setFormData={setFormData}
      loading={loading}
      onSubmit={handleSubmit}
    />
  );
};

export default AddProduct;
