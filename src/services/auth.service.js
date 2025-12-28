import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import {
  createUser,
  findUserByEmail,
  verifyUserByToken,
  setVerificationToken,
  findUserById,
  updatePasswordByEmail,
  findUserByGoogleOrEmail,
  createGoogleUser,
  attachGoogleIdToUser,
  verifyUserById,
} from '#models';
import { sendVerificationEmail, sendPasswordResetEmail } from '#utils';

const createError = (message, status = 400) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

export const resetPasswordService = async (email, token, newPassword) => {
  const user = await findUserByEmail(email);
  if (!user) throw createError('User not found', 404);

  if (user.verification_token !== token) {
    throw createError('Invalid or expired token', 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  return await updatePasswordByEmail(email, hashedPassword);
};

export const loginWithGoogleService = async (profile) => {
  const { id: googleId, emails, displayName } = profile;
  const email = emails[0].value;

  let user = await findUserByGoogleOrEmail(googleId, email);

  if (!user) {
    user = await createGoogleUser({
      email,
      username: displayName,
      googleId,
    });
  } else if (!user.google_id) {
    user = await attachGoogleIdToUser(user.id, googleId);
  }

  if (!user.is_verified) {
    user = await verifyUserById(user.id);
  }

  return user;
};

export const signupService = async (email, password, username) => {
  if (!email || !password || !username) {
    throw new Error('Email, password and username are required');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    if (!existingUser.password) {
      throw new Error(
        'Account already exists with Google. Please set a password instead.'
      );
    }

    if (!existingUser.is_verified) {
      const newToken = crypto.randomBytes(32).toString('hex');
      await setVerificationToken(email, newToken);
      await sendVerificationEmail(email, newToken);

      throw new Error(
        'Account already exists but email is not verified. Verification email resent.'
      );
    }

    throw new Error('Email already registered');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const verificationToken = crypto.randomBytes(32).toString('hex');

  const user = await createUser({
    email,
    password: hashedPassword,
    username,
    verificationToken,
  });

  await sendVerificationEmail(email, verificationToken);

  return {
    user: { email: user.email, username: user.username, role: user.role },
  };
};

export const sendVerifyEmailService = async (email) => {
  if (!email) {
    throw new Error('Invalid email');
  }
  const verificationToken = crypto.randomBytes(32).toString('hex');
  await setVerificationToken(email, verificationToken);
  await sendVerificationEmail(email, verificationToken);
};

export const verifyEmailService = async (token) => {
  const user = await verifyUserByToken(token);
  if (!user) throw new Error('Invalid or expired token');
};

export const sendPasswordResetEmailService = async (email) => {
  const user = await findUserByEmail(email);
  if (!user) throw createError('User not found', 404);

  const resetToken = crypto.randomBytes(32).toString('hex');
  await setVerificationToken(email, resetToken);
  await sendPasswordResetEmail(email, resetToken);
};

export const loginService = async (email, password) => {
  const user = await findUserByEmail(email);
  if (!user) throw createError('User not found', 404);
  if (!user.is_verified) throw createError('Email not verified', 403);
  if (!user.password)
    throw createError(
      'User registered via Google OAuth, Set Password to Login using email/password',
      400
    );

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw createError('Incorrect password', 401);

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: '1d',
    }
  );

  return {
    user: { email: user.email, username: user.username, role: user.role },
    token,
  };
};

export const getCurrentUserService = async (userId) => {
  const user = await findUserById(userId);
  return {
    user: { email: user.email, username: user.username, role: user.role },
  };
};
