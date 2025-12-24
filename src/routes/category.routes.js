import express from 'express';
import {
  getCategories,
  getCategory,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
} from '#controllers';
import { requireAuth, adminAuth } from '#middlewares';

export const categoryRoutes = express.Router();

categoryRoutes.get('/', getCategories);
categoryRoutes.get('/:id', getCategory);

categoryRoutes.post('/', requireAuth, adminAuth, createCategoryController);
categoryRoutes.put('/:id', requireAuth, adminAuth, updateCategoryController);
categoryRoutes.delete('/:id', requireAuth, adminAuth, deleteCategoryController);
