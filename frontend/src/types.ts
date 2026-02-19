export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  addresses: Array<{
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    isDefault: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  image?: string;
  productCount?: number;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  subCategory?: string;
  images: Array<{
    url: string;
    alt: string;
    isMain: boolean;
  }>;
  stock: number;
  sku: string;
  rating: number;
  numReviews: number;
  discountPercentage?: number;
  isActive: boolean;
  tags?: string[];
  isFeatured?: boolean;
  isFlashDeal?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
}