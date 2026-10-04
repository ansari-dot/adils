import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['order', 'custom_request', 'stock', 'user', 'course', 'system'],
      default: 'system',
    },
    isRead: { type: Boolean, default: false },
    link: { type: String, default: '' },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Notification = mongoose.model('Notification', notificationSchema);
