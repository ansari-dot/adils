import { User } from '../users/user.model.js';
import { Product } from '../products/product.model.js';
import { Order } from '../orders/order.model.js';
import { Customization } from '../customizations/customization.model.js';
import { Course } from '../courses/course.model.js';
import { Enrollment } from '../courses/enrollment.model.js';

export class AdminService {
  static async getDashboardStats() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalProducts,
      lowStockCount,
      totalOrders,
      pendingOrders,
      processingOrders,
      completedOrders,
      cancelledOrders,
      ordersToday,
      ordersThisWeek,
      pendingCustomRequests,
      totalCourses,
      totalEnrollments,
      revenueResult,
      todayRevenueResult,
      weekRevenueResult,
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Product.countDocuments({ $or: [{ isAvailable: false }, { stock: 0 }] }),
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: { $in: ['confirmed', 'preparing', 'processing', 'out_for_delivery'] } }),
      Order.countDocuments({ status: { $in: ['completed', 'delivered'] } }),
      Order.countDocuments({ status: 'cancelled' }),
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),
      Order.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Customization.countDocuments({ status: 'pending' }),
      Course.countDocuments(),
      Enrollment.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, totalRevenue: { $sum: '$grandTotal' } } },
      ]),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: startOfToday } } },
        { $group: { _id: null, totalRevenue: { $sum: '$grandTotal' } } },
      ]),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: startOfWeek } } },
        { $group: { _id: null, totalRevenue: { $sum: '$grandTotal' } } },
      ]),
    ]);

    const totalRevenue = revenueResult.length > 0 ? Number(revenueResult[0].totalRevenue.toFixed(2)) : 0;
    const todayRevenue = todayRevenueResult.length > 0 ? Number(todayRevenueResult[0].totalRevenue.toFixed(2)) : 0;
    const weekRevenue = weekRevenueResult.length > 0 ? Number(weekRevenueResult[0].totalRevenue.toFixed(2)) : 0;

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      pendingOrders,
      processingOrders,
      completedOrders,
      cancelledOrders,
      pendingCustomRequests,
      totalCourses,
      totalEnrollments,
      revenue: totalRevenue,
      totalRevenue,
      todayRevenue,
      weekRevenue,
      monthRevenue: totalRevenue,
      ordersToday,
      ordersThisWeek,
      ordersThisMonth: totalOrders,
      lowStockCount,
    };
  }

  static async getRevenueStats() {
    const revenueByMonth = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$grandTotal' },
          ordersCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
    ]);

    return revenueByMonth;
  }

  static async getPopularProducts() {
    return await Product.find({ isPopular: true }).limit(10);
  }

  static async getOrdersBreakdown() {
    const [pending, processing, completed, cancelled] = await Promise.all([
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: { $in: ['confirmed', 'preparing', 'processing', 'out_for_delivery'] } }),
      Order.countDocuments({ status: { $in: ['completed', 'delivered'] } }),
      Order.countDocuments({ status: 'cancelled' }),
    ]);

    return { pending, processing, completed, cancelled };
  }
}
