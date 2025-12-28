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

    const { rows: existing } = await client.query(
      'SELECT id FROM categories WHERE slug = $1',
      [data.slug]
    );

    if (existing.length > 0) {
      await client.query('ROLLBACK');
      return { exists: true, id: existing[0].id };
    }

    const category = await insertCategory(client, data);

    await client.query('COMMIT');
    return { exists: false, category };
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
