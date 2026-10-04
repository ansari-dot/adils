import { AuthService } from './auth.service.js';
import { registerSchema, loginSchema } from './auth.validation.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { AUTH_MESSAGES } from './auth.constants.js';
import { User } from '../users/user.model.js';
import { sanitizeUser } from '../../utils/sanitize.js';

export const register = asyncHandler(async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const result = await AuthService.register(value);
  res.status(201).json(new ApiResponse(201, result, AUTH_MESSAGES.REGISTER_SUCCESS));
});

export const login = asyncHandler(async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const result = await AuthService.login(value);
  res.status(200).json(new ApiResponse(200, result, AUTH_MESSAGES.LOGIN_SUCCESS));
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User no longer exists');
  }
  res.status(200).json(new ApiResponse(200, sanitizeUser(user), 'Profile fetched successfully'));
});

