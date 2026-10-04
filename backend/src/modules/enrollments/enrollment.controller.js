import { EnrollmentService } from './enrollment.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const getAllEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await EnrollmentService.getAllEnrollments(req.query);
  res.status(200).json(
    new ApiResponse(200, enrollments, 'Enrollments retrieved successfully')
  );
});
