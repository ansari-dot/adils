import mongoose from 'mongoose';
import { COURSE_LEVELS } from '../../utils/constants.js';

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  durationMinutes: { type: Number, default: 15 },
});

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    instructor: {
      type: String,
      default: 'Chef Master',
    },
    courseAuthor: {
      type: String,
      default: 'Chef Master',
    },
    authorAvatar: {
      type: String,
      default: 'https://storage.googleapis.com/banani-avatars/avatar/female/25-35/East Asian/2',
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    level: {
      type: String,
      default: 'beginner',
    },
    image: {
      type: String,
      default: '',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    duration: {
      type: String,
      default: '2 hrs 15 mins',
    },
    category: {
      type: String,
      default: 'Baking Basics',
    },
    tag: {
      type: String,
      default: 'Baking Basics',
    },
    tagColorTheme: {
      type: String,
      default: '#5c51f3',
    },
    rating: {
      type: Number,
      default: 4.9,
    },
    videoUrls: [String],
    lessons: [lessonSchema],
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

courseSchema.pre('save', function (next) {
  if (!this.courseAuthor && this.instructor) {
    this.courseAuthor = this.instructor;
  }
  if (!this.instructor && this.courseAuthor) {
    this.instructor = this.courseAuthor;
  }
  if (!this.image && this.thumbnail) {
    this.image = this.thumbnail;
  }
  if (!this.thumbnail && this.image) {
    this.thumbnail = this.image;
  }
  if (typeof next === 'function') {
    next();
  }
});

export const Course = mongoose.model('Course', courseSchema);
