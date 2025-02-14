import { Request, Response } from 'express';
import User from '../../models/User';
import RefreshToken from '../../models/RefreshToken';
import { UserRole, RegistrationType } from '../../types/auth/user.interface';
import axios from 'axios';

// Get Microsoft OAuth URL
export const getMicrosoftAuthURL = async (req: Request, res: Response): Promise<void> => {
  const redirectUri = process.env.MICROSOFT_REDIRECT_URI;
  const clientId = process.env.MICROSOFT_CLIENT_ID;

  const url =
    `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
    `client_id=${clientId}` +
    `&response_type=code` +
    `&redirect_uri=${redirectUri}` +
    `&response_mode=query` +
    `&scope=user.read%20openid%20profile%20email`;

  res.redirect(url);
};

// Microsoft OAuth callback
export const microsoftCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      res.status(400).json({ success: false, message: 'Authorization code missing' });
      return;
    }

    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID!,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
        code,
        redirect_uri: process.env.MICROSOFT_REDIRECT_URI!,
        grant_type: 'authorization_code',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token } = tokenResponse.data;

    // Get user profile data
    const profileResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const {
      id: microsoftId,
      displayName: name,
      mail: email,
      userPrincipalName,
    } = profileResponse.data;

    // Use userPrincipalName as fallback if mail is not available
    const userEmail = email || userPrincipalName;

    if (!userEmail) {
      throw new Error('Email not provided by Microsoft');
    }

    // Get user photo
    let profilePicture;
    try {
      const photoResponse = await axios.get('https://graph.microsoft.com/v1.0/me/photo/$value', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        responseType: 'arraybuffer',
      });

      const photoBase64 = Buffer.from(photoResponse.data, 'binary').toString('base64');
      profilePicture = `data:image/jpeg;base64,${photoBase64}`;
    } catch (error) {
      // If photo fetch fails, use default avatar
      console.log('Failed to fetch Microsoft profile photo, using default');
    }

    // Check if user exists
    let user = await User.findOne({ email: userEmail });

    if (!user) {
      // Create new user with Microsoft ID as userId
      user = await User.create({
        userId: microsoftId,
        email: userEmail,
        name,
        profilePicture: profilePicture,
        role: UserRole.USER,
        registrationType: RegistrationType.MICROSOFT,
        isEmailVerified: true,
        lastLogin: new Date(),
      });
    } else {
      // Update last login time for existing user
      user.lastLogin = new Date();
      if (!user.userId) {
        user.userId = microsoftId;
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
    console.error('Error authenticating with Microsoft:', error);
    const errorUrl = `${process.env.FRONTEND_URL}/auth/error`;
    res.redirect(errorUrl);
  }
};
