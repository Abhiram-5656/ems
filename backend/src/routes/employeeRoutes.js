// cat > backend/src/routes/employeeRoutes.js << 'EOF'
import express from 'express';
import * as employeeController from '../controllers/employeeController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all employees (paginated, searchable)
router.get('/', authenticate, authorize('ADMIN', 'HR', 'MANAGER'), employeeController.getAllEmployees);

// Get employee statistics (must come before /:id)
router.get('/stats/summary', authenticate, authorize('ADMIN', 'HR'), employeeController.getEmployeeStats);

// Create new employee
router.post('/', authenticate, authorize('ADMIN', 'HR'), employeeController.createEmployee);

// Get single employee (/:id routes last)
router.get('/:id', authenticate, employeeController.getEmployeeById);

// Update employee
router.put('/:id', authenticate, authorize('ADMIN', 'HR'), employeeController.updateEmployee);

// Delete employee (soft delete)
router.delete('/:id', authenticate, authorize('ADMIN', 'HR'), employeeController.deleteEmployee);

export default router;
// EOF