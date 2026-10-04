import React, { useState, useEffect } from 'react';
import { Course, CourseCategory } from '../../types';
import { coursesApi } from '../../api/coursesApi';
import { useToast } from '../../context/ToastContext';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import { ImageWithFallback } from '../common/ImageWithFallback';

interface CourseFormModalProps {
  isOpen: boolean;
  course?: Course | null;
  onClose: () => void;
  onSuccess: (course: Course) => void;
}

const CATEGORIES: CourseCategory[] = ['Beginner', 'Intermediate', 'Advanced'];
const THEMES = ['amber', 'emerald', 'purple', 'rose', 'blue'] as const;

export function CourseFormModal({ isOpen, course, onClose, onSuccess }: CourseFormModalProps) {
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('Chef Isabella Vance');
  const [authorAvatar, setAuthorAvatar] = useState('https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80');
  const [authorBio, setAuthorBio] = useState('Executive Pastry Instructor');
  const [duration, setDuration] = useState('4.0 Hours · 10 Lessons');
  const [category, setCategory] = useState<CourseCategory>('Intermediate');
  const [tag, setTag] = useState('Masterclass');
  const [tagColorTheme, setTagColorTheme] = useState<'amber' | 'emerald' | 'purple' | 'rose' | 'blue'>('amber');
  const [rating, setRating] = useState('5.0');
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80');
  const [videoUrls, setVideoUrls] = useState<string[]>(['https://www.youtube.com/watch?v=sample-lesson-1']);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setDescription(course.description || '');
      setAuthor(course.author);
      setAuthorAvatar(course.authorAvatar);
      setAuthorBio(course.authorBio || '');
      setDuration(course.duration);
      setCategory(course.category);
      setTag(course.tag);
      setTagColorTheme(course.tagColorTheme);
      setRating(String(course.rating));
      setThumbnail(course.thumbnail);
      setVideoUrls(course.videoUrls.length > 0 ? course.videoUrls : ['']);
    } else {
      setTitle('');
      setDescription('');
      setAuthor('Chef Isabella Vance');
      setAuthorAvatar('https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80');
      setAuthorBio('Executive Pastry Instructor');
      setDuration('3.5 Hours · 8 Lessons');
      setCategory('Intermediate');
      setTag('Lamination Series');
      setTagColorTheme('amber');
      setRating('5.0');
      setThumbnail('https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80');
      setVideoUrls(['https://www.youtube.com/watch?v=intro-v1']);
    }
    setErrors({});
  }, [course, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Course title is required';
    if (!author.trim()) errs.author = 'Author name is required';
    if (!duration.trim()) errs.duration = 'Duration description is required';
    if (!thumbnail.trim()) errs.thumbnail = 'Course thumbnail URL is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddVideo = () => {
    setVideoUrls([...videoUrls, '']);
  };

  const handleUpdateVideo = (index: number, val: string) => {
    const copy = [...videoUrls];
    copy[index] = val;
    setVideoUrls(copy);
  };

  const handleRemoveVideo = (index: number) => {
    if (videoUrls.length <= 1) {
      setVideoUrls(['']);
      return;
    }
    setVideoUrls(videoUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const cleanVideos = videoUrls.map((u) => u.trim()).filter(Boolean);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      author: author.trim(),
      authorAvatar: authorAvatar.trim(),
      authorBio: authorBio.trim(),
      duration: duration.trim(),
      category,
      tag: tag.trim(),
      tagColorTheme,
      rating: parseFloat(rating) || 5.0,
      thumbnail: thumbnail.trim(),
      videoUrls: cleanVideos,
    };

    try {
      if (course) {
        const res = await coursesApi.update(course.id, payload);
        if (res.success) {
          success(`Course "${res.course.title}" updated successfully`);
          onSuccess(res.course);
          onClose();
        }
      } else {
        const res = await coursesApi.create(payload);
        if (res.success) {
          success(`Course "${res.course.title}" created successfully`);
          onSuccess(res.course);
          onClose();
        }
      }
    } catch (err: any) {
      error(err.message || 'Failed to save course');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xl max-w-2xl w-full my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
              {course ? 'Edit Culinary Course' : 'Create New Course'}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Manage masterclass syllabus, instructor info, and instructional videos
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Thumbnail preview & URL */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
              Course Thumbnail <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-4 items-start">
              <div className="w-28 h-20 rounded-lg overflow-hidden border border-stone-200 dark:border-stone-700 shrink-0 bg-stone-100 dark:bg-stone-800">
                <ImageWithFallback
                  src={thumbnail}
                  alt="Thumbnail Preview"
                  fallbackTitle="Course preview"
                  aspectRatio="4/3"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <input
                  type="url"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="https://... course cover image"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                {errors.thumbnail && <p className="text-rose-500 text-[11px] mt-1">{errors.thumbnail}</p>}
              </div>
            </div>
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Course Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Masterclass in Artisan Lamination"
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              {errors.title && <p className="text-rose-500 text-[11px] mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Level
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CourseCategory)}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Course Curriculum Summary
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What techniques, chemical principles, and baking methods will students acquire?"
              className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Instructor details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Author Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Chef Isabella Vance"
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              {errors.author && <p className="text-rose-500 text-[11px] mt-1">{errors.author}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Author Avatar URL
              </label>
              <input
                type="url"
                value={authorAvatar}
                onChange={(e) => setAuthorAvatar(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Duration, Tag, Tag Theme */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Duration <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="4.0 Hours · 12 Lessons"
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Tag Label
              </label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="Lamination Masterclass"
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Tag Theme
              </label>
              <select
                value={tagColorTheme}
                onChange={(e) => setTagColorTheme(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 capitalize"
              >
                {THEMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Video URLs list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Instructional Video URLs ({videoUrls.length})
              </label>
              <button
                type="button"
                onClick={handleAddVideo}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:underline"
              >
                <Plus className="w-3 h-3" />
                <span>Add Video</span>
              </button>
            </div>

            <div className="space-y-2">
              {videoUrls.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-stone-400 font-mono text-[10px] w-5 text-right shrink-0">
                    {idx + 1}.
                  </span>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleUpdateVideo(idx, e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveVideo(idx)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                    title="Remove video URL"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-semibold hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{course ? 'Update Course' : 'Create Course'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
