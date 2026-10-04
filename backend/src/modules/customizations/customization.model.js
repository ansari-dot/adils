import mongoose from 'mongoose';
import { CAKE_REQUEST_STATUS } from '../../utils/constants.js';

const customizationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    flavor: {
      type: String,
      required: [true, 'Flavor is required'],
    },
    size: {
      type: String,
      default: '8"',
    },
    sizeWeightKg: {
      type: Number,
      default: 1.5,
    },
    tiers: {
      type: Number,
      default: 1,
      min: 1,
    },
    shape: {
      type: String,
      default: 'Round',
    },
    toppings: [String],
    dietaryRestrictions: [String],
    referenceImages: [String],
    description: {
      type: String,
      default: 'Custom cake request',
    },
    message: {
      type: String,
      default: '',
    },
    specialInstructions: {
      type: String,
      default: '',
    },
    eventDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: Object.values(CAKE_REQUEST_STATUS),
      default: CAKE_REQUEST_STATUS.PENDING,
    },
    quotedPrice: {
      type: Number,
      default: 0,
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Customization = mongoose.model('Customization', customizationSchema);
