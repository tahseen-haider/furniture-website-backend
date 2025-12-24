import {
  insertCategory,
  getAllCategories,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
} from '#models';
import { pool } from '#config';

export const createCategory = async (data) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const category = await insertCategory(client, data);
    await client.query('COMMIT');
    return category;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const fetchCategories = async () => {
  return getAllCategories();
};

export const fetchCategory = async (id) => {
  return getCategoryById(id);
};

export const updateCategory = async (id, data) => {
  return updateCategoryById(id, data);
};

export const deleteCategory = async (id) => {
  return deleteCategoryById(id);
};
