import { pool } from '#config';

export const insertCategory = async (client, { title, slug, link, image }) => {
  const { rows } = await client.query(
    `
    INSERT INTO categories (title, slug, link, image)
    VALUES ($1,$2,$3,$4)
    RETURNING *
    `,
    [title, slug, link, image]
  );

  return rows[0];
};

export const getAllCategories = async () => {
  const { rows } = await pool.query(
    `
    SELECT id, title, slug, link, image
    FROM categories
    WHERE is_active = true
    ORDER BY id
    `
  );

  return rows;
};

export const getCategoryById = async (id) => {
  const { rows } = await pool.query(`SELECT * FROM categories WHERE id = $1`, [
    id,
  ]);

  return rows[0];
};

export const updateCategoryById = async (id, data) => {
  const { title, slug, link, image, is_active } = data;

  const { rows } = await pool.query(
    `
    UPDATE categories
    SET
      title = $1,
      slug = $2,
      link = $3,
      image = $4,
      is_active = $5,
      updated_at = NOW()
    WHERE id = $6
    RETURNING *
    `,
    [title, slug, link, image, is_active, id]
  );

  return rows[0];
};

export const deleteCategoryById = async (id) => {
  await pool.query(`UPDATE categories SET is_active = false WHERE id = $1`, [
    id,
  ]);
};
