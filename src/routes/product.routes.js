import express from 'express';
import { getProductsByCategory, getProductsById } from '#controllers';

export const productRoutes = express.Router();

productRoutes.get('/category/:category', getProductsByCategory);
productRoutes.get('/:productId', getProductsById);
