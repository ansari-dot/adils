import React, { useEffect, useState } from 'react';
import { enrollmentsApi } from '../api/enrollmentsApi';
import { coursesApi } from '../api/coursesApi';
import { Enrollment, Course } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { Search, BookOpenCheck, Loader2 } from 'lucide-react';

export function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [enrRes, crsRes] = await Promise.all([
        enrollmentsApi.getAll({
          search: search.trim() || undefined,
          courseId: courseFilter !== 'all' ? courseFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        }),
        coursesApi.getAll(),
      ]);

      if (enrRes.success) setEnrollments(Array.isArray(enrRes.enrollments) ? enrRes.enrollments : (enrRes as any)?.items || []);
      if (crsRes.success) setCourses(Array.isArray(crsRes.courses) ? crsRes.courses : (crsRes as any)?.items || []);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve enrollments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, courseFilter, statusFilter]);

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-sans">
            Student Course Participation & Enrollments
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 font-medium">
            Monitor syllabus completion rates, lesson progress, and student certifications
          </p>
        </div>
        <div className="text-xs font-mono font-medium text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-lg w-fit">
          {enrollments.length} {enrollments.length === 1 ? 'Active Enrollment' : 'Active Enrollments'}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student or course title..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Course filter */}
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="all">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="all">All Progress Statuses</option>
            <option value="not_started">Not Started (0%)</option>
            <option value="in_progress">In Progress (1–99%)</option>
            <option value="completed">Completed (100%)</option>
          </select>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 text-stone-400">
            <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
            <span className="text-xs">Loading course enrollments...</span>
          </div>
        ) : error ? (
          <div className="p-8">
            <ErrorState message={error} onRetry={fetchData} />
          </div>
        ) : enrollments.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={BookOpenCheck}
              title="No enrollments found"
              description="No student participation records match your current filters."
              actionLabel="Clear Filters"
              onAction={() => {
                setSearch('');
                setCourseFilter('all');
                setStatusFilter('all');
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/60 text-[11px] text-stone-600 dark:text-stone-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Course Masterclass</th>
                  <th className="py-3 px-4">Enrollment Date</th>
                  <th className="py-3 px-4">Curriculum Progress</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                {enrollments.map((enr) => (
                  <tr key={enr.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors">
                    {/* Student */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900 dark:text-stone-100">
                        {enr.studentName}
                      </div>
                      <div className="text-[10px] text-stone-500 font-mono">
                        {enr.studentEmail}
                      </div>
                    </td>

                    {/* Course */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-8 rounded overflow-hidden border border-stone-200 dark:border-stone-700 shrink-0">
                          <ImageWithFallback
                            src={enr.courseThumbnail}
                            alt={enr.courseTitle}
                            aspectRatio="4/3"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-medium text-stone-900 dark:text-stone-100 truncate max-w-xs">
                          {enr.courseTitle}
                        </span>
                      </div>
                    </td>

                    {/* Enrollment Date */}
                    <td className="py-3.5 px-4 text-stone-500 whitespace-nowrap">
                      {new Date(enr.enrollmentDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    {/* Progress Bar */}
                    <td className="py-3.5 px-4 w-44">
                      <div className="flex justify-between text-[11px] font-mono text-stone-600 dark:text-stone-400 mb-1">
                        <span>Progress</span>
                        <span className="font-bold">{enr.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            enr.progress === 100
                              ? 'bg-emerald-600'
                              : enr.progress > 0
                              ? 'bg-amber-600'
                              : 'bg-stone-300 dark:bg-stone-700'
                          }`}
                          style={{ width: `${enr.progress}%` }}
                        />
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={enr.status} />
                    </td>

                    {/* Last Accessed */}
                    <td className="py-3.5 px-4 text-stone-500 whitespace-nowrap">
                      {new Date(enr.lastAccessedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
