import express from 'express';
import { getCategories, getCategory } from '#controllers';

export const categoryRoutes = express.Router();

categoryRoutes.get('/', getCategories);
categoryRoutes.get('/:id', getCategory);
