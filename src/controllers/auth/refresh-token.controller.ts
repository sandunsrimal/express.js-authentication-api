import { Request, Response, RequestHandler } from 'express';
import User from '../../models/User';
import RefreshToken from '../../models/RefreshToken';
import jwt from 'jsonwebtoken';

export const refreshToken: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    // Verify token exists in database
    const savedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!savedToken || savedToken.expiresAt < new Date()) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as {
      id: string;
    };
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Generate new tokens
    const accessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    // Save new refresh token
    await RefreshToken.create({
      token: newRefreshToken,
      user: user._id,
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
    });

    // Delete old refresh token
    await RefreshToken.deleteOne({ token: refreshToken });

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error refreshing token',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
