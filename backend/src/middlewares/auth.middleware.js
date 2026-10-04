import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../modules/users/user.model.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized to access this route, token missing');
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      throw new ApiError(401, 'User associated with this token no longer exists');
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, 'Token verification failed or token expired');
  }
});

/**
 * Optional authentication: attaches req.user if a valid Bearer token is sent,
 * but never rejects the request. Useful for public routes that return
 * different data for admins / owners.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer')) {
      const token = header.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, jwtConfig.secret);
        const user = await User.findById(decoded.id).select('-password');
        if (user) req.user = user;
      }
    }
  } catch (_err) {
    // ignore invalid tokens on public routes
  }
  next();
};
