import { Request, Response } from 'express';
import { FilterQuery } from 'mongoose';
import Product from '../models/Product';
import Category from '../models/Category';
import { AuthRequest } from '../middleware/auth';
import { IProduct } from '../models/Product';

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Build query
    const queryObj: FilterQuery<IProduct> = {};

    // Category filter
    if (req.query.category) {
      const category = req.query.category as string;
      // Escape special regex characters and use case-insensitive exact match
      queryObj.category = { $regex: new RegExp(`^${category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') };
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      queryObj.price = {};
      if (req.query.minPrice) {
        queryObj.price.$gte = Number(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        queryObj.price.$lte = Number(req.query.maxPrice);
      }
    }

    // Search query
    if (req.query.search) {
      const search = req.query.search as string;
      queryObj.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Featured filter
    if (req.query.featured === 'true') {
      queryObj.isFeatured = true;
    }

     // Flash deal filter
     if (req.query.flashDealStatus && req.query.flashDealStatus !== 'all') {
      if (req.query.flashDealStatus === 'active') {
        queryObj.isFlashDeal = true;
        queryObj.flashDealEndDate = { $gt: new Date() };
      } else if (req.query.flashDealStatus === 'inactive') {
        queryObj.isFlashDeal = false;
      }
      else if (req.query.flashDealStatus === 'scheduled') {
        queryObj.isFlashDeal = true;
        queryObj.flashDealEndDate = { $gt: new Date() };
      }
     
    }



     // Flash deal filter
    if (req.query.flashDeal === 'true') {
      queryObj.isFlashDeal = true;
    }

    // On Sale filter
    if (req.query.onSale === 'true') {
      queryObj.compareAtPrice = { $exists: true, $ne: null };
      queryObj.$expr = { $gt: ['$compareAtPrice', '$price'] };
    }

    // Admin sees all, users only see active products
    if (req.user?.role !== 'admin') {
      queryObj.isActive = true;
    }

    // Sort
    let sortOptions: { [key: string]: 1 | -1 } = {};
    if (req.query.sort) {
      const sortField = req.query.sort as string;
      switch (sortField) {
        case 'price-asc':
          sortOptions = { price: 1 };
          break;
        case 'price-desc':
          sortOptions = { price: -1 };
          break;
        case 'name-asc':
          sortOptions = { name: 1 };
          break;
        case 'name-desc':
          sortOptions = { name: -1 };
          break;
        case 'newest':
          sortOptions = { createdAt: -1 };
          break;
        case 'discount':
          // This requires an aggregation pipeline, handled below
          break;
        default:
          sortOptions = { createdAt: -1 };
      }
    } else {
      sortOptions = { createdAt: -1 };
    }

    // Use aggregation pipeline to allow sorting by calculated discount
    const aggregationPipeline: any[] = [{ $match: queryObj }];

    if (req.query.sort === 'discount') {
      aggregationPipeline.push({
        $addFields: {
          // Calculate discount percentage for sorting
          discountSort: {
            $cond: {
              if: { $and: [{ $ne: ['$compareAtPrice', null] }, { $gt: ['$compareAtPrice', 0] }] },
              then: { $divide: [{ $subtract: ['$compareAtPrice', '$price'] }, '$compareAtPrice'] },
              else: 0
            }
          }
        }
      });
      aggregationPipeline.push({ $sort: { discountSort: -1 } });
    } else {
      aggregationPipeline.push({ $sort: sortOptions });
    }

    // Execute queries in parallel for efficiency
    const [products, total] = await Promise.all([
      Product.aggregate(aggregationPipeline).skip(skip).limit(limit),
      Product.countDocuments(queryObj)
    ]);

    // Manually add back virtuals since aggregation returns plain objects
    const productsWithVirtuals = products.map(p => ({
      ...p,
      id: p._id,
      discountPercentage: p.compareAtPrice && p.compareAtPrice > p.price ? Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100) : 0,
      inStock: p.stock > 0
    }));

    res.status(200).json({
      success: true,
      count: productsWithVirtuals.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: productsWithVirtuals
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
export const getProductBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const product = await Product.create(req.body);


    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    // Update fields
    Object.assign(product, req.body);
    await product.save();

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get categories
// @route   GET /api/products/categories
// @access  Public
export const getCategories = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    // Try to fetch from Category collection first
    let categories = await Category.find().select('name -_id');
    let categoryNames = categories.map(c => c.name);

    if (categoryNames.length === 0) {
       categoryNames = await Product.distinct('category');
    }

    res.status(200).json({
      success: true,
      data: categoryNames
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create category
// @route   POST /api/products/categories
// @access  Private/Admin
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    const category = await Category.create({ name });
    res.status(201).json({ success: true, data: category });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all categories (Admin)
// @route   GET /api/products/categories/all
// @access  Private/Admin
export const getAllCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find();
    res.status(200).json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/products/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
