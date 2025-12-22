import express from 'express';
import { placeOrder, getOrder } from '#controllers';

export const ordersRoutes = express.Router();

ordersRoutes.post('/place-order', placeOrder);
ordersRoutes.get('/track-order/:trackingId', getOrder);
