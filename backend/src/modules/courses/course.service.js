import { Course } from './course.model.js';
import { Enrollment } from './enrollment.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { getPagination, getPagingData } from '../../utils/pagination.js';

// Fields hidden from users who have not purchased the course
const LOCKED_FIELDS = '-videoUrls -lessons.videoUrl';

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export class CourseService {
  static async createCourse(courseData) {
    return await Course.create(courseData);
  }

  static async getCourseCategories() {
    const categories = await Course.distinct('category', { isPublished: { $ne: false } });
    return categories.filter((c) => typeof c === 'string' && c.trim().length > 0).sort();
  }

  static async getAllCourses(queryParams, isAdmin = false) {
    const { page, limit, skip, sort } = getPagination(queryParams);
    const filter = {};

    if (!isAdmin) {
      filter.isPublished = { $ne: false };
    }

    if (queryParams.level && queryParams.level !== 'All') {
      filter.level = queryParams.level.toLowerCase();
    }

    if (queryParams.category && queryParams.category !== 'All') {
      filter.category = new RegExp(`^${escapeRegex(queryParams.category)}$`, 'i');
    }

    if (queryParams.search && queryParams.search.trim()) {
      const regex = new RegExp(escapeRegex(queryParams.search.trim()), 'i');
      filter.$or = [
        { title: regex },
        { description: regex },
        { instructor: regex },
        { courseAuthor: regex },
        { category: regex },
        { tag: regex },
      ];
    }

    const courses = await Course.find(filter)
      .select(isAdmin ? '' : LOCKED_FIELDS)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    const totalItems = await Course.countDocuments(filter);
    return getPagingData(courses, page, limit, totalItems);
  }

  static async getCourseById(courseId, isAdmin = false) {
    const course = await Course.findById(courseId).select(isAdmin ? '' : LOCKED_FIELDS);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }
    return course;
  }

  /**
   * Returns full course content (including lesson videos) only if the user
   * has a PAID enrollment. Otherwise throws 403 (course is locked).
   */
  static async getCourseContent(userId, courseId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
      paymentStatus: 'paid',
    });
    if (!enrollment) {
      throw new ApiError(403, 'This course is locked. Please purchase it to get access.');
    }

    return { course, enrollment };
  }

  static async updateCourse(courseId, updateData) {
    const course = await Course.findByIdAndUpdate(courseId, updateData, {
      new: true,
      runValidators: true,
    });
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }
    return course;
  }

  static async deleteCourse(courseId) {
    const course = await Course.findByIdAndDelete(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }
    return course;
  }

  static async enrollUser(userId, courseId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    const isFree = !course.price || course.price <= 0;

    const existingEnrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (existingEnrollment) {
      if (existingEnrollment.paymentStatus === 'paid') {
        throw new ApiError(400, 'You already own this course');
      }
      // Reuse the pending/failed enrollment so the user can retry payment
      if (isFree) {
        existingEnrollment.paymentStatus = 'paid';
      } else {
        existingEnrollment.paymentStatus = 'pending';
      }
      await existingEnrollment.save();
      return { enrollment: existingEnrollment, course, requiresPayment: !isFree };
    }

    const enrollment = await Enrollment.create({
      user: userId,
      course: courseId,
      completedLessons: [],
      progressPercentage: 0,
      paymentStatus: isFree ? 'paid' : 'pending',
    });
    return { enrollment, course, requiresPayment: !isFree };
  }

  static async getUserEnrollments(userId) {
    return await Enrollment.find({ user: userId, paymentStatus: 'paid' }).populate('course');
  }

  static async markLessonComplete(userId, courseId, lessonId) {
    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
      paymentStatus: 'paid',
    });
    if (!enrollment) {
      throw new ApiError(404, 'Enrollment not found for this user');
    }

    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    const lessonExists = course.lessons.some(
      (l) => l._id.toString() === lessonId.toString()
    );
    if (!lessonExists) {
      throw new ApiError(404, 'Lesson not found in course');
    }

    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
    }

    const totalLessons = course.lessons.length;
    if (totalLessons > 0) {
      enrollment.progressPercentage = Math.round(
        (enrollment.completedLessons.length / totalLessons) * 100
      );
      if (enrollment.progressPercentage === 100) {
        enrollment.isCompleted = true;
      }
    }

    await enrollment.save();
    return enrollment;
  }
}
