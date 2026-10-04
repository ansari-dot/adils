import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    images: [
      {
        type: String,
      },
    ],
    bakerName: {
      type: String,
      default: 'Sarah Kim',
    },
    bakerAvatar: {
      type: String,
      default: 'https://storage.googleapis.com/banani-avatars/avatar/female/25-35/East Asian/2',
    },
    bakerTitle: {
      type: String,
      default: 'Home Baker · 3 yrs experience',
    },
    reviewsCount: {
      type: Number,
      default: 120,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    stock: {
      type: Number,
      default: 50,
      min: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    ingredients: [String],
    allergens: [String],
    rating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.pre('save', function (next) {
  if (!this.title && this.name) {
    this.title = this.name;
  }
  if (!this.name && this.title) {
    this.name = this.title;
  }
  if (this.inStock !== undefined && this.isAvailable === undefined) {
    this.isAvailable = this.inStock;
  }
  if (this.isAvailable !== undefined && this.inStock === undefined) {
    this.inStock = this.isAvailable;
  }
  if ((!this.image || this.image === '') && this.images && this.images.length > 0) {
    this.image = this.images[0];
  }
  if ((!this.images || this.images.length === 0) && this.image) {
    this.images = [this.image];
  }
  if (typeof next === 'function') {
    next();
  }
});

productSchema.index({ name: 'text', title: 'text', description: 'text' });

export const Product = mongoose.model('Product', productSchema);
