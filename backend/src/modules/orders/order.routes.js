import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from './order.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { ROLES } from '../../utils/constants.js';

const router = express.Router();

router.use(protect);

router.post('/', createOrder);
router.post('/checkout', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/my-history', getMyOrders);

// Admin/Staff static routes must be defined BEFORE /:id
router.get('/all', authorize(ROLES.ADMIN, ROLES.STAFF), getAllOrders);
router.get('/admin/all', authorize(ROLES.ADMIN, ROLES.STAFF), getAllOrders);

// Dynamic parametric routes
router.get('/:id', getOrderById);
router.patch('/admin/:id/status', authorize(ROLES.ADMIN, ROLES.STAFF), updateOrderStatus);
router.put('/:id/status', authorize(ROLES.ADMIN, ROLES.STAFF), updateOrderStatus);

export default router;

