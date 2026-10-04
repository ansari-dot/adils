import { CalculatorService } from './calculator.service.js';
import { calculateCostSchema } from './calculator.validation.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const getConfig = asyncHandler(async (req, res) => {
  const config = await CalculatorService.getConfig();
  res.status(200).json(new ApiResponse(200, { config }, 'Calculator configuration retrieved successfully'));
});

export const updateConfig = asyncHandler(async (req, res) => {
  const config = await CalculatorService.updateConfig(req.body, req.user);
  res.status(200).json(new ApiResponse(200, { config }, 'Calculator configuration updated successfully'));
});

export const getStats = asyncHandler(async (req, res) => {
  const stats = await CalculatorService.getStats();
  res.status(200).json(new ApiResponse(200, { stats }, 'Calculator stats retrieved successfully'));
});

export const calculateCost = asyncHandler(async (req, res) => {
  const { error, value } = calculateCostSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const result = await CalculatorService.calculateCost(value, req.user?._id);
  res.status(200).json(new ApiResponse(200, result, 'Bakery cost calculated successfully'));
});
