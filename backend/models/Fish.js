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
  minWeight: {
    type: Number,
    default: 1.0,
    min: [0.1, 'Minimum weight must be at least 0.1kg']
  },
  maxWeight: {
    type: Number,
    default: 5.0,
    min: [0.5, 'Maximum weight must be at least 0.5kg']
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
