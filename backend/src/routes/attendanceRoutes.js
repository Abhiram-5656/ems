// cat > backend/src/routes/attendanceRoutes.js << 'EOF'
import express from 'express';
import * as attendanceController from '../controllers/attendanceController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Mark attendance
router.post('/mark', authenticate, attendanceController.markAttendance);

// Get attendance report (for HR/Admin/Manager)
router.get('/report', authenticate, authorize('ADMIN', 'HR', 'MANAGER'), attendanceController.getAttendanceReport);

// Get employee's own attendance
router.get('/my-attendance', authenticate, attendanceController.getEmployeeAttendance);

// Approve attendance
router.put('/:id/approve', authenticate, authorize('ADMIN', 'HR', 'MANAGER'), attendanceController.approveAttendance);

// Delete attendance
router.delete('/:id', authenticate, authorize('ADMIN', 'HR'), attendanceController.deleteAttendance);

export default router;
// EOF