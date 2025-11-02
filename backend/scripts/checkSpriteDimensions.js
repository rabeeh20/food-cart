import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SPRITE_PATH = path.join(__dirname, '../../user-app/public/assets/fish-sprites/salmon-swim.png');
const FRAME_COUNT = 8;

async function checkDimensions() {
  try {
    const metadata = await sharp(SPRITE_PATH).metadata();
    console.log(`\n📏 Sprite Image Dimensions:`);
    console.log(`   File: salmon-swim.png`);
    console.log(`   Total Width: ${metadata.width}px`);
    console.log(`   Height: ${metadata.height}px`);
    console.log(`   Format: ${metadata.format}`);

    const frameWidth = Math.floor(metadata.width / FRAME_COUNT);
    console.log(`\n🎬 Animation Configuration:`);
    console.log(`   Frame Count: ${FRAME_COUNT}`);
    console.log(`   Individual Frame Width: ${frameWidth}px`);
    console.log(`   Individual Frame Height: ${metadata.height}px`);

    console.log(`\n📝 Use these values in Fish Management Admin Panel:`);
    console.log(`   Game Sprite URL: /assets/fish-sprites/salmon-swim.png`);
    console.log(`   Sprite Frames: ${FRAME_COUNT}`);
    console.log(`   Sprite Width: ${frameWidth}`);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkDimensions();
