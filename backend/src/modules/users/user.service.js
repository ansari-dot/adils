import { User } from './user.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { getPagination, getPagingData } from '../../utils/pagination.js';

export class UserService {
  static async getUserProfile(userId) {
    const user = await User.findById(userId).populate('wishlist');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }

  static async updateUserProfile(userId, updateData) {
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).populate('wishlist');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }

  static async getWishlist(userId) {
    const user = await User.findById(userId).populate('wishlist');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user.wishlist;
  }

  static async toggleWishlist(userId, productId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const index = user.wishlist.indexOf(productId);
    if (index > -1) {
      user.wishlist.splice(index, 1);
    } else {
      user.wishlist.push(productId);
    }

    await user.save();
    return user.wishlist;
  }

  static async getAllUsers(queryParams = {}) {
    const { page, limit, skip, sort } = getPagination(queryParams);
    const filter = {};
    if (queryParams.search) {
      filter.$or = [
        { name: { $regex: queryParams.search, $options: 'i' } },
        { email: { $regex: queryParams.search, $options: 'i' } },
      ];
    }
    if (queryParams.role) {
      filter.role = queryParams.role;
    }
    const users = await User.find(filter).sort(sort).skip(skip).limit(limit);
    const totalItems = await User.countDocuments(filter);
    const paging = getPagingData(users, page, limit, totalItems);
    return {
      users: paging.items || users,
      pagination: {
        total: paging.totalItems,
        page: paging.currentPage,
        limit: limit,
        totalPages: paging.totalPages,
      },
    };
  }

  static async getUserById(userId) {
    const user = await User.findById(userId).populate('wishlist');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }

  static async updateUserStatus(userId, status) {
    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true, runValidators: true }
    );
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }
}
