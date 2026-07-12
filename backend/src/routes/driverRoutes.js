import express from 'express';
import { getDrivers, createDriver, updateDriver } from '../controllers/driverController.js';
import { requireAuth, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// All driver routes require authentication
router.use(requireAuth);

router.get('/', getDrivers);

// Fleet Managers can create drivers. Fleet Managers and Safety Officers can update them.
router.post('/', authorizeRoles('Fleet Manager'), createDriver);
router.put('/:id', authorizeRoles('Fleet Manager', 'Safety Officer'), updateDriver);

export default router;
