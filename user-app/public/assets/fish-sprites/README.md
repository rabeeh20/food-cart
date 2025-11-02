# Fish Sprites for Fishing Game

This folder contains animated fish sprite sheets for the fishing game.

## How to Add Sprites

1. **Download Free Sprite Packs:**
   - CraftPix Free Fishing Pack: https://craftpix.net/freebies/free-fishing-game-assets-pixel-art-pack/
   - Kenney Fish Pack: https://opengameart.org/content/fish-pack-0

2. **Sprite Sheet Format:**
   - Horizontal sprite sheet (all frames in one row)
   - Example: 8 frames × 64px = 512px total width
   - Each frame should be square (64x64px recommended)
   - Transparent background (PNG format)

3. **Naming Convention:**
   - Use lowercase with hyphens
   - Examples: `salmon-swim.png`, `tuna-swim.png`, `kingfish-swim.png`

4. **Upload via Admin Panel:**
   - Go to Fish Management
   - When creating/editing fish:
     - Upload fish photo (for cart display)
     - Upload game sprite (for fishing game)
     - Set number of frames (e.g., 8)
     - Set frame width (e.g., 64)

## Temporary Placeholders

Until you upload custom sprites, the game will use the regular fish photos.
For best results, use animated sprite sheets with 6-12 frames.

## Example Sprite Sheet Structure

```
salmon-swim.png (512px × 64px, 8 frames)
┌──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┐
│ F1   │ F2   │ F3   │ F4   │ F5   │ F6   │ F7   │ F8   │
│ 64px │ 64px │ 64px │ 64px │ 64px │ 64px │ 64px │ 64px │
└──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┘
```

Each frame (F1-F8) shows a different position in the swimming animation.
