import { Request, Response, RequestHandler } from 'express';
import crypto from 'crypto';
import User from '../../models/User';
import VerificationToken from '../../models/VerificationToken';
import { sendVerificationEmail } from '../../utils/email';
import { AuthRequest } from '../../types/shared/request.interface';
import RefreshToken from '../../models/RefreshToken';

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    const verificationToken = await VerificationToken.findOne({
      token,
      expiresAt: { $gt: new Date() },
    });

    if (!verificationToken) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
      });
      return;
    }

    const user = await User.findById(verificationToken.userId);
    if (!user) {
      res.status(400).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    user.isEmailVerified = true;
    await user.save();
    await verificationToken.deleteOne();

    // Generate new tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token
    await RefreshToken.create({
      token: refreshToken,
      user: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        userId: user.userId,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying email',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const resendVerification: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById((req as AuthRequest).user?.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    if (user.isEmailVerified) {
      res.status(400).json({
        success: false,
        message: 'Email is already verified',
      });
      return;
    }

    // Delete any existing verification tokens
    await VerificationToken.deleteMany({ userId: user._id });

    // Create new verification token
    const token = crypto.randomBytes(32).toString('hex');
    await VerificationToken.create({
      userId: user._id,
      token,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });


    const verificationLink = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;
    await sendVerificationEmail(user.email, user.name, verificationLink);

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending verification email',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}; 