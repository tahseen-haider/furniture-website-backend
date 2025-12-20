import express from 'express';
import {
  signup,
  login,
  logout,
  verifyEmail,
  sendVerifyEmail,
  getCurrentUser,
} from '#controllers';

export const authRoutes = express.Router();

authRoutes.post('/signup', signup);
authRoutes.get('/verify-email', verifyEmail);
authRoutes.post('/send-verify-email', sendVerifyEmail);
authRoutes.post('/login', login);
authRoutes.post('/logout', logout);
authRoutes.get('/me', getCurrentUser);
