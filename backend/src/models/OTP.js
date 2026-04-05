import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    email: String,
    phone: String,
    code: { type: String, required: true },
    type: { type: String, enum: ['SIGNUP', 'LOGIN', 'PASSWORD_RESET'], required: true },
    isUsed: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  },
  { timestamps: true }
);

export default mongoose.model('OTP', otpSchema);