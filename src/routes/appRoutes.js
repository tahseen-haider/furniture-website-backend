import { Router } from 'express';

const appRoutes = Router();

appRoutes.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is running!' });
});

export { appRoutes };
