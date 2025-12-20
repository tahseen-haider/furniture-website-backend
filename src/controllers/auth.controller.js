import {
  signupService,
  loginService,
  verifyEmailService,
  sendVerifyEmailService,
  getCurrentUserService,
} from '#services';

export const signup = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;
    const user = await signupService(email, password, username);
    res.status(201).json({ message: 'User created. Verify your email.', user });
  } catch (err) {
    next(err);
  }
};

export const sendVerifyEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    await sendVerifyEmailService(email);

    res.json({ message: 'Verification email sent successfully' });
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

export const getCurrentUser = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const { user } = await getCurrentUserService(token);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
};
