import { Enrollment } from '../courses/enrollment.model.js';

export class EnrollmentService {
  static async getAllEnrollments(queryParams = {}) {
    const { courseId, status, search } = queryParams;
    const filter = {};

    if (courseId && courseId !== 'all') {
      filter.course = courseId;
    }

    if (status && status !== 'all') {
      if (status === 'completed') {
        filter.isCompleted = true;
      } else if (status === 'in_progress') {
        filter.isCompleted = false;
        filter.progressPercentage = { $gt: 0 };
      } else if (status === 'not_started') {
        filter.isCompleted = false;
        filter.progressPercentage = 0;
      }
    }

    let rawEnrollments = await Enrollment.find(filter)
      .populate('user', 'name email avatar')
      .populate('course', 'title thumbnail image category level')
      .sort({ createdAt: -1 });

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      rawEnrollments = rawEnrollments.filter((e) => {
        const studentName = e.user?.name || '';
        const studentEmail = e.user?.email || '';
        const courseTitle = e.course?.title || '';
        return regex.test(studentName) || regex.test(studentEmail) || regex.test(courseTitle);
      });
    }

    const formattedEnrollments = rawEnrollments.map((doc) => {
      const progress = doc.progressPercentage ?? (doc.isCompleted ? 100 : 0);
      const enrStatus =
        doc.isCompleted || progress === 100
          ? 'completed'
          : progress > 0
          ? 'in_progress'
          : 'not_started';

      return {
        id: doc._id.toString(),
        studentId: doc.user?._id?.toString() || '',
        studentName: doc.user?.name || 'Student Patron',
        studentEmail: doc.user?.email || 'N/A',
        courseId: doc.course?._id?.toString() || '',
        courseTitle: doc.course?.title || 'Bakery Masterclass',
        courseThumbnail: doc.course?.thumbnail || doc.course?.image || '',
        enrollmentDate: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
        progress,
        status: enrStatus,
        lastAccessedAt: doc.updatedAt ? doc.updatedAt.toISOString() : new Date().toISOString(),
      };
    });

    return formattedEnrollments;
  }
}
