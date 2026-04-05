// cat > backend/src/routes/authRoutes.js << 'EOF'
import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authLimiter, otpLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.post('/send-signup-otp', otpLimiter, authController.sendSignupOTP);
router.post('/verify-signup-otp', authController.verifySignupOTP);
router.post('/login', authLimiter, authController.login);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);
router.put('/profile', authenticate, authController.updateProfile);
router.post('/logout', authenticate, authController.logout);
router.post('/send-password-reset-otp', otpLimiter, authController.sendPasswordResetOTP);
router.post('/reset-password', authController.resetPassword);

export default router;
// EOF