import crypto from 'crypto';
import OTP from '../models/OTP.js';
import emailService from './emailService.js';
import config from '../config/environment.js';

class OTPService {
  generateOTP(length = config.otp.length) {
    return crypto.randomInt(0, Math.pow(10, length) - 1)
      .toString()
      .padStart(length, '0');
  }

  async sendEmailOTP(email, type) {
    await OTP.deleteMany({ email, type });

    const code = this.generateOTP();
    const expiresAt = new Date(Date.now() + config.otp.expiry * 60 * 1000);

    const otp = new OTP({ email, code, type, expiresAt });
    await otp.save();

    await emailService.sendOTP(email, code, type);
    return { success: true, message: 'OTP sent' };
  }

  async verifyOTP(email, code, type) {
    const otp = await OTP.findOne({
      email,
      code,
      type,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otp) throw new Error('Invalid or expired OTP');

    otp.isUsed = true;
    await otp.save();

    return { success: true, message: 'OTP verified' };
  }
}

export default new OTPService();