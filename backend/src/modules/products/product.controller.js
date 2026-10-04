import { ProductService } from './product.service.js';
import { createProductSchema, updateProductSchema } from './product.validation.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const createProduct = asyncHandler(async (req, res) => {
  const { error, value } = createProductSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const product = await ProductService.createProduct(value);
  res.status(201).json(new ApiResponse(201, product, 'Product created successfully'));
});

export const getProducts = asyncHandler(async (req, res) => {
  const productsData = await ProductService.getAllProducts(req.query);
  res.status(200).json(new ApiResponse(200, productsData, 'Products retrieved successfully'));
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await ProductService.getProductById(req.params.id);
  res.status(200).json(new ApiResponse(200, product, 'Product retrieved successfully'));
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { error, value } = updateProductSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const product = await ProductService.updateProduct(req.params.id, value);
  res.status(200).json(new ApiResponse(200, product, 'Product updated successfully'));
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await ProductService.deleteProduct(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Product deleted successfully'));
});
