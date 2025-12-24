import express from 'express';
import { requireAuth, adminAuth } from '#middlewares';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
} from '#controllers';

export const productRoutes = express.Router();

productRoutes.get('/', getProducts);
productRoutes.get('/category/:category', getProductsByCategory);
productRoutes.get('/:id', getProductById);

productRoutes.post('/', requireAuth, adminAuth, createProduct);
productRoutes.put('/:id', requireAuth, adminAuth, updateProduct);
productRoutes.delete('/:id', requireAuth, adminAuth, deleteProduct);
