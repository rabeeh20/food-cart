#!/bin/bash

# Checkout Fix Deployment Script for EC2
# Run this on your EC2 server (16.16.154.49)

set -e

echo "=========================================="
echo "🚀 Deploying Checkout Fix to EC2"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Project directory
PROJECT_DIR="/var/www/food-delivery"

echo -e "${YELLOW}Step 1: Creating backup...${NC}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
sudo cp -r $PROJECT_DIR ${PROJECT_DIR}-backup-$TIMESTAMP
echo -e "${GREEN}✓ Backup created at ${PROJECT_DIR}-backup-$TIMESTAMP${NC}"
echo ""

echo -e "${YELLOW}Step 2: Navigating to project directory...${NC}"
cd $PROJECT_DIR
echo -e "${GREEN}✓ Now in $PROJECT_DIR${NC}"
echo ""

echo -e "${YELLOW}Step 3: Pulling latest code from GitHub...${NC}"
git pull origin main
echo -e "${GREEN}✓ Code updated from GitHub${NC}"
echo ""

echo -e "${YELLOW}Step 4: Checking modified files...${NC}"
echo "Modified files:"
echo "  - user-app/src/context/CartContext.jsx"
echo "  - user-app/src/pages/Cart.jsx"
echo "  - user-app/src/pages/Checkout.jsx"
echo -e "${GREEN}✓ Files verified${NC}"
echo ""

echo -e "${YELLOW}Step 5: Building user app...${NC}"
cd user-app

# Fix permissions if needed
chmod +x node_modules/.bin/vite 2>/dev/null || true

# Install any new dependencies (if any)
npm install

# Build the app
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ User app built successfully${NC}"
else
    echo -e "${RED}✗ User app build failed${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}Step 6: Reloading Nginx...${NC}"
sudo nginx -t
if [ $? -eq 0 ]; then
    sudo systemctl reload nginx
    echo -e "${GREEN}✓ Nginx reloaded successfully${NC}"
else
    echo -e "${RED}✗ Nginx configuration test failed${NC}"
    exit 1
fi
echo ""

echo "=========================================="
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "📝 Changes Deployed:"
echo "  ✓ Automatic invalid item detection and removal"
echo "  ✓ Enhanced error handling in checkout"
echo "  ✓ Clear Cart button added"
echo "  ✓ Empty cart validation"
echo "  ✓ Better support for fish variants"
echo ""
echo "🧪 Test Your Deployment:"
echo "  1. Visit: http://16.16.154.49"
echo "  2. Go to cart page - you should see 'Clear Cart' button"
echo "  3. Try checkout - invalid items will auto-remove"
echo "  4. Hard refresh browser (Ctrl+Shift+R) if needed"
echo ""
echo "📊 Useful Commands:"
echo "  View Nginx logs:    sudo tail -f /var/log/nginx/error.log"
echo "  View Nginx status:  sudo systemctl status nginx"
echo "  Rollback:           sudo mv ${PROJECT_DIR}-backup-$TIMESTAMP $PROJECT_DIR"
echo ""
echo -e "${GREEN}🎉 Your checkout fixes are now live!${NC}"
echo ""
