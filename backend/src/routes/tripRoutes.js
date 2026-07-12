import express from 'express';
import { getTrips, createTrip, dispatchTrip, completeTrip, cancelTrip } from '../controllers/tripController.js';
import { requireAuth, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// All trip routes require authentication
router.use(requireAuth);

router.get('/', getTrips);

// Creating/Dispatching trips is typically done by Drivers or Fleet Managers
router.post('/', authorizeRoles('Driver', 'Fleet Manager'), createTrip);
router.put('/:id/dispatch', authorizeRoles('Driver', 'Fleet Manager'), dispatchTrip);
router.put('/:id/complete', authorizeRoles('Driver', 'Fleet Manager'), completeTrip);
router.put('/:id/cancel', authorizeRoles('Driver', 'Fleet Manager'), cancelTrip);

export default router;
