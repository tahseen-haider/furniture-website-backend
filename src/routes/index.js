import { Router } from 'express';
import { authRoutes } from './auth.routes.js';
import { cartRoutes } from './cart.routes.js';
import { ordersRoutes } from './orders.routes.js';
import { optionalAuth } from '#middlewares';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is running!' });
});

router.use('/auth', authRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', optionalAuth, ordersRoutes);

export { router as appRoutes };
