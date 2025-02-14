import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import User from '../../models/User';
import RefreshToken from '../../models/RefreshToken';
import { UserRole, RegistrationType } from '../../types/auth/user.interface';

const client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

// New function to generate auth URL
export const getGoogleAuthURL = async (req: Request, res: Response): Promise<void> => {
  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  });

  res.redirect(url);
};

// New callback handler
export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      res.status(400).json({ success: false, message: 'Authorization code missing' });
      return;
    }

    // Exchange code for tokens
    const { tokens } = await client.getToken(code);
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      res.status(400).json({ success: false, message: 'Invalid token' });
      return;
    }

    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user with Google ID as userId
      user = await User.create({
        userId: googleId,
        email,
        name,
        profilePicture: picture,
        role: UserRole.USER,
        registrationType: RegistrationType.GOOGLE,
        isEmailVerified: true,
        lastLogin: new Date(),
      });
    } else if (!user.userId) {
      user.userId = googleId;
      user.lastLogin = new Date();
      await user.save();
    }

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token
    await RefreshToken.create({
      token: refreshToken,
      user: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Redirect to frontend with tokens
    const redirectUrl =
      `${process.env.FRONTEND_URL}/auth/callback?` +
      `accessToken=${accessToken}&refreshToken=${refreshToken}&userId=${user.userId}`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Error authenticating with Google:', error);
    const errorUrl = `${process.env.FRONTEND_URL}/auth/error`;
    res.redirect(errorUrl);
  }
};
