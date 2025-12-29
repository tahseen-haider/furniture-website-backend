import { pool } from '#config';
import { findUserById } from '#models';

export const getAllUsersService = async () => {
  const client = await pool.connect();

  try {
    const { rows } = await client.query(
      `
      SELECT
        id,
        username,
        email,
        role,
        created_at AS "createdAt"
      FROM users
      WHERE is_verified = true
      ORDER BY created_at DESC
      `
    );

    return rows;
  } catch {
    throw new Error('Failed to fetch users');
  } finally {
    client.release();
  }
};

export const getUserByIdService = async (userId) => {
  return await findUserById(userId);
};
