import sharp from 'sharp';
import mongoose from 'mongoose';
import Fish from '../models/Fish.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const SPRITE_PATH = path.join(__dirname, '../../user-app/public/assets/fish-sprites/salmon-swim.png');
const FRAME_COUNT = 8;

async function updateSalmonSprite() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoUri) {
      console.error('❌ MongoDB URI not found in environment variables');
      console.log('Please set MONGODB_URI environment variable');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get sprite dimensions
    const metadata = await sharp(SPRITE_PATH).metadata();
    console.log(`\nSprite Image Info:`);
    console.log(`  Total Width: ${metadata.width}px`);
    console.log(`  Height: ${metadata.height}px`);

    const frameWidth = Math.floor(metadata.width / FRAME_COUNT);
    console.log(`  Frame Count: ${FRAME_COUNT}`);
    console.log(`  Frame Width: ${frameWidth}px`);

    // Find salmon fish (look for species='Salmon' or name containing 'salmon')
    const salmonFish = await Fish.findOne({
      $or: [
        { species: 'Salmon' },
        { name: /salmon/i }
      ]
    });

    if (!salmonFish) {
      console.log('\n❌ Salmon fish not found in database!');
      console.log('Please create a Salmon fish first in the admin panel.');
      process.exit(1);
    }

    console.log(`\n✓ Found fish: ${salmonFish.name} (${salmonFish.species})`);

    // Update sprite configuration
    salmonFish.gameSprite = '/assets/fish-sprites/salmon-swim.png';
    salmonFish.spriteFrames = FRAME_COUNT;
    salmonFish.spriteWidth = frameWidth;

    await salmonFish.save();

    console.log('\n✅ Salmon sprite configuration updated successfully!');
    console.log('\nConfiguration:');
    console.log(`  Game Sprite: ${salmonFish.gameSprite}`);
    console.log(`  Sprite Frames: ${salmonFish.spriteFrames}`);
    console.log(`  Sprite Width: ${salmonFish.spriteWidth}px`);
    console.log('\nYou can now test the fishing game to see the animated salmon!');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

updateSalmonSprite();
