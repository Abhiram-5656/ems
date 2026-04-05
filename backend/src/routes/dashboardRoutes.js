// cat > backend/src/routes/dashboardRoutes.js << 'EOF'
import express from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin dashboard
router.get('/admin', authenticate, authorize('ADMIN'), dashboardController.getAdminDashboard);

// HR dashboard
router.get('/hr', authenticate, authorize('HR'), dashboardController.getHRDashboard);

// Manager dashboard
router.get('/manager', authenticate, authorize('MANAGER'), dashboardController.getManagerDashboard);

// Employee dashboard
router.get('/employee', authenticate, dashboardController.getEmployeeDashboard);

export default router;
// EOF