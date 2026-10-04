import express from 'express';
import {
  createRequest,
  getMyRequests,
  getRequestById,
  getAllRequests,
  updateRequestStatus,
} from './customization.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { ROLES } from '../../utils/constants.js';

const router = express.Router();

router.use(protect);

router.post('/', createRequest);
router.post('/request', createRequest);
router.get('/my-requests', getMyRequests);

// Admin/Staff static routes must be defined BEFORE /:id
router.get('/admin/all', authorize(ROLES.ADMIN, ROLES.STAFF), getAllRequests);
router.get('/all-requests', authorize(ROLES.ADMIN, ROLES.STAFF), getAllRequests);

// Dynamic parametric routes
router.get('/request/:id', getRequestById);
router.get('/:id', getRequestById);
router.patch('/admin/:id/status', authorize(ROLES.ADMIN, ROLES.STAFF), updateRequestStatus);
router.put('/request/:id/status', authorize(ROLES.ADMIN, ROLES.STAFF), updateRequestStatus);

export default router;

