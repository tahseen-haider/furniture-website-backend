import { verifyAccessToken } from '#utils';

export const requireAuth = (req, res, next) => {
  try {
    const token = req.cookies.access_token;
    if (!token) throw new Error('Unauthorized');

    const decoded = verifyAccessToken(token);
    req.user = decoded;

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }
};

export const optionalAuth = (req, res, next) => {
  try {
    const token = req.cookies.access_token;
    if (!token) return next();

    const decoded = verifyAccessToken(token);
    req.user = decoded;
  } catch {
    req.user = null;
  }
  next();
};

export const adminAuth = (req, res, next) => {
  const role = req.user?.role;
  if (role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized: Admins only',
    });
  }
  next();
};
