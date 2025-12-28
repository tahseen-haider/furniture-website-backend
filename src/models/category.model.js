import { pool } from '#config';

export const insertCategory = async (client, { title, slug, image }) => {
  const { rows } = await client.query(
    `
    INSERT INTO categories (title, slug, image)
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [title, slug, image]
  );

  return rows[0];
};

export const getAllCategories = async () => {
  const { rows } = await pool.query(
    `
    SELECT id, title, slug, image
    FROM categories
    WHERE is_active = true
    ORDER BY id
    `
  );

  rows.forEach((row) => {
    row.link = `${row.slug}`;
  });

  return rows;
};

export const getCategoryById = async (id) => {
  const { rows } = await pool.query(`SELECT * FROM categories WHERE id = $1`, [
    id,
  ]);

  return rows[0];
};

export const updateCategoryById = async (id, data) => {
  const { title, slug, image, is_active } = data;

  if (
    title === undefined ||
    slug === undefined ||
    image === undefined ||
    is_active === undefined
  ) {
    throw new Error('Missing required fields: title, slug, image, is_active');
  }

  const { rows } = await pool.query(
    `
    UPDATE categories
    SET
      title = $1,
      slug = $2,
      image = $3,
      is_active = $4,
      updated_at = NOW()
    WHERE id = $5
    RETURNING *
    `,
    [title, slug, image, is_active, id]
  );

  return rows[0];
};

export const deleteCategoryById = async (id) => {
  const deleted = await pool.query(
    `UPDATE categories SET is_active = false WHERE id = $1`,
    [id]
  );
  if (deleted.rowCount === 0) {
    throw new Error('Category not found');
  }
};
