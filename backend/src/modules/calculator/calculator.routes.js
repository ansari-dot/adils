import express from 'express';
import {
  getConfig,
  updateConfig,
  getStats,
  calculateCost,
} from './calculator.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { ROLES } from '../../utils/constants.js';

const router = express.Router();

router.use(protect);

router.get('/config', getConfig);
router.put('/config', authorize(ROLES.ADMIN, ROLES.STAFF), updateConfig);
router.get('/stats', authorize(ROLES.ADMIN, ROLES.STAFF), getStats);
router.post('/calculate', calculateCost);

export default router;
