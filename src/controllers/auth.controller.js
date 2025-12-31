import { verifyRefreshToken, signAccessToken } from '#utils';
import { clearRefreshToken, findUserByRefreshToken } from '#models';
import {
  signupService,
  loginService,
  verifyEmailService,
  sendVerifyEmailService,
  getCurrentUserService,
  loginWithGoogleService,
  sendPasswordResetEmailService,
  resetPasswordService,
  generateAuthTokens,
} from '#services';

export const googleAuthCallback = async (req, res, next) => {
  try {
    const profile = req.user;
    const user = await loginWithGoogleService(profile);
    const { accessToken, refreshToken } = await generateAuthTokens(user);

    res
      .cookie('access_token', accessToken, { httpOnly: true })
      .cookie('refresh_token', refreshToken, { httpOnly: true });

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
    res.status(201).json({
      success: true,
      message: 'User created. Verify your email.',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

export const sendVerifyEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: 'Email is required' });

    await sendVerifyEmailService(email);
    res.json({
      success: true,
      message: 'Verification email sent successfully',
    });
  } catch (err) {
    next(err);
  }
};

export const requestPasswordSet = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: 'Email is required' });

    await sendPasswordResetEmailService(email);
    res.json({
      success: true,
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
      return res.status(400).json({
        success: false,
        message: 'Email, token and password are required',
      });
    }

    await resetPasswordService(email, token, password);
    res.json({
      success: true,
      message: 'Password has been reset successfully',
    });
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

export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refresh_token;
    if (!token) throw new Error('Refresh token missing');

    verifyRefreshToken(token);
    const user = await findUserByRefreshToken(token);
    if (!user) throw new Error('Invalid refresh token');

    const accessToken = signAccessToken({
      id: user.id,
      role: user.role,
    });

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Token refreshed',
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { user, accessToken, refreshToken } = await loginService(
      email,
      password
    );

    res
      .cookie('access_token', accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      })
      .cookie('refresh_token', refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            email: user.email,
            username: user.username,
            role: user.role,
          },
        },
      });
  } catch (err) {
    next(err);
  }
};

export const getCurrentUser = async (req, res) => {
  const data = await getCurrentUserService(req.user.id);
  if (!data.user)
    return res.status(404).json({ success: false, message: 'User not found' });

  res.json({
    success: true,
    message: 'User fetched successfully',
    data,
  });
};

export const logout = async (req, res) => {
  if (req.user?.id) {
    await clearRefreshToken(req.user.id);
  }

  res.clearCookie('access_token').clearCookie('refresh_token').json({
    success: true,
    message: 'Logged out successfully',
  });
};
