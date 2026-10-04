import { CustomizationService } from './customization.service.js';
import {
  createCustomizationSchema,
  updateCustomizationStatusSchema,
} from './customization.validation.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const createRequest = asyncHandler(async (req, res) => {
  const { error, value } = createCustomizationSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const customRequest = await CustomizationService.createRequest(req.user._id, value);
  res.status(201).json(new ApiResponse(201, customRequest, 'Custom cake request submitted'));
});

export const getMyRequests = asyncHandler(async (req, res) => {
  const requests = await CustomizationService.getUserRequests(req.user._id, req.query);
  res.status(200).json(new ApiResponse(200, requests, 'User cake requests retrieved'));
});

export const getRequestById = asyncHandler(async (req, res) => {
  const request = await CustomizationService.getRequestById(
    req.params.id,
    req.user._id,
    req.user.role
  );
  res.status(200).json(new ApiResponse(200, request, 'Cake request details retrieved'));
});

export const getAllRequests = asyncHandler(async (req, res) => {
  const requests = await CustomizationService.getAllRequests(req.query);
  res.status(200).json(new ApiResponse(200, requests, 'All cake requests retrieved'));
});

export const updateRequestStatus = asyncHandler(async (req, res) => {
  const { error, value } = updateCustomizationStatusSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const request = await CustomizationService.updateRequestStatus(req.params.id, value);
  res.status(200).json(new ApiResponse(200, request, 'Cake request status updated'));
});
