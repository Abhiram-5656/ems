// cat > backend/src/routes/leaveRoutes.js << 'EOF'
import express from 'express';
import * as leaveController from '../controllers/leaveController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Employee applies for leave
router.post('/apply', authenticate, leaveController.applyLeave);

// Get employee's leave applications
router.get('/my-applications', authenticate, leaveController.getLeaveApplications);

// Get pending leaves (for approval)
router.get('/pending', authenticate, authorize('ADMIN', 'HR', 'MANAGER'), leaveController.getPendingLeaves);

// Get all leaves (for admin dashboard)
router.get('/admin/all', authenticate, authorize('ADMIN', 'HR'), leaveController.getAllLeaves);

// Approve leave
router.put('/:id/approve', authenticate, authorize('ADMIN', 'HR', 'MANAGER'), leaveController.approveLeave);

// Reject leave
router.put('/:id/reject', authenticate, authorize('ADMIN', 'HR', 'MANAGER'), leaveController.rejectLeave);

// Cancel leave
router.put('/:id/cancel', authenticate, leaveController.cancelLeave);

export default router;
// EOF