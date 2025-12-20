import {
  signupService,
  loginService,
  verifyEmailService,
  sendVerifyEmailService,
  getCurrentUserService,
  loginWithGoogleService,
} from '#services';

import jwt from 'jsonwebtoken';

export const googleAuthCallback = async (req, res, next) => {
  try {
    const profile = req.user;
    const user = await loginWithGoogleService(profile);

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage('oauth-success', '${process.env.CLIENT_URL || 'http://localhost:5173'}');
              window.close();
            } else {
              window.location.href = '${process.env.CLIENT_URL || 'http://localhost:5173'}';
            }
          </script>
        </body>
      </html>
    `);
  } catch (err) {
    next(err);
  }
};

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
    await verifyEmailService(req.query.token);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login`);
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
