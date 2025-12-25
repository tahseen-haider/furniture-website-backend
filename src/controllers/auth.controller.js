import {
  signupService,
  loginService,
  verifyEmailService,
  sendVerifyEmailService,
  getCurrentUserService,
  loginWithGoogleService,
  sendPasswordResetEmailService,
  resetPasswordService,
} from '#services';

import jwt from 'jsonwebtoken';

export const googleAuthCallback = async (req, res, next) => {
  try {
    const profile = req.user;
    const user = await loginWithGoogleService(profile);

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d',
      }
    );
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

export const requestPasswordSet = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    await sendPasswordResetEmailService(email);

    res.json({
      message: 'Password set email sent successfully. Check your email',
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, token, password } = req.body;
    if (!email || !token || !password) {
      return res
        .status(400)
        .json({ message: 'Email, token and password are required' });
    }

    await resetPasswordService(email, token, password);

    res.json({ message: 'Password has been reset successfully' });
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
  const user = await getCurrentUserService(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

export const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
};
