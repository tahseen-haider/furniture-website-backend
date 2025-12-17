import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const url = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `Auth System <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Verify your email',
    html: `<p>Click <a href="${url}">here</a> to verify your email.</p>`,
  });
};
