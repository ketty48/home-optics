import { Response } from 'express';
import Review from '../models/Review';
import Product from '../models/Product';
import Order from '../models/Order';
import { AuthRequest } from '../middleware/auth';

// Helper: recalculate product rating and numReviews
const syncProductRating = async (productId: string) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].count,
    });
  } else {
    await Product.findByIdAndUpdate(productId, { rating: 0, numReviews: 0 });
  }
};

// @desc    Get all reviews for a product
// @route   GET /api/products/:productId/reviews
// @access  Public
export const getProductReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create a review
// @route   POST /api/products/:productId/reviews
// @access  Private
export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;

    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    // Check product exists
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    // Check already reviewed
    const existing = await Review.findOne({ user: req.user._id, product: productId });
    if (existing) {
      res.status(400).json({ success: false, message: 'You have already reviewed this product' });
      return;
    }

    // Check if verified purchase (user has a delivered order containing this product)
    const verifiedOrder = await Order.findOne({
      user: req.user._id,
      status: 'Delivered',
      'orderItems.product': productId,
    });

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating: Number(rating),
      title,
      comment,
      isVerifiedPurchase: !!verifiedOrder,
    });

    await syncProductRating(productId);

    const populated = await review.populate('user', 'firstName lastName');
    res.status(201).json({ success: true, data: populated });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    } else {
      res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
  }
};

// @desc    Delete a review (owner or admin)
// @route   DELETE /api/products/:productId/reviews/:reviewId
// @access  Private
export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found' });
      return;
    }

    const isOwner = review.user.toString() === req.user?._id.toString();
    const isAdmin = req.user?.role === 'admin';
    if (!isOwner && !isAdmin) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    await review.deleteOne();
    await syncProductRating(req.params.productId);

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
