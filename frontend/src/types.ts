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

export interface Review {
  _id: string;
  user: { _id: string; firstName: string; lastName: string };
  product: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
}

export interface OrderItem {
  name: string;
  qty: number;
  image: string;
  price: number;
  product: string;
}

export interface Order {
  _id: string;
  user?: string | User;
  orderItems: OrderItem[];
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  guestDetails?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  orderNotes?: string;
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
  };
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}