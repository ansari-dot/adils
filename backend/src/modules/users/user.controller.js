import { UserService } from './user.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { updateUserSchema } from './user.validation.js';
import { ApiError } from '../../utils/ApiError.js';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await UserService.getUserProfile(req.user._id);
  res.status(200).json(new ApiResponse(200, user, 'Profile fetched successfully'));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { error, value } = updateUserSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const updatedUser = await UserService.updateUserProfile(req.user._id, value);
  res.status(200).json(new ApiResponse(200, updatedUser, 'Profile updated successfully'));
});

export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await UserService.getWishlist(req.user._id);
  res.status(200).json(new ApiResponse(200, wishlist, 'Wishlist fetched successfully'));
});

export const toggleWishlist = asyncHandler(async (req, res) => {
  const productId = req.params.productId || req.body.productId;
  if (!productId) {
    throw new ApiError(400, 'Product ID is required to update wishlist');
  }
  const wishlist = await UserService.toggleWishlist(req.user._id, productId);
  res.status(200).json(new ApiResponse(200, wishlist, 'Wishlist updated successfully'));
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const result = await UserService.getAllUsers(req.query);
  res.status(200).json({
    success: true,
    users: result.users || result.items || (Array.isArray(result) ? result : []),
    pagination: result.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 },
    message: 'Users fetched successfully',
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await UserService.getUserById(req.params.id);
  res.status(200).json({
    success: true,
    user,
    data: user,
    message: 'User details fetched successfully',
  });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const user = await UserService.updateUserStatus(req.params.id, status);
  res.status(200).json({
    success: true,
    user,
    message: 'User status updated successfully',
  });
});
