import express from 'express';
import {
  getProfile,
  updateProfile,
  getWishlist,
  toggleWishlist,
  getAllUsers,
  getUserById,
  updateUserStatus,
} from './user.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { ROLES } from '../../utils/constants.js';

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

router.get('/wishlist', getWishlist);
router.post('/wishlist/:productId', toggleWishlist);
router.put('/wishlist/:productId', toggleWishlist);
router.put('/wishlist', toggleWishlist);

// Admin Only Routes
router.get('/all', authorize(ROLES.ADMIN), getAllUsers);
router.get('/admin/users', authorize(ROLES.ADMIN), getAllUsers);
router.get('/:id', authorize(ROLES.ADMIN), getUserById);
router.put('/:id/status', authorize(ROLES.ADMIN), updateUserStatus);

export default router;
