import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
};

export const optionalAuth = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch {
    req.user = null;
    next();
  }
};

export const adminAuth = (req, res, next) => {
  try {
    const role = req.user?.role;
    if (role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized: Admins only',
      });
    }
    next();
  } catch {
    req.user = { role: 'user' };
    next();
  }
};
