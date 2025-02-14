import { Request, Response } from 'express';
import User from '../../models/User';
import RefreshToken from '../../models/RefreshToken';
import { UserRole, RegistrationType } from '../../types/auth/user.interface';
import axios from 'axios';

// Get Facebook OAuth URL
export const getFacebookAuthURL = async (req: Request, res: Response): Promise<void> => {
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI;
  const clientId = process.env.FACEBOOK_CLIENT_ID;

  const url =
    `https://www.facebook.com/v18.0/dialog/oauth?` +
    `client_id=${clientId}` +
    `&redirect_uri=${redirectUri}` +
    `&scope=email,public_profile`;

  res.redirect(url);
};

// Facebook OAuth callback
export const facebookCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      res.status(400).json({ success: false, message: 'Authorization code missing' });
      return;
    }

    // Exchange code for access token
    const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        client_id: process.env.FACEBOOK_CLIENT_ID,
        client_secret: process.env.FACEBOOK_CLIENT_SECRET,
        redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
        code,
      },
    });

    const { access_token } = tokenResponse.data;

    // Get user profile data
    const profileResponse = await axios.get('https://graph.facebook.com/me', {
      params: {
        fields: 'id,name,email,picture.type(large)',
        access_token,
      },
    });

    const { id: facebookId, email, name, picture } = profileResponse.data;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user with Facebook ID as userId
      user = await User.create({
        userId: facebookId,
        email,
        name,
        profilePicture: picture?.data?.url || undefined,
        role: UserRole.USER,
        registrationType: RegistrationType.FACEBOOK,
        isEmailVerified: true,
        lastLogin: new Date(),
      });
    } else {
      // Update last login time for existing user
      user.lastLogin = new Date();
      if (!user.userId) {
        user.userId = facebookId;
      }
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
    console.error('Error authenticating with Facebook:', error);
    const errorUrl = `${process.env.FRONTEND_URL}/auth/error`;
    res.redirect(errorUrl);
  }
};
