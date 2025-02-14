import mongoose from 'mongoose';

interface IVerificationToken {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
}

const verificationTokenSchema = new mongoose.Schema<IVerificationToken>({
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
    collection: 'email_verification_tokens',
    timestamps: true,
    autoIndex: true,
}

);


export default mongoose.model<IVerificationToken>('VerificationToken', verificationTokenSchema); 