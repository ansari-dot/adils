import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesApi } from '../api/coursesApi';
import { Course, CourseCategory } from '../types';
import { CourseFormModal } from '../components/courses/CourseFormModal';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { useToast } from '../context/ToastContext';
import {
  GraduationCap,
  Plus,
  Search,
  Star,
  Edit2,
  Trash2,
  Eye,
  Loader2,
  Video,
} from 'lucide-react';

const CATEGORIES: ('all' | CourseCategory)[] = ['all', 'Beginner', 'Intermediate', 'Advanced'];

export function CoursesPage() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Delete
  const [deleteCandidate, setDeleteCandidate] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCourses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await coursesApi.getAll({
        search: search.trim() || undefined,
        category: category !== 'all' ? category : undefined,
      });
      if (res.success) {
        setCourses(res.courses);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve culinary courses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCourses();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, category]);

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      const res = await coursesApi.delete(deleteCandidate.id);
      if (res.success) {
        success(`Course "${deleteCandidate.title}" removed.`);
        setCourses((prev) => prev.filter((c) => c.id !== deleteCandidate.id));
        setDeleteCandidate(null);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to delete course');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-sans">
            Culinary Academy & Baking Courses
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 font-medium">
            Manage masterclass curriculums, lesson videos, instructor profiles, and enrollment metrics
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingCourse(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Course</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search course title, author, or specialty..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-stone-100 dark:bg-stone-800/60 rounded-lg text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-md capitalize font-medium transition-colors whitespace-nowrap ${
                category === cat
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              {cat === 'all' ? 'All Skill Levels' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Table View */}
      <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 text-stone-400">
            <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
            <span className="text-xs">Loading course catalog...</span>
          </div>
        ) : error ? (
          <div className="p-8">
            <ErrorState message={error} onRetry={fetchCourses} />
          </div>
        ) : courses.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={GraduationCap}
              title="No courses found"
              description="No baking masterclasses match the filter criteria."
              actionLabel="Add First Course"
              onAction={() => {
                setEditingCourse(null);
                setIsModalOpen(true);
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/60 text-[11px] text-stone-600 dark:text-stone-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Masterclass</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4 text-center">Lessons</th>
                  <th className="py-3 px-4 text-center">Enrollments</th>
                  <th className="py-3 px-4 text-center">Rating</th>
                  <th className="py-3 px-4">Instructor</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                {courses.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors">
                    {/* Thumbnail & Title */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded-lg overflow-hidden border border-stone-200 dark:border-stone-700 shrink-0">
                          <ImageWithFallback
                            src={c.thumbnail}
                            alt={c.title}
                            fallbackTitle={c.title}
                            aspectRatio="4/3"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <h3 className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                            {c.title}
                          </h3>
                          <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                            {c.tag}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Level */}
                    <td className="py-3 px-4">
                      <span className="font-medium text-stone-700 dark:text-stone-300">
                        {c.category}
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-4 text-stone-600 dark:text-stone-400 whitespace-nowrap">
                      {c.duration}
                    </td>

                    {/* Videos */}
                    <td className="py-3 px-4 text-center font-mono text-stone-700 dark:text-stone-300">
                      <span className="inline-flex items-center gap-1">
                        <Video className="w-3 h-3 text-stone-400" />
                        <span>{c.videoUrls.length}</span>
                      </span>
                    </td>

                    {/* Enrollments */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                      {c.enrollmentsCount}
                    </td>

                    {/* Rating */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{c.rating.toFixed(1)}</span>
                      </span>
                    </td>

                    {/* Author */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full overflow-hidden border border-stone-200 dark:border-stone-700 shrink-0">
                          <ImageWithFallback
                            src={c.authorAvatar}
                            alt={c.author}
                            aspectRatio="square"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-stone-900 dark:text-stone-100 font-medium truncate max-w-[120px]">
                          {c.author}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/courses/${c.id}`)}
                          className="p-1.5 rounded text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                          title="View curriculum & students"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCourse(c);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                          title="Edit course"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteCandidate(c)}
                          className="p-1.5 rounded text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete course"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <CourseFormModal
        isOpen={isModalOpen}
        course={editingCourse}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchCourses()}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteCandidate)}
        title="Delete Culinary Course?"
        message={
          deleteCandidate && deleteCandidate.enrollmentsCount > 0
            ? `Warning: "${deleteCandidate.title}" currently has ${deleteCandidate.enrollmentsCount} active student enrollments. Archiving is recommended over deletion.`
            : `Are you sure you want to permanently delete "${deleteCandidate?.title}"?`
        }
        confirmLabel="Confirm Deletion"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteCandidate(null)}
      />
    </div>
  );
}
