import express from 'express';
import { getAllEnrollments } from './enrollment.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { ROLES } from '../../utils/constants.js';

const router = express.Router();

router.use(protect);

router.get('/', authorize(ROLES.ADMIN, ROLES.STAFF), getAllEnrollments);

export default router;
