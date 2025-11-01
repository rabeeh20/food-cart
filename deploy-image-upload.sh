#!/bin/bash

# ================================================================
# Food Cart - Image Upload Feature Deployment Script
# ================================================================
# This script deploys the Cloudinary image upload feature to EC2
#
# Usage:
# 1. Copy this file to your EC2 server
# 2. Make it executable: chmod +x deploy-image-upload.sh
# 3. Run it: ./deploy-image-upload.sh
# ================================================================

set -e  # Exit on any error

echo "=================================================="
echo "  Food Cart - Image Upload Deployment"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/var/www/food-delivery"
GITHUB_REPO="https://github.com/rabeeh20/food-cart.git"
BACKUP_DIR="/var/www/food-delivery-backup-$(date +%Y%m%d-%H%M%S)"

# Step 1: Backup current deployment
echo -e "${BLUE}[1/8] Creating backup...${NC}"
if [ -d "$PROJECT_DIR" ]; then
    sudo cp -r "$PROJECT_DIR" "$BACKUP_DIR"
    echo -e "${GREEN}✓ Backup created at: $BACKUP_DIR${NC}"
else
    echo -e "${RED}✗ Project directory not found: $PROJECT_DIR${NC}"
    exit 1
fi
echo ""

# Step 2: Pull latest code from GitHub
echo -e "${BLUE}[2/8] Pulling latest code from GitHub...${NC}"
cd "$PROJECT_DIR"
git fetch origin
git pull origin main
echo -e "${GREEN}✓ Code updated from GitHub${NC}"
echo ""

# Step 3: Install backend dependencies
echo -e "${BLUE}[3/8] Installing backend dependencies...${NC}"
cd "$PROJECT_DIR/backend"
npm install
echo -e "${GREEN}✓ Backend dependencies installed${NC}"
echo ""

# Step 4: Check Cloudinary credentials
echo -e "${BLUE}[4/8] Checking Cloudinary credentials...${NC}"
if grep -q "CLOUDINARY_CLOUD_NAME" "$PROJECT_DIR/backend/.env"; then
    echo -e "${GREEN}✓ Cloudinary credentials found in .env${NC}"
else
    echo -e "${YELLOW}⚠ Cloudinary credentials NOT found in .env${NC}"
    echo -e "${YELLOW}  Please add these lines to backend/.env:${NC}"
    echo ""
    echo "  CLOUDINARY_CLOUD_NAME=your_cloud_name"
    echo "  CLOUDINARY_API_KEY=your_api_key"
    echo "  CLOUDINARY_API_SECRET=your_api_secret"
    echo ""
    read -p "Press Enter after you've added the credentials, or Ctrl+C to exit..."
fi
echo ""

# Step 5: Restart backend
echo -e "${BLUE}[5/8] Restarting backend...${NC}"
pm2 restart food-delivery-backend
sleep 3
pm2 status food-delivery-backend
echo -e "${GREEN}✓ Backend restarted${NC}"
echo ""

# Step 6: Rebuild admin app
echo -e "${BLUE}[6/8] Building admin app...${NC}"
cd "$PROJECT_DIR/admin-app"
chmod +x node_modules/.bin/vite 2>/dev/null || true
npm run build
if [ -d "dist" ]; then
    echo -e "${GREEN}✓ Admin app built successfully${NC}"
else
    echo -e "${RED}✗ Admin app build failed${NC}"
    exit 1
fi
echo ""

# Step 7: Rebuild user app
echo -e "${BLUE}[7/8] Building user app...${NC}"
cd "$PROJECT_DIR/user-app"
chmod +x node_modules/.bin/vite 2>/dev/null || true
npm run build
if [ -d "dist" ]; then
    echo -e "${GREEN}✓ User app built successfully${NC}"
else
    echo -e "${RED}✗ User app build failed${NC}"
    exit 1
fi
echo ""

# Step 8: Reload Nginx
echo -e "${BLUE}[8/8] Reloading Nginx...${NC}"
sudo nginx -t
if [ $? -eq 0 ]; then
    sudo systemctl reload nginx
    echo -e "${GREEN}✓ Nginx reloaded successfully${NC}"
else
    echo -e "${RED}✗ Nginx configuration test failed${NC}"
    exit 1
fi
echo ""

# Step 9: Verify deployment
echo -e "${BLUE}Verifying deployment...${NC}"
echo ""
echo -e "${GREEN}✓ Backend logs (last 20 lines):${NC}"
pm2 logs food-delivery-backend --lines 20 --nostream
echo ""

echo "=================================================="
echo -e "${GREEN}  ✓ Deployment Complete!${NC}"
echo "=================================================="
echo ""
echo "Next steps:"
echo "1. Open admin panel: http://16.16.154.49/admin"
echo "2. Go to Menu Management"
echo "3. Click 'Add New Item' or 'Edit' existing item"
echo "4. You should now see FILE UPLOAD instead of URL input"
echo "5. Test uploading an image!"
echo ""
echo "If you need to rollback:"
echo "  sudo rm -rf $PROJECT_DIR"
echo "  sudo mv $BACKUP_DIR $PROJECT_DIR"
echo "  pm2 restart food-delivery-backend"
echo "  sudo systemctl reload nginx"
echo ""
echo -e "${YELLOW}Don't forget to add Cloudinary credentials to backend/.env!${NC}"
echo "=================================================="
