import { Category } from './category.model.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json(new ApiResponse(201, category, 'Category created successfully'));
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort('name');
  res.status(200).json(new ApiResponse(200, categories, 'Categories retrieved successfully'));
});

export const getAllCategoriesAdmin = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort('-createdAt');
  res.status(200).json(new ApiResponse(200, categories, 'All categories retrieved successfully'));
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) throw new ApiError(404, 'Category not found');
  res.status(200).json(new ApiResponse(200, category, 'Category updated successfully'));
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');
  res.status(200).json(new ApiResponse(200, null, 'Category deleted successfully'));
});
