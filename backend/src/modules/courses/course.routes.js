import express from 'express';
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  getMyEnrollments,
  markLessonComplete,
  getCourseCategories,
  getCourseContent,
} from './course.controller.js';
import { protect, optionalAuth } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { ROLES } from '../../utils/constants.js';

const router = express.Router();

router.get('/', optionalAuth, getCourses);
router.get('/categories', getCourseCategories);

// Static user / student routes must come before /:id
router.get('/user/my-courses', protect, getMyEnrollments);
router.get('/my-courses', protect, getMyEnrollments);

// Protected admin routes
router.post('/', protect, authorize(ROLES.ADMIN, ROLES.STAFF), createCourse);
router.put('/:id', protect, authorize(ROLES.ADMIN, ROLES.STAFF), updateCourse);
router.delete('/:id', protect, authorize(ROLES.ADMIN, ROLES.STAFF), deleteCourse);

// Dynamic parametric routes
router.get('/:id', optionalAuth, getCourseById);
router.get('/:id/content', protect, getCourseContent);
router.post('/:id/enroll', protect, enrollInCourse);
router.post('/enroll/:id', protect, enrollInCourse);
router.post('/:id/lessons/complete', protect, markLessonComplete);
router.put('/enroll/:id/progress', protect, markLessonComplete);

export default router;

