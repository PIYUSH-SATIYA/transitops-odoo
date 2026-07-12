import express from 'express';
import { getVehicles, createVehicle, updateVehicle } from '../controllers/vehicleController.js';
import { requireAuth, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// All vehicle routes require authentication
router.use(requireAuth);

router.get('/', getVehicles);

// Only Fleet Managers can create or update vehicles
router.post('/', authorizeRoles('Fleet Manager'), createVehicle);
router.put('/:id', authorizeRoles('Fleet Manager'), updateVehicle);

export default router;
