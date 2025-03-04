import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (
  email: string,
  name: string,
  verificationLink: string
): Promise<void> => {
  const transporter = nodemailer.createTransport({
    // Configure your email service here
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT ?? '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false, //Remove this in production
    },
  });


  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: email,
    subject: 'Verify Your Email Address',
    html: `
      <p>Hello ${name},</p>
      <p>Thank you for registering! Please verify your email address by clicking the link below:</p>
      <p><a href="${verificationLink}">Verify Email Address</a></p>
      <p><strong>This verification link will expire in 5 minutes.</strong></p>
      <p>If you did not create an account, please ignore this email.</p>
      <p>If you need assistance, please contact our support team at ${process.env.SUPPORT_EMAIL}</p>
      <p>Best regards,<br>Support Team</p>
    `,
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  resetLink: string
): Promise<void> => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT ?? '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <p>Hello ${name},</p>
      <p>We received a request to reset your password. Click the link below to set a new password:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p><strong>This reset link will expire in 15 minutes and can only be used once.</strong></p>
      <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
      <p>Best regards,<br>Support Team</p>
    `,
  });
}; 