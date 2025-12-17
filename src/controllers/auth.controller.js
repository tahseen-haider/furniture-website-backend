import { signupService, loginService, verifyEmailService } from '#services';

export const signup = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;
    const user = await signupService(email, password, username);
    res.status(201).json({ message: 'User created. Verify your email.', user });
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const user = await verifyEmailService(req.query.token);
    if (!user) return res.status(400).json({ message: 'Invalid token' });
    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await loginService(email, password);
    res.cookie('token', token, { httpOnly: true });
    res.json({ message: 'Login successful', user });
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
};
