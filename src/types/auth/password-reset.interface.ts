import mongoose from 'mongoose';

export interface IPasswordResetToken {
    userId: mongoose.Types.ObjectId;
    token: string;
    expiresAt: Date;
  }