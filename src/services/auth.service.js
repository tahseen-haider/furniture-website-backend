import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import { createUser, findUserByEmail, verifyUserByToken } from '#models';
import { sendVerificationEmail } from '#utils';

export const signupService = async (email, password, username) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString('hex');

  const user = await createUser({
    email,
    password: hashedPassword,
    username,
    verificationToken,
  });

  await sendVerificationEmail(email, verificationToken);
  return user;
};

export const verifyEmailService = async (token) => {
  const user = await verifyUserByToken(token);
  if (!user) throw new Error('Invalid or expired token');
  return user;
};

export const loginService = async (email, password) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error('User not found');
  if (!user.is_verified) throw new Error('Email not verified');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid password');

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });

  return {
    user: { id: user.id, email: user.email, username: user.username },
    token,
  };
};
