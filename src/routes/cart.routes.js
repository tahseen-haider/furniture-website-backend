import express from 'express';
import { requireAuth } from '#middlewares';
import { getCart, updateCart, clearCart } from '#controllers';

export const cartRoutes = express.Router();

cartRoutes.use(requireAuth);

cartRoutes.get('/', getCart);
cartRoutes.put('/', updateCart);
cartRoutes.delete('/', clearCart);
