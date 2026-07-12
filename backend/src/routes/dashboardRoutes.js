import express from 'express';
import { getDashboardKPIs } from '../controllers/dashboardController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

// Dashboard data is heavily used by Fleet Manager and Financial Analyst, 
// but generally visible to authorized users depending on frontend implementation.
router.get('/kpis', getDashboardKPIs);

export default router;
