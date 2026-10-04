import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coursesApi } from '../api/coursesApi';
import { Course, Enrollment } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { CourseFormModal } from '../components/courses/CourseFormModal';
import { ErrorState } from '../components/common/ErrorState';
import {
  ArrowLeft,
  GraduationCap,
  Star,
  Clock,
  Video,
  ExternalLink,
  Edit2,
  Users,
  Loader2,
} from 'lucide-react';

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchCourse = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await coursesApi.getById(id);
      if (res.success) {
        setCourse(res.course);
        setEnrollments(res.enrollments);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve course details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
        <span className="text-xs text-stone-500">Loading course curriculum...</span>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="py-8">
        <ErrorState message={error || 'Course not found'} onRetry={fetchCourse} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/courses')}
            className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-sans">
              {course.title}
            </h1>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Instructor: {course.author} · {course.category} Level · {course.duration}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsEditModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 text-xs font-semibold transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit Course Syllabus</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Course Overview & Video Lessons */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Banner Card */}
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden">
            <div className="h-56 relative bg-stone-100 dark:bg-stone-800">
              <ImageWithFallback
                src={course.thumbnail}
                alt={course.title}
                aspectRatio="video"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                  {course.tag}
                </span>
                <span className="text-xs text-stone-400">·</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 font-mono">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{course.rating.toFixed(1)} Rating</span>
                </span>
                <span className="text-xs text-stone-400">·</span>
                <span className="text-xs text-stone-500 font-medium">
                  {enrollments.length} Active Students
                </span>
              </div>

              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
                {course.description || 'Comprehensive professional pastry curriculum.'}
              </p>
            </div>
          </div>

          {/* Video Lessons Module */}
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-2">
              <Video className="w-4 h-4" />
              <span>Course Video Lessons ({course.videoUrls.length})</span>
            </h3>

            <div className="divide-y divide-stone-100 dark:divide-stone-800/60">
              {course.videoUrls.length === 0 ? (
                <p className="text-xs text-stone-400 py-4 text-center">No video lessons configured.</p>
              ) : (
                course.videoUrls.map((url, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-[11px] font-semibold text-stone-400 w-5 text-right">
                        0{idx + 1}
                      </span>
                      <span className="font-mono text-stone-700 dark:text-stone-300 truncate">
                        {url}
                      </span>
                    </div>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 hover:underline shrink-0"
                    >
                      <span>Preview</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Enrolled Students Table */}
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Enrolled Students ({enrollments.length})</span>
            </h3>

            {enrollments.length === 0 ? (
              <p className="text-xs text-stone-400 py-6 text-center">No students currently enrolled.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-stone-100 dark:border-stone-800 text-[11px] text-stone-400 uppercase">
                      <th className="py-2.5 px-3">Student</th>
                      <th className="py-2.5 px-3">Enrolled</th>
                      <th className="py-2.5 px-3">Progress</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                    {enrollments.map((enr) => (
                      <tr key={enr.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-stone-900 dark:text-stone-100">{enr.studentName}</div>
                          <div className="text-[10px] text-stone-500 font-mono">{enr.studentEmail}</div>
                        </td>
                        <td className="py-3 px-3 text-stone-500">
                          {new Date(enr.enrollmentDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 w-36">
                          <div className="flex justify-between text-[10px] font-mono text-stone-500 mb-1">
                            <span>{enr.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-600 rounded-full"
                              style={{ width: `${enr.progress}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge status={enr.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Instructor Profile */}
        <div className="space-y-6">
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
              Master Instructor
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-stone-200 dark:border-stone-700 shrink-0">
                <ImageWithFallback
                  src={course.authorAvatar}
                  alt={course.author}
                  aspectRatio="square"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  {course.author}
                </h4>
                <p className="text-[11px] text-stone-500">Certified Academy Instructor</p>
              </div>
            </div>

            {course.authorBio && (
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 leading-relaxed font-sans">
                {course.authorBio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <CourseFormModal
        isOpen={isEditModalOpen}
        course={course}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => fetchCourse()}
      />
    </div>
  );
}
