import Joi from 'joi';
import { CAKE_REQUEST_STATUS } from '../../utils/constants.js';

export const createCustomizationSchema = Joi.object({
  flavor: Joi.string().required(),
  size: Joi.string().allow('', null),
  sizeWeightKg: Joi.number().min(0.1).optional(),
  tiers: Joi.number().integer().min(1).optional(),
  shape: Joi.string().allow('', null).optional(),
  toppings: Joi.array().items(Joi.string()).optional(),
  dietaryRestrictions: Joi.array().items(Joi.string()).optional(),
  referenceImages: Joi.array().items(Joi.string()).optional(),
  description: Joi.string().allow('', null).optional(),
  message: Joi.string().allow('', null).optional(),
  specialInstructions: Joi.string().allow('', null).optional(),
  eventDate: Joi.date().iso().optional(),
});

export const updateCustomizationStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(CAKE_REQUEST_STATUS))
    .required(),
  quotedPrice: Joi.number().min(0),
  adminNotes: Joi.string().allow('', null),
});
