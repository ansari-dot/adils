import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from './product.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { ROLES } from '../../utils/constants.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin / Staff protected routes
router.post('/', protect, authorize(ROLES.ADMIN, ROLES.STAFF), createProduct);
router.put('/:id', protect, authorize(ROLES.ADMIN, ROLES.STAFF), updateProduct);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteProduct);

export default router;
