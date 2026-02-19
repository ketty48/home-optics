import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    product: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Product'
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    title: {
      type: String,
      required: [true, 'Review title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false
    },
    helpfulCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure one review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });
reviewSchema.index({ product: 1, createdAt: -1 });

export default mongoose.model<IReview>('Review', reviewSchema);
