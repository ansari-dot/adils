import Joi from 'joi';
import { ORDER_STATUS, PAYMENT_STATUS } from './order.constants.js';

export const createOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        product: Joi.string().hex().length(24).allow('', null),
        productId: Joi.string().allow('', null),
        id: Joi.string().allow('', null),
        quantity: Joi.number().integer().min(1),
        qty: Joi.number().integer().min(1),
        title: Joi.string().allow('', null),
        price: Joi.number().min(0),
        image: Joi.string().allow('', null),
        baker: Joi.string().allow('', null),
      })
    )
    .min(1)
    .required(),
  shippingAddress: Joi.object({
    fullName: Joi.string().allow('', null),
    phone: Joi.string().allow('', null),
    street: Joi.string().allow('', null),
    addressLine: Joi.string().allow('', null),
    city: Joi.string().allow('', null),
    state: Joi.string().allow('', null),
    zipCode: Joi.string().allow('', null),
    postalCode: Joi.string().allow('', null),
    country: Joi.string().allow('', null),
  }).optional(),
  specialNotes: Joi.string().allow('', null),
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string().required(),
  paymentStatus: Joi.string().valid(...Object.values(PAYMENT_STATUS)),
});
