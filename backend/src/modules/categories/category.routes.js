import express from 'express';
import {
  createCategory,
  getCategories,
  getAllCategoriesAdmin,
  updateCategory,
  deleteCategory,
} from './category.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { ROLES } from '../../utils/constants.js';

const router = express.Router();

router.get('/', getCategories);

// Admin only routes
router.use(protect);
router.use(authorize(ROLES.ADMIN, ROLES.STAFF));

router.get('/admin/all', getAllCategoriesAdmin);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;
