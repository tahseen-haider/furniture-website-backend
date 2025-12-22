import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const generateEmail = (url) => `
  <div style="font-family: Arial; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
    <h2 style="color: #333;">Verify Your Email</h2>
    <p style="color: #555;">Click the button below to verify your email:</p>
    <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
    <p style="color: #888; font-size: 12px; margin-top: 10px;">If you didn't request this, ignore this email.</p>
  </div>
`;

export const sendEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: `Auth System <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};

export const sendVerificationEmail = async (email, token) => {
  const url = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/verify-email?token=${token}`;
  const html = generateEmail(url);
  await sendEmail(email, 'Verify your email', html);
};

export const sendPasswordResetEmail = async (email, token) => {
  const url = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  const html = `
    <div style="font-family: Arial; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
      <h2 style="color: #333;">Reset Your Password</h2>
      <p style="color: #555;">Click the button below to reset your password:</p>
      <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #FF5722; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p style="color: #888; font-size: 12px; margin-top: 10px;">If you didn't request this, ignore this email.</p>
    </div>
  `;
  await sendEmail(email, 'Reset your password', html);
};

export const sendOrderTrackingEmail = async ({ email, trackingId }) => {
  const trackUrl = `${
    process.env.CLIENT_URL || 'http://localhost:5173'
  }/track-order`;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
      <h2 style="color: #333;">Your Order Has Been Placed 🎉</h2>

      <p style="color: #555;">
        Thank you for your order! Your order has been successfully placed and is being processed.
      </p>

      <div style="background: #ffffff; padding: 15px; border-radius: 6px; margin: 15px 0;">
        <p style="margin: 5px 0 0; color: #333;">
          <strong>Tracking ID:</strong> ${trackingId}
        </p>
      </div>

      <a
        href="${trackUrl}"
        style="
          display: inline-block;
          padding: 12px 24px;
          background-color: #4CAF50;
          color: #ffffff;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        "
      >
        Track Your Order
      </a>

      <p style="color: #777; font-size: 13px; margin-top: 20px;">
        You can use this tracking ID anytime on our website to check your order status.
      </p>

      <p style="color: #999; font-size: 12px;">
        If you did not place this order, please contact our support immediately.
      </p>
    </div>
  `;

  await sendEmail(email, 'Your Order Tracking Details', html);
};
