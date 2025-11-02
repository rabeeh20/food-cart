import Fish from '../models/Fish.js';
import GameSettings from '../models/GameSettings.js';

// Get all available fish (for fishing game - user endpoint)
export const getAvailableFish = async (req, res) => {
  try {
    const gameSettings = await GameSettings.getSettings();

    if (!gameSettings.fishingGameEnabled) {
      return res.status(200).json({
        success: true,
        gameEnabled: false,
        message: 'Fishing game is currently disabled'
      });
    }

    const fish = await Fish.find({ isAvailable: true, availableStock: { $gt: 0 } })
      .select('name species image pricePerKg minWeight maxWeight description')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      gameEnabled: true,
      fish,
      count: fish.length
    });
  } catch (error) {
    console.error('Error fetching available fish:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available fish',
      error: error.message
    });
  }
};

// Get all fish (admin endpoint)
export const getAllFish = async (req, res) => {
  try {
    const fish = await Fish.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      fish,
      count: fish.length
    });
  } catch (error) {
    console.error('Error fetching all fish:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fish',
      error: error.message
    });
  }
};

// Get single fish by ID
export const getFishById = async (req, res) => {
  try {
    const fish = await Fish.findById(req.params.id);

    if (!fish) {
      return res.status(404).json({
        success: false,
        message: 'Fish not found'
      });
    }

    res.status(200).json({
      success: true,
      fish
    });
  } catch (error) {
    console.error('Error fetching fish:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fish',
      error: error.message
    });
  }
};

// Create new fish (admin only)
export const createFish = async (req, res) => {
  try {
    const { name, species, image, pricePerKg, availableStock, isAvailable, description, minWeight, maxWeight } = req.body;

    const fish = await Fish.create({
      name,
      species,
      image,
      pricePerKg,
      availableStock,
      isAvailable,
      description,
      minWeight,
      maxWeight
    });

    res.status(201).json({
      success: true,
      message: 'Fish created successfully',
      fish
    });
  } catch (error) {
    console.error('Error creating fish:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create fish',
      error: error.message
    });
  }
};

// Update fish (admin only)
export const updateFish = async (req, res) => {
  try {
    const fish = await Fish.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!fish) {
      return res.status(404).json({
        success: false,
        message: 'Fish not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Fish updated successfully',
      fish
    });
  } catch (error) {
    console.error('Error updating fish:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update fish',
      error: error.message
    });
  }
};

// Delete fish (admin only)
export const deleteFish = async (req, res) => {
  try {
    const fish = await Fish.findByIdAndDelete(req.params.id);

    if (!fish) {
      return res.status(404).json({
        success: false,
        message: 'Fish not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Fish deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting fish:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete fish',
      error: error.message
    });
  }
};

// Get game settings
export const getGameSettings = async (req, res) => {
  try {
    const settings = await GameSettings.getSettings();

    res.status(200).json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error fetching game settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch game settings',
      error: error.message
    });
  }
};

// Toggle fishing game (admin only)
export const toggleFishingGame = async (req, res) => {
  try {
    const { enabled } = req.body;

    const settings = await GameSettings.toggleGame(enabled);

    res.status(200).json({
      success: true,
      message: `Fishing game ${enabled ? 'enabled' : 'disabled'} successfully`,
      settings
    });
  } catch (error) {
    console.error('Error toggling fishing game:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle fishing game',
      error: error.message
    });
  }
};

// Update preparation styles (admin only)
export const updatePreparationStyles = async (req, res) => {
  try {
    const { preparationStyles } = req.body;

    const settings = await GameSettings.updatePreparationStyles(preparationStyles);

    res.status(200).json({
      success: true,
      message: 'Preparation styles updated successfully',
      settings
    });
  } catch (error) {
    console.error('Error updating preparation styles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preparation styles',
      error: error.message
    });
  }
};

// Get preparation styles (user endpoint)
export const getPreparationStyles = async (req, res) => {
  try {
    const settings = await GameSettings.getSettings();

    const availableStyles = settings.preparationStyles.filter(style => style.isAvailable);

    res.status(200).json({
      success: true,
      preparationStyles: availableStyles
    });
  } catch (error) {
    console.error('Error fetching preparation styles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch preparation styles',
      error: error.message
    });
  }
};
