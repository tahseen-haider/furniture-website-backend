import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { appRoutes } from '#routes';
import { errorMiddleware } from '#middlewares';
import { initTables } from '#db';
import cookieParser from 'cookie-parser';

dotenv.config();
const app = express();

await initTables();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(cookieParser());

app.use('/api', appRoutes);
app.use(errorMiddleware);

export default app;
