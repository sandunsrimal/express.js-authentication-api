import { Request, Response, RequestHandler } from 'express';
import User from '../../models/User';
import RefreshToken from '../../models/RefreshToken';
import { AuthRequest } from '../../types/shared/request.interface';

export const deleteAccount: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { password } = req.body;
    const userId = (req as AuthRequest).user.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Incorrect password',
      });
      return;
    }

    // Delete all refresh tokens for this user
    await RefreshToken.deleteMany({ user: userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting account',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
