import mongoose from 'mongoose';

const gameSettingsSchema = new mongoose.Schema({
  fishingGameEnabled: {
    type: Boolean,
    default: true
  },
  preparationStyles: [{
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      default: ''
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  gameTitle: {
    type: String,
    default: 'Catch Fresh Fish Today!'
  },
  gameDescription: {
    type: String,
    default: 'Try your luck and catch the freshest fish of the day!'
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
gameSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();

  // Create default settings if none exist
  if (!settings) {
    settings = await this.create({
      fishingGameEnabled: true,
      preparationStyles: [
        { name: 'Fry', price: 20, description: 'Deep fried to golden perfection', isAvailable: true },
        { name: 'Masala', price: 30, description: 'Cooked in rich Indian spices', isAvailable: true },
        { name: 'Grilled', price: 50, description: 'Flame-grilled for smoky flavor', isAvailable: true },
        { name: 'Curry', price: 40, description: 'Slow-cooked in aromatic curry', isAvailable: true }
      ]
    });
  }

  return settings;
};

// Update game status
gameSettingsSchema.statics.toggleGame = async function(enabled) {
  const settings = await this.getSettings();
  settings.fishingGameEnabled = enabled;
  return await settings.save();
};

// Update preparation styles
gameSettingsSchema.statics.updatePreparationStyles = async function(styles) {
  const settings = await this.getSettings();
  settings.preparationStyles = styles;
  return await settings.save();
};

export default mongoose.model('GameSettings', gameSettingsSchema);
