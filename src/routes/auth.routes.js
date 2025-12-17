import express from 'express';
import { signup, login, logout, verifyEmail } from '#controllers';

export const authRoutes = express.Router();

authRoutes.post('/signup', signup);
authRoutes.get('/verify-email', verifyEmail);
authRoutes.post('/login', login);
authRoutes.post('/logout', logout);
