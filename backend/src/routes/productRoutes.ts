import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getProductBySlug,
  createCategory,
  deleteCategory,
  getAllCategories
} from '../controllers/productController';
import { protect, authorize, optionalProtect } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(optionalProtect, getProducts)
  .post(protect, authorize('admin'), createProduct);

router.get('/categories', getCategories);
router.post('/categories', protect, authorize('admin'), createCategory);
router.get('/categories/all', protect, authorize('admin'), getAllCategories);
router.delete('/categories/:id', protect, authorize('admin'), deleteCategory);

router.get('/slug/:slug', getProductBySlug);

router.route('/:id')
  .get(getProduct)
  .put(protect, authorize('admin'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

export default router;