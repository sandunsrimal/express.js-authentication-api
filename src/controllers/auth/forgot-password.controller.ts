import { Request, Response } from 'express';
import crypto from 'crypto';
import User from '../../models/User';
import PasswordResetToken from '../../models/PasswordResetToken';
import { sendPasswordResetEmail } from '../../utils/email';
import { isPasswordValid } from './register.controller';

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {

      res.status(200).json({
        success: true,
        message: 'If your email is registered, you will receive password reset instructions.',
      });
      return;
    }

    // Delete any existing reset tokens for this user
    await PasswordResetToken.deleteMany({ userId: user._id });

    // Create new reset token
    const token = crypto.randomBytes(32).toString('hex');
    await PasswordResetToken.create({
      userId: user._id,
      token,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    await sendPasswordResetEmail(user.email, user.name, resetLink);

    res.status(200).json({
      success: true,
      message: 'If your email is registered, you will receive password reset instructions.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing password reset request',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    const resetToken = await PasswordResetToken.findOne({
      token,
      expiresAt: { $gt: new Date() },
    });

    if (!resetToken) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
      return;
    }

    // Validate new password
    const passwordValidation = isPasswordValid(newPassword);
    if (!passwordValidation.isValid) {
      res.status(400).json({
        success: false,
        message: passwordValidation.message,
      });
      return;
    }

    const user = await User.findById(resetToken.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Delete the used reset token
    await resetToken.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}; 