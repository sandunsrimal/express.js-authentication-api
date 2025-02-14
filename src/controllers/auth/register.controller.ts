import { Request, Response, RequestHandler } from 'express';
import User from '../../models/User';
import mongoose from 'mongoose';
import RefreshToken from '../../models/RefreshToken';
import { RegistrationType } from '../../types/auth/user.interface';
import crypto from 'crypto';
import VerificationToken from '../../models/VerificationToken';
import { sendVerificationEmail } from '../../utils/email';

// Password validation function
export const isPasswordValid = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }

  return { isValid: true, message: 'Password is valid' };
};

export const register: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
      return;
    }

    // Validate password
    const passwordValidation = isPasswordValid(password);
    if (!passwordValidation.isValid) {
      res.status(400).json({
        success: false,
        message: passwordValidation.message,
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
      return;
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      name,
      profilePicture: req.body.profilePicture,
      registrationType: RegistrationType.EMAIL,
      isEmailVerified: false,
      lastLogin: new Date(),
    });

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    await VerificationToken.create({
      userId: user._id,
      token: verificationToken,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    // Send verification email
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await sendVerificationEmail(user.email, user.name, verificationLink);

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token
    await RefreshToken.create({
      token: refreshToken,
      user: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json({
      success: true,
      data: {
        userId: user.userId,
        accessToken,
        refreshToken,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
