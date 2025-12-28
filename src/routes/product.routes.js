import express from 'express';
import {
  getProducts,
  getProductById,
  getProductsByCategory,
} from '#controllers';

export const productRoutes = express.Router();

productRoutes.get('/', getProducts);
productRoutes.get('/category/:category', getProductsByCategory);
productRoutes.get('/:id', getProductById);
