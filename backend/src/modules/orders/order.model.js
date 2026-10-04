import mongoose from 'mongoose';
import { ORDER_STATUS, PAYMENT_STATUS } from './order.constants.js';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false,
  },
  productId: {
    type: String,
  },
  title: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  qty: {
    type: Number,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    default: '',
  },
  baker: {
    type: String,
    default: 'Sarah Kim',
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    deliveryFee: {
      type: Number,
      default: 5.0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: [...Object.values(ORDER_STATUS), 'processing', 'completed'],
      default: ORDER_STATUS.PENDING,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    paymentIntentId: {
      type: String,
      default: '',
    },
    shippingAddress: {
      fullName: { type: String, default: '' },
      phone: { type: String, default: '' },
      street: { type: String, default: '123 Baker Street' },
      addressLine: { type: String, default: '123 Baker Street' },
      city: { type: String, default: 'London' },
      state: { type: String, default: 'London' },
      zipCode: { type: String, default: 'W1U 6GB' },
      postalCode: { type: String, default: 'W1U 6GB' },
      country: { type: String, default: 'United Kingdom' },
    },
    specialNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model('Order', orderSchema);
