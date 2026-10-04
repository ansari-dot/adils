import Joi from 'joi';
import { COURSE_LEVELS } from '../../utils/constants.js';

export const createCourseSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow('', null).optional(),
  instructor: Joi.string().allow('', null).optional(),
  courseAuthor: Joi.string().allow('', null).optional(),
  authorAvatar: Joi.string().allow('', null).optional(),
  price: Joi.number().min(0).default(0),
  level: Joi.string().allow('', null).optional(),
  thumbnail: Joi.string().allow('', null).optional(),
  image: Joi.string().allow('', null).optional(),
  duration: Joi.string().allow('', null).optional(),
  category: Joi.string().allow('', null).optional(),
  tag: Joi.string().allow('', null).optional(),
  tagColorTheme: Joi.string().allow('', null).optional(),
  rating: Joi.number().min(0).max(5).optional(),
  videoUrls: Joi.array().items(Joi.string()).optional(),
  lessons: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      description: Joi.string().allow('', null),
      videoUrl: Joi.string().allow('', null),
      durationMinutes: Joi.number().min(1),
    }).unknown(true)
  ).optional(),
  isPublished: Joi.boolean().default(true),
}).unknown(true);

export const updateCourseSchema = createCourseSchema.fork(
  ['title'],
  (schema) => schema.optional()
).unknown(true);

export const updateProgressSchema = Joi.object({
  lessonId: Joi.string().hex().length(24).required(),
});
