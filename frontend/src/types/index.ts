export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  avatar?: string;
}

export interface ProductImage {
  _id?: string;
  id?: string;
  url: string;
  alt: string;
  isMain: boolean;
}

export interface Product {
  _id: string;
  id?: string; // virtual from mongoose toJSON
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  subCategory?: string;
  images: ProductImage[];
  stock: number;
  sku: string;
  brand?: string;
  specifications: Record<string, string>;
  tags: string[];
  rating: number;
  numReviews: number;
  isFeatured: boolean;
  isActive: boolean;
  discountPercentage: number;  // virtual — always present (0 if no discount)
  inStock: boolean;            // virtual — always present
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

export interface Order {
  _id: string;
  user: string;
  orderItems: OrderItem[];
  shippingAddress: Address;
  paymentMethod: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface Review {
  _id: string;
  user: User;
  product: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  total: number;
  totalPages: number;
  currentPage: number;
  data: T[];
}

// ─── Category (returned by /products/categories/all) ─────────────────────────
export interface Category {
  _id: string;
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
}