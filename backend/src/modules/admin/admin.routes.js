import express from 'express';
import {
  getDashboardStats,
  getRevenueStats,
  getPopularProducts,
  getOrdersBreakdown,
  getAuditLogs,
} from './admin.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { ROLES } from '../../utils/constants.js';

const router = express.Router();

router.use(protect, authorize(ROLES.ADMIN, ROLES.STAFF));

router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/revenue', getRevenueStats);
router.get('/dashboard/popular-products', getPopularProducts);
router.get('/dashboard/orders', getOrdersBreakdown);
router.get('/audit-logs', getAuditLogs);

export default router;


