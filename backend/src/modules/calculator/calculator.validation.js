import Joi from 'joi';

export const calculateCostSchema = Joi.object({
  recipe: Joi.string().allow('', null).optional(),
  servings: Joi.number().min(1).optional(),
  tiers: Joi.number().min(1).optional(),
  shape: Joi.string().allow('', null).optional(),
  size: Joi.string().allow('', null).optional(),
  keto: Joi.boolean().optional(),
  sugarFree: Joi.boolean().optional(),
  glutenFree: Joi.boolean().optional(),
  allergySafe: Joi.boolean().optional(),
  ingredients: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        quantity: Joi.number().greater(0).required(),
        unit: Joi.string().required(), // e.g., grams, kg, ml, pcs
        costPerUnit: Joi.number().min(0).required(),
      })
    )
    .optional(),
  laborHours: Joi.number().min(0).default(1),
  hourlyLaborRate: Joi.number().min(0).default(15),
  overheadPercentage: Joi.number().min(0).default(20), // e.g., 20%
  desiredProfitMarginPercentage: Joi.number().min(0).default(30), // e.g., 30%
});
