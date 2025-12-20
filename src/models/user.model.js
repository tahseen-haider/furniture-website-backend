import { pool } from '#config';

export const updatePasswordByEmail = async (email, hashedPassword) => {
  const { rows } = await pool.query(
    `UPDATE users
     SET password = $1,
         verification_token = NULL
     WHERE email = $2
     RETURNING id, email`,
    [hashedPassword, email]
  );

  return rows[0] || null;
};

export const findUserByGoogleOrEmail = async (googleId, email) => {
  const { rows } = await pool.query(
    `SELECT * FROM users
     WHERE google_id = $1 OR email = $2`,
    [googleId, email]
  );

  return rows[0] || null;
};

export const createGoogleUser = async ({ email, username, googleId }) => {
  const { rows } = await pool.query(
    `INSERT INTO users (
        email,
        username,
        password,
        verification_token,
        google_id,
        is_verified
     )
     VALUES ($1, $2, NULL, NULL, $3, TRUE)
     RETURNING *`,
    [email, username, googleId]
  );

  return rows[0];
};

export const attachGoogleIdToUser = async (userId, googleId) => {
  const { rows } = await pool.query(
    `UPDATE users
     SET google_id = $1
     WHERE id = $2
     RETURNING *`,
    [googleId, userId]
  );

  return rows[0];
};

export const verifyUserById = async (userId) => {
  const { rows } = await pool.query(
    `UPDATE users
     SET is_verified = TRUE
     WHERE id = $1
     RETURNING *`,
    [userId]
  );

  return rows[0];
};

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

export const setVerificationToken = async (email, token) => {
  const { rows: users } = await pool.query(
    `
    SELECT is_verified FROM users WHERE email = $1
  `,
    [email]
  );

  if (users.length === 0) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  const { rows } = await pool.query(
    `UPDATE users
     SET verification_token = $1
     WHERE email = $2
     RETURNING id, email`,
    [token, email]
  );

  return rows[0];
};

export const findUserByEmail = async (email) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [
    email,
  ]);
  return rows[0] || null;
};

export const findUserById = async (id) => {
  const { rows } = await pool.query(
    'SELECT id, email, username FROM users WHERE id = $1',
    [id]
  );
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
