import express from 'express';
import { getFuelLogs, createFuelLog, getExpenses, createExpense } from '../controllers/fuelExpenseController.js';
import { requireAuth, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

// All roles can view logs (Financial Analyst uses this)
router.get('/fuel', getFuelLogs);
router.get('/general', getExpenses);

// Drivers and Fleet Managers can create logs
router.post('/fuel', authorizeRoles('Driver', 'Fleet Manager'), createFuelLog);
router.post('/general', authorizeRoles('Driver', 'Fleet Manager'), createExpense);

export default router;
