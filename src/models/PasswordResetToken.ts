import mongoose from "mongoose";
import { IPasswordResetToken } from "../types/auth/password-reset.interface";

const passwordResetTokenSchema = new mongoose.Schema<IPasswordResetToken>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    expires: 0,
  },
},
{
    collection: 'password_reset_tokens',
    timestamps: true,
    autoIndex: true,
});

export default mongoose.model<IPasswordResetToken>('PasswordResetToken', passwordResetTokenSchema); 