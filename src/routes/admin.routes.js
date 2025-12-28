import express from 'express';
import { requireAuth, adminAuth } from '#middlewares';
import {
  createProduct,
  deleteProduct,
  updateProduct,
  getProductsAdmin,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
  getCategories,
  getOrders,
  getOrder,
  getAllUsers,
  getUserById,
  getStatsAdmin,
} from '#controllers';

export const adminRoutes = express.Router();

adminRoutes.use(requireAuth);
adminRoutes.use(adminAuth);

adminRoutes.get('/dashboard/stats', getStatsAdmin);

adminRoutes.get('/products', getProductsAdmin);
adminRoutes.post('/products', createProduct);
adminRoutes.put('/products/:id', updateProduct);
adminRoutes.delete('/products/:id', deleteProduct);

adminRoutes.get('/categories', getCategories);
adminRoutes.post('/categories', createCategoryController);
adminRoutes.put('/categories/:id', updateCategoryController);
adminRoutes.delete('/categories/:id', deleteCategoryController);

adminRoutes.get('/orders', getOrders);
adminRoutes.get('/orders/:trackingId', getOrder);

adminRoutes.get('/users', getAllUsers);
adminRoutes.get('/users/:userId', getUserById);
