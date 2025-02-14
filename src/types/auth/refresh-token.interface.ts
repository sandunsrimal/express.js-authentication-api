import mongoose from 'mongoose';

export interface IRefreshToken {
  token: string;
  user: mongoose.Types.ObjectId;
  expiresAt: Date;
}
