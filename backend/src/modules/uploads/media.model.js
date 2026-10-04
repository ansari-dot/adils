import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], default: 'image' },
    url: { type: String, required: true },
    sizeBytes: { type: Number, default: 0 },
    category: { type: String, enum: ['product', 'course', 'avatar', 'banner'], default: 'product' },
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Media = mongoose.model('Media', mediaSchema);
