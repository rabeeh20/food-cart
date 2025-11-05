import mongoose from 'mongoose';

const fishSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Fish name is required'],
    trim: true
  },
  species: {
    type: String,
    required: [true, 'Fish species is required'],
    enum: ['Pomfret', 'Kingfish', 'Mackerel', 'Tuna', 'Salmon', 'Sardine', 'Prawns', 'Crab', 'Squid', 'Lobster', 'Other'],
    default: 'Other'
  },
  image: {
    type: String,
    required: [true, 'Fish image is required']
  },
  pricePerKg: {
    type: Number,
    required: [true, 'Price per kg is required'],
    min: [0, 'Price cannot be negative']
  },
  availableStock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    default: ''
  },
  // Available weight options (e.g., [0.5, 1, 1.5, 2])
  weightOptions: {
    type: [Number],
    default: [0.5, 1, 1.5, 2, 2.5],
    validate: {
      validator: function(arr) {
        return arr.length > 0 && arr.every(w => w >= 0.1 && w <= 10);
      },
      message: 'Weight options must have at least one value between 0.1kg and 10kg'
    }
  },
  // Sprite animation fields for fishing game
  gameSprite: {
    type: String,
    default: null // If null, falls back to image field
  },
  spriteFrames: {
    type: Number,
    default: 1, // 1 = static image, >1 = animated sprite sheet
    min: [1, 'Sprite frames must be at least 1']
  },
  spriteWidth: {
    type: Number,
    default: 64, // Width of single frame in pixels
    min: [16, 'Sprite width must be at least 16px']
  }
}, {
  timestamps: true
});

// Virtual to check if fish is in stock
fishSchema.virtual('inStock').get(function() {
  return this.availableStock > 0 && this.isAvailable;
});

// Method to reduce stock after catch
fishSchema.methods.reduceFishStock = async function(quantity = 1) {
  if (this.availableStock < quantity) {
    throw new Error('Insufficient stock');
  }
  this.availableStock -= quantity;
  if (this.availableStock === 0) {
    this.isAvailable = false;
  }
  return await this.save();
};

export default mongoose.model('Fish', fishSchema);
