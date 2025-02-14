import mongoose from 'mongoose';
import { IRefreshToken } from '../types/auth/refresh-token.interface';

const refreshTokenSchema = new mongoose.Schema<IRefreshToken>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    collection: 'refresh_tokens',
    timestamps: true,
  }
);

export default mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema);
