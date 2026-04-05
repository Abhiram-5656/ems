// cat > backend/src/routes/payrollRoutes.js << 'EOF'
import express from 'express';
import * as payrollController from '../controllers/payrollController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create payroll (must come first)
router.post('/create', authenticate, authorize('ADMIN', 'HR'), payrollController.createPayroll);

// Get all payroll (with filters)
router.get('/', authenticate, authorize('ADMIN', 'HR'), payrollController.getPayroll);

// Get employee's payroll (must come before /:id routes)
router.get('/employee/my-payroll', authenticate, payrollController.getEmployeePayroll);

// Update payroll (/:id routes last)
router.put('/:id', authenticate, authorize('ADMIN', 'HR'), payrollController.updatePayroll);

// Approve payroll
router.put('/:id/approve', authenticate, authorize('ADMIN', 'HR'), payrollController.approvePayroll);

// Mark payroll as paid
router.put('/:id/mark-paid', authenticate, authorize('ADMIN', 'HR'), payrollController.markPayrollAsPaid);

// Delete payroll
router.delete('/:id', authenticate, authorize('ADMIN', 'HR'), payrollController.deletePayroll);

export default router;
// EOF