import { User } from '../users/user.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { generateToken } from '../../utils/generateToken.js';
import { sanitizeUser } from '../../utils/sanitize.js';
import { AUTH_MESSAGES } from './auth.constants.js';

export class AuthService {
  static async register(userData) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new ApiError(400, AUTH_MESSAGES.EMAIL_IN_USE);
    }

    const user = await User.create(userData);
    const token = generateToken(user._id, user.role);

    return {
      user: sanitizeUser(user),
      token,
    };
  }

  static async login({ email, password }) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new ApiError(401, AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    const token = generateToken(user._id, user.role);

    return {
      user: sanitizeUser(user),
      token,
    };
  }
}
