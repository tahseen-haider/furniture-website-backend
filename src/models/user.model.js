import { pool } from '#config';

export const createUser = async ({
  email,
  password,
  username,
  verificationToken,
}) => {
  const { rows: existingRows } = await pool.query(
    'SELECT id FROM users WHERE email = $1 OR username = $2',
    [email, username]
  );

  if (existingRows.length > 0) {
    const error = new Error(
      'User already exists. Try a different email or username.'
    );
    error.status = 409;
    throw error;
  }

  const { rows } = await pool.query(
    `INSERT INTO users (email, password, username, verification_token)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, username, is_verified`,
    [email, String(password), username, verificationToken]
  );

  return rows[0];
};

export const findUserByEmail = async (email) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [
    email,
  ]);
  return rows[0] || null;
};

export const verifyUserByToken = async (token) => {
  const { rows } = await pool.query(
    `UPDATE users
     SET is_verified = TRUE,
         verification_token = NULL
     WHERE verification_token = $1
     RETURNING id, email`,
    [token]
  );

  return rows[0] || null;
};
