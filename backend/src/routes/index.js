import express from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import userRoutes from '../modules/users/user.routes.js';
import productRoutes from '../modules/products/product.routes.js';
import orderRoutes from '../modules/orders/order.routes.js';
import customizationRoutes from '../modules/customizations/customization.routes.js';
import calculatorRoutes from '../modules/calculator/calculator.routes.js';
import courseRoutes from '../modules/courses/course.routes.js';
import uploadRoutes from '../modules/uploads/upload.routes.js';
import adminRoutes from '../modules/admin/admin.routes.js';
import notificationRoutes from '../modules/notifications/notification.routes.js';
import enrollmentRoutes from '../modules/enrollments/enrollment.routes.js';
import paymentRoutes from '../modules/payments/payment.routes.js';
import categoryRoutes from '../modules/categories/category.routes.js';
import cartRoutes from '../modules/cart/cart.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/customizations', customizationRoutes);
router.use('/calculator', calculatorRoutes);
router.use('/courses', courseRoutes);
router.use('/uploads', uploadRoutes);
router.use('/media', uploadRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/payments', paymentRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);

export default router;


