import { Request, Response, RequestHandler } from 'express';
import User from '../../models/User';
import { AuthRequest } from '../../types/shared/request.interface';

export const updateProfile: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, profilePicture } = req.body;
    const userId = (req as AuthRequest).user.id;

    const updateData: { name?: string; profilePicture?: string } = {};
    if (name) updateData.name = name;
    if (profilePicture) updateData.profilePicture = profilePicture;

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      select: '-password',
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
