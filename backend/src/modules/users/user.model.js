import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../../utils/constants.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },
    phone: {
      type: String,
      default: '',
    },
    addresses: [
      {
        label: { type: String, default: 'Home' },
        street: String,
        city: String,
        zipCode: String,
        country: { type: String, default: 'United Kingdom' },
        isPrimary: { type: Boolean, default: false }
      }
    ],
    paymentMethods: [
      {
        brand: String,
        last4: String,
        expMonth: Number,
        expYear: Number,
        isPrimary: { type: Boolean, default: false }
      }
    ],
    preferences: {
      sweetness: { type: String, default: 'Standard' },
      dietary: { type: [String], default: [] },
      notifications: {
        push: { type: Boolean, default: true },
        email: { type: Boolean, default: false },
        biometric: { type: Boolean, default: true },
      },
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    avatarUrl: {
      type: String,
      default: '',
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
