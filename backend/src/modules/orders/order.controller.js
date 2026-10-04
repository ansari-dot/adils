import { OrderService } from './order.service.js';
import { createOrderSchema, updateOrderStatusSchema } from './order.validation.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const createOrder = asyncHandler(async (req, res) => {
  const { error, value } = createOrderSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const order = await OrderService.createOrder(req.user._id, value);
  res.status(201).json(new ApiResponse(201, order, 'Order created successfully'));
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await OrderService.getUserOrders(req.user._id, req.query);
  res.status(200).json(new ApiResponse(200, orders, 'User orders retrieved successfully'));
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await OrderService.getOrderById(
    req.params.id,
    req.user._id,
    req.user.role
  );
  res.status(200).json(new ApiResponse(200, order, 'Order details retrieved successfully'));
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const result = await OrderService.getAllOrders(req.query);
  res.status(200).json({
    success: true,
    orders: result.items || result.data || (Array.isArray(result) ? result : []),
    pagination: {
      total: result.totalItems || 0,
      page: result.currentPage || 1,
      limit: 10,
      totalPages: result.totalPages || 1,
    },
    message: 'All orders retrieved successfully',
  });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { error, value } = updateOrderStatusSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const order = await OrderService.updateOrderStatus(req.params.id, value);
  res.status(200).json({
    success: true,
    order,
    message: 'Order status updated successfully',
  });
});
