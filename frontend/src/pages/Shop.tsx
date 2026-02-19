import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Product, PaginatedResponse } from '../types';
import apiClient from '../utils/api';
import { useAuthStore } from '../store/authStore';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1); 
    const { isAuthenticated, user } = useAuthStore();
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' }
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiClient.get('/products/categories');
        setCategories(res.data.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {



     const fetchProducts = async () => {
      
      

      try {
        setLoading(true);
        const params = new URLSearchParams(searchParams);
        
        const response = await apiClient.get<PaginatedResponse<Product>>(
          `/products?${params.toString()}`
        );
        
         setProducts(response.data.data);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
  

    fetchProducts();
  }, [searchParams]);

   useEffect(() => {
    // Check if the URL contains flashDeal=true and persist it
    if (searchParams.get('flashDeal') === 'true') {
      const params = new URLSearchParams(searchParams);
      setSearchParams(params, { replace: true }); // Persist the flashDeal parameter
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);




  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1'); // Reset to first page
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

   const isAdmin = isAuthenticated && user?.role === 'admin';

  const handleAddProduct = () => {
    // Redirect to the add product page
    window.location.href = '/admin/products/add';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shop</h1>
          <p className="text-gray-600">
            Browse our collection of quality products
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64">
          {isAdmin && (
             <button onClick={handleAddProduct} className="btn btn-primary flex items-center space-x-2">Add Product</button>
          )}
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full btn btn-secondary mb-4 flex items-center justify-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>

            {/* Filters */}
            <div
              className={`${
                showFilters ? 'block' : 'hidden'
              } lg:block bg-white rounded-lg p-6 shadow-sm`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Clear All
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Category</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label
                      key={category}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="category"
                        checked={searchParams.get('category') === category}
                        onChange={() => updateFilter('category', category)}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={!searchParams.get('category')}
                      onChange={() => updateFilter('category', '')}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">All Categories</span>
                  </label>
                </div>
              </div>

              {/* Sale Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Status</h4>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={searchParams.get('onSale') === 'true'}
                    onChange={(e) => updateFilter('onSale', e.target.checked ? 'true' : '')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">On Sale</span>
                </label>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Price Range</h4>
                <div className="space-y-3">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={searchParams.get('minPrice') || ''}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                    className="input text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={searchParams.get('maxPrice') || ''}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    className="input text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort and Results Count */}
            
            <div className="bg-white rounded-lg p-4 shadow-sm mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-gray-600">
                Showing {products.length} products
              </p>
              <select
                value={searchParams.get('sort') || 'newest'}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="input text-sm max-w-xs"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Products */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card h-96 animate-pulse bg-gray-200" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center space-x-2">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => updateFilter('page', String(i + 1))}
                        className={`px-4 py-2 rounded-lg ${
                          currentPage === i + 1
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No products found</p>
                <button
                
                  onClick={clearFilters}
                  className="mt-4 btn btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};



export default Shop;
