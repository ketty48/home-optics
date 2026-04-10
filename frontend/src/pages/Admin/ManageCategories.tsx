import { useState, useEffect } from 'react';
import { Trash2, Plus} from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../utils/api';
import { Category } from '../../types';

const ManageCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get('/products/categories/all');
      setCategories(res.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      const res = await apiClient.post('/products/categories', { name: newCategory });
      setCategories([...categories, res.data.data]);
      setNewCategory('');
      toast.success('Category added');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add category');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this category?')) {
      try {
        await apiClient.delete(`/products/categories/${id}`);
        setCategories(categories.filter(c => c._id !== id));
        toast.success('Category deleted');
      } catch (error) {
        toast.error('Failed to delete category');
      }
    }
  };

  if (loading) return <div className="p-12 text-center">Loading...</div>;

  return (
    <div className="p-3 sm:p-6 max-w-2xl w-full">
      <h1 className="text-xl sm:text-2xl font-bold mb-5 text-gray-900">Categories</h1>

      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm mb-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Add New Category</h2>
        <form onSubmit={handleAddCategory} className="flex gap-2 sm:gap-4">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Enter new category name"
            className="input flex-1"
          />
          <button type="submit" className="btn btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" /> Add
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((cat) => (
              <tr key={cat._id}>
                <td className="px-6 py-4">{cat.name}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(cat._id)} className="text-red-600 hover:text-red-800">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default ManageCategories;