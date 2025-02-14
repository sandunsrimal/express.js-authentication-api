import { Request, Response, RequestHandler } from 'express';
import RefreshToken from '../../models/RefreshToken';

export const logout: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    // Delete the refresh token from the database
    await RefreshToken.deleteOne({ token: refreshToken });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging out',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
