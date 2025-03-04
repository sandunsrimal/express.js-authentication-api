import { Request, Response, RequestHandler } from 'express';
import User from '../../models/User';
import { AuthRequest } from '../../types/shared/request.interface';

export const getUserDetails: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById((req as AuthRequest).user.id).select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified,
        registrationType: user.registrationType,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user details',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
