import { Customization } from './customization.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { getPagination, getPagingData } from '../../utils/pagination.js';

export class CustomizationService {
  static async createRequest(userId, requestData) {
    return await Customization.create({
      user: userId,
      ...requestData,
    });
  }

  static async getUserRequests(userId, queryParams) {
    const { page, limit, skip, sort } = getPagination(queryParams);
    const filter = { user: userId };

    const requests = await Customization.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalItems = await Customization.countDocuments(filter);
    return getPagingData(requests, page, limit, totalItems);
  }

  static async getRequestById(requestId, userId, userRole) {
    const request = await Customization.findById(requestId).populate('user');
    if (!request) {
      throw new ApiError(404, 'Custom cake request not found');
    }

    if (userRole !== 'admin' && request.user._id.toString() !== userId.toString()) {
      throw new ApiError(403, 'Not authorized to view this request');
    }

    return request;
  }

  static async getAllRequests(queryParams) {
    const { page, limit, skip, sort } = getPagination(queryParams);
    const filter = {};
    if (queryParams.status) {
      filter.status = queryParams.status;
    }

    const requests = await Customization.find(filter)
      .populate('user')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalItems = await Customization.countDocuments(filter);
    return getPagingData(requests, page, limit, totalItems);
  }

  static async updateRequestStatus(requestId, updateData) {
    const request = await Customization.findByIdAndUpdate(requestId, updateData, {
      new: true,
      runValidators: true,
    }).populate('user');

    if (!request) {
      throw new ApiError(404, 'Custom cake request not found');
    }

    return request;
  }
}
