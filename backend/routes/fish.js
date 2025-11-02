import express from 'express';
import * as fishController from '../controllers/fishController.js';
import { verifySuperAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes (for users)
router.get('/available', fishController.getAvailableFish);
router.get('/preparation-styles', fishController.getPreparationStyles);
router.get('/game-settings', fishController.getGameSettings);

// Admin routes (protected)
router.get('/all', verifySuperAdmin, fishController.getAllFish);
router.get('/:id', verifySuperAdmin, fishController.getFishById);
router.post('/', verifySuperAdmin, fishController.createFish);
router.put('/:id', verifySuperAdmin, fishController.updateFish);
router.delete('/:id', verifySuperAdmin, fishController.deleteFish);
router.put('/game/toggle', verifySuperAdmin, fishController.toggleFishingGame);
router.put('/game/preparation-styles', verifySuperAdmin, fishController.updatePreparationStyles);

export default router;
