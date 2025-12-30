import express from 'express';
import {
  signup,
  login,
  logout,
  verifyEmail,
  sendVerifyEmail,
  getCurrentUser,
  googleAuthCallback,
  requestPasswordSet,
  resetPassword,
  refreshToken,
} from '#controllers';

import { passport, requireAuth } from '#middlewares';

export const authRoutes = express.Router();

authRoutes.post('/signup', signup);
authRoutes.get('/verify-email', verifyEmail);
authRoutes.post('/send-verify-email', sendVerifyEmail);
authRoutes.post('/request-password-set', requestPasswordSet);
authRoutes.post('/reset-password', resetPassword);
authRoutes.post('/login', login);
authRoutes.post('/logout', logout);
authRoutes.get('/me', requireAuth, getCurrentUser);

authRoutes.post('/refresh', refreshToken);

authRoutes.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

authRoutes.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:3000/login',
    session: false,
  }),
  googleAuthCallback
);
