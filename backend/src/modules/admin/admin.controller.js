import { AdminService } from './admin.service.js';
import { AuditLog } from './auditLog.model.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await AdminService.getDashboardStats();
  res.status(200).json(new ApiResponse(200, stats, 'Dashboard stats retrieved successfully'));
});

export const getRevenueStats = asyncHandler(async (req, res) => {
  const revenue = await AdminService.getRevenueStats();
  res.status(200).json(new ApiResponse(200, revenue, 'Revenue stats retrieved successfully'));
});

export const getPopularProducts = asyncHandler(async (req, res) => {
  const products = await AdminService.getPopularProducts();
  res.status(200).json(new ApiResponse(200, products, 'Popular products retrieved successfully'));
});

export const getOrdersBreakdown = asyncHandler(async (req, res) => {
  const statusBreakdown = await AdminService.getOrdersBreakdown();
  res.status(200).json(new ApiResponse(200, { statusBreakdown }, 'Orders status breakdown retrieved successfully'));
});

export const getAuditLogs = asyncHandler(async (req, res) => {
  const { resourceType } = req.query;
  const filter = {};
  if (resourceType && resourceType !== 'all') {
    filter.resourceType = resourceType;
  }

  const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(50);

  const formattedLogs = logs.map((doc) => ({
    id: doc._id.toString(),
    adminName: doc.adminName,
    adminEmail: doc.adminEmail,
    action: doc.action,
    resourceType: doc.resourceType,
    resourceId: doc.resourceId,
    metadata: doc.metadata,
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
  }));

  res.status(200).json(new ApiResponse(200, formattedLogs, 'Audit logs retrieved successfully'));
});
