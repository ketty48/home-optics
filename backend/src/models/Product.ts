import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
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
  brand?: string;
  specifications: Map<string, string>;
  tags: string[];
  rating: number;
  numReviews: number;
  isFeatured: boolean;
  isFlashDeal: boolean;
  isActive: boolean;
  createdAt: Date;
  flashDealEndDate?: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative']
    },
    compareAtPrice: {
      type: Number,
      min: [0, 'Compare price cannot be negative']
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true
    },
    subCategory: {
      type: String,
      trim: true
    },
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String, default: '' },
        isMain: { type: Boolean, default: false }
      }
    ],
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true
    },
    brand: {
      type: String,
      trim: true
    },
    specifications: {
      type: Map,
      of: String,
      default: new Map()
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5']
    },
    numReviews: {
      type: Number,
      default: 0,
      min: [0, 'Number of reviews cannot be negative']
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isFlashDeal: {
      type: Boolean,
      default: false
    },
     flashDealEndDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ slug: 1 });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function () {
  if (this.compareAtPrice && this.compareAtPrice > this.price) {
    return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
  }
  return 0;
});

// Virtual for in stock status
productSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

// Pre-save hook to generate slug from name
productSchema.pre('validate', function (next) {
  if (this.isModified('name') || !this.slug) {
    if (this.name) {
      this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
  }
  next();
});

export default mongoose.model<IProduct>('Product', productSchema);
