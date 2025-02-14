import { Request } from 'express';
import { UserRole } from '../auth/user.interface';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user: AuthenticatedUser;
}
