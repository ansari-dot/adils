import Joi from 'joi';

export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  phone: Joi.string().allow('', null),
  avatarUrl: Joi.string().allow('', null),
  theme: Joi.string().valid('light', 'dark', 'system'),
  addresses: Joi.array().items(
    Joi.object({
      label: Joi.string().allow('', null),
      street: Joi.string().allow('', null),
      city: Joi.string().allow('', null),
      zipCode: Joi.string().allow('', null),
      country: Joi.string().allow('', null),
      isPrimary: Joi.boolean(),
    })
  ),
  paymentMethods: Joi.array().items(
    Joi.object({
      brand: Joi.string().allow('', null),
      last4: Joi.string().allow('', null),
      expMonth: Joi.number(),
      expYear: Joi.number(),
      isPrimary: Joi.boolean(),
    })
  ),
  preferences: Joi.object({
    sweetness: Joi.string().allow('', null),
    dietary: Joi.array().items(Joi.string()),
    notifications: Joi.object({
      push: Joi.boolean(),
      email: Joi.boolean(),
      biometric: Joi.boolean(),
    }),
  }),
});
