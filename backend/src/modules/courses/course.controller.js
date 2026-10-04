import { CourseService } from './course.service.js';
import { createCourseSchema, updateCourseSchema, updateProgressSchema } from './course.validation.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ROLES } from '../../utils/constants.js';

const isAdminUser = (req) => !!req.user && [ROLES.ADMIN, ROLES.STAFF].includes(req.user.role);

export const createCourse = asyncHandler(async (req, res) => {
  const { error, value } = createCourseSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const course = await CourseService.createCourse(value);
  res.status(201).json(new ApiResponse(201, course, 'Course created successfully'));
});

export const getCourses = asyncHandler(async (req, res) => {
  const coursesData = await CourseService.getAllCourses(req.query, isAdminUser(req));
  res.status(200).json(new ApiResponse(200, coursesData, 'Courses retrieved successfully'));
});

export const getCourseCategories = asyncHandler(async (req, res) => {
  const categories = await CourseService.getCourseCategories();
  res.status(200).json(new ApiResponse(200, categories, 'Course categories retrieved successfully'));
});

export const getCourseById = asyncHandler(async (req, res) => {
  const course = await CourseService.getCourseById(req.params.id, isAdminUser(req));
  res.status(200).json(new ApiResponse(200, course, 'Course retrieved successfully'));
});

export const getCourseContent = asyncHandler(async (req, res) => {
  const data = await CourseService.getCourseContent(req.user._id, req.params.id);
  res.status(200).json(new ApiResponse(200, data, 'Course content unlocked'));
});

export const updateCourse = asyncHandler(async (req, res) => {
  const { error, value } = updateCourseSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const course = await CourseService.updateCourse(req.params.id, value);
  res.status(200).json(new ApiResponse(200, course, 'Course updated successfully'));
});

export const deleteCourse = asyncHandler(async (req, res) => {
  await CourseService.deleteCourse(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Course deleted successfully'));
});

export const enrollInCourse = asyncHandler(async (req, res) => {
  const { enrollment, course, requiresPayment } = await CourseService.enrollUser(req.user._id, req.params.id);
  res.status(201).json(
    new ApiResponse(
      201,
      {
        _id: enrollment._id,
        enrollmentId: enrollment._id,
        courseId: course._id,
        price: course.price,
        paymentStatus: enrollment.paymentStatus,
        requiresPayment,
      },
      requiresPayment ? 'Enrollment created, awaiting payment' : 'Enrolled in free course successfully'
    )
  );
});

export const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await CourseService.getUserEnrollments(req.user._id);
  res.status(200).json(new ApiResponse(200, enrollments, 'User enrollments retrieved'));
});

export const markLessonComplete = asyncHandler(async (req, res) => {
  const { error, value } = updateProgressSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const enrollment = await CourseService.markLessonComplete(
    req.user._id,
    req.params.id,
    value.lessonId
  );
  res.status(200).json(new ApiResponse(200, enrollment, 'Lesson progress updated'));
});
