import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types/auth/user.interface';
import { AuthRequest, AuthenticatedUser } from '../types/shared/request.interface';

export const protect = (...roles: UserRole[]): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 1. Token validation
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Access token is required',
        });
        return;
      }

      // 2. Verify token and extract user data
      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET as string
      ) as AuthenticatedUser;

      // 3. Role validation (if roles are specified)
      if (roles.length > 0 && !roles.includes(decoded.role)) {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to perform this action',
        });
        return;
      }

      // 4. Attach user data to request
      (req as AuthRequest).user = decoded;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          success: false,
          message: 'Token expired',
          isExpired: true,
        });
        return;
      }

      res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
  };
};
