import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { appRoutes } from '#routes';
import { errorMiddleware } from '#middlewares';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', appRoutes);
app.use(errorMiddleware);

export default app;
