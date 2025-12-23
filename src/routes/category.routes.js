import express from 'express';
import { getCategories } from '#controllers';

export const categoryRoutes = express.Router();

categoryRoutes.get('/', getCategories);
