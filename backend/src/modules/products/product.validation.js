import Joi from 'joi';

export const createProductSchema = Joi.object({
  name: Joi.string().allow('', null),
  title: Joi.string().allow('', null),
  description: Joi.string().allow('', null),
  price: Joi.number().min(0).required(),
  category: Joi.string().required(),
  image: Joi.string().allow('', null),
  images: Joi.array().items(Joi.string()),
  bakerName: Joi.string().allow('', null),
  bakerAvatar: Joi.string().allow('', null),
  bakerTitle: Joi.string().allow('', null),
  reviewsCount: Joi.number().integer().min(0),
  isPopular: Joi.boolean(),
  stock: Joi.number().integer().min(0),
  isAvailable: Joi.boolean(),
  inStock: Joi.boolean(),
  ingredients: Joi.array().items(Joi.string()),
  allergens: Joi.array().items(Joi.string()),
  rating: Joi.number().min(0).max(5),
}).unknown(true);

export const updateProductSchema = createProductSchema.fork(
  ['name', 'description', 'price', 'category'],
  (schema) => schema.optional()
);
