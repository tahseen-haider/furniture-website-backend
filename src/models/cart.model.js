import { pool } from '#config';

export const getCartByUserId = async (userId) => {
  const { rows } = await pool.query(
    'SELECT items FROM carts WHERE user_id = $1',
    [userId]
  );
  return rows[0]?.items || null;
};

export const upsertCart = async (userId, items) => {
  const { rows } = await pool.query(
    `
    INSERT INTO carts (user_id, items)
    VALUES ($1, $2)
    ON CONFLICT (user_id)
    DO UPDATE SET
      items = EXCLUDED.items,
      updated_at = CURRENT_TIMESTAMP
    RETURNING items
    `,
    [userId, items]
  );

  return rows[0].items;
};

export const clearCartByUserId = async (userId) => {
  await pool.query('DELETE FROM carts WHERE user_id = $1', [userId]);
};
