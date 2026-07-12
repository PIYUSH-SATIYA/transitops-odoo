import express from 'express';
import { getMaintenanceLogs, createMaintenanceLog, closeMaintenanceLog } from '../controllers/maintenanceController.js';
import { requireAuth, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

// All roles can view maintenance logs (especially Financial Analyst)
router.get('/', getMaintenanceLogs);

// Only Fleet Manager can create or close maintenance records
router.post('/', authorizeRoles('Fleet Manager'), createMaintenanceLog);
router.put('/:id/close', authorizeRoles('Fleet Manager'), closeMaintenanceLog);

export default router;
