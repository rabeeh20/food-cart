# Deploy Checkout Fix to EC2

## 🎯 What This Fixes

- ✅ Automatically detects and removes invalid menu items from cart
- ✅ Better error handling with helpful messages
- ✅ Adds "Clear Cart" button for easy cart reset
- ✅ Validates cart before checkout
- ✅ Improved support for fish variants in cart

## 📦 Files Changed

- `user-app/src/context/CartContext.jsx` - Enhanced removeFromCart function
- `user-app/src/pages/Cart.jsx` - Added Clear Cart button
- `user-app/src/pages/Checkout.jsx` - Added invalid item detection

## 🚀 Deployment Methods

### Method 1: Automated Script (Recommended)

**Step 1:** Copy the deployment script to EC2
```bash
scp -i your-key.pem deploy-checkout-fix.sh ubuntu@16.16.154.49:/home/ubuntu/
```

**Step 2:** SSH into EC2 and run the script
```bash
ssh -i your-key.pem ubuntu@16.16.154.49

# Make script executable
chmod +x deploy-checkout-fix.sh

# Run the deployment script
./deploy-checkout-fix.sh
```

The script will:
- ✅ Create backup
- ✅ Pull latest code from GitHub
- ✅ Install dependencies
- ✅ Rebuild user app
- ✅ Reload Nginx

---

### Method 2: Manual Steps

**Step 1:** SSH into your EC2 server
```bash
ssh -i your-key.pem ubuntu@16.16.154.49
```

**Step 2:** Navigate to project and pull latest code
```bash
cd /var/www/food-delivery
git pull origin main
```

**Step 3:** Verify changed files
```bash
ls -la user-app/src/context/CartContext.jsx
ls -la user-app/src/pages/Cart.jsx
ls -la user-app/src/pages/Checkout.jsx
```

All three files should be listed.

**Step 4:** Rebuild user app
```bash
cd /var/www/food-delivery/user-app

# Fix permissions if needed
chmod +x node_modules/.bin/vite

# Install any new dependencies
npm install

# Build
npm run build
```

Wait for build to complete (should say "✓ built in Xs")

**Step 5:** Reload Nginx
```bash
# Test configuration
sudo nginx -t

# If test passes, reload
sudo systemctl reload nginx
```

**Step 6:** Clear browser cache and test
- Press `Ctrl + Shift + R` in your browser (hard refresh)
- Go to http://16.16.154.49/
- Check cart page - you should see "Clear Cart" button
- Try checkout with the invalid item - it should auto-remove

---

## 🔍 Verification Checklist

After deployment, verify:

- [ ] User app loads without errors
- [ ] Cart page shows "Clear Cart" button
- [ ] Clear Cart button works (with confirmation dialog)
- [ ] Checkout detects and removes invalid items
- [ ] Error messages are helpful and clear
- [ ] Empty cart warning displays correctly

---

## 🧪 Testing the Fix

1. **Go to the cart page:**
   - Visit http://16.16.154.49/cart
   - You should see a "Clear Cart" button in the top-right

2. **Test Clear Cart:**
   - Click "Clear Cart" button
   - Confirm in the dialog
   - Cart should be empty

3. **Test Invalid Item Detection:**
   - If you have the invalid item in cart, try checkout
   - System should show error message
   - Invalid item should be auto-removed
   - You can try checkout again with valid items

4. **Test Normal Checkout:**
   - Add valid menu items to cart
   - Proceed to checkout
   - Should work normally

---

## 🐛 Troubleshooting

### User app still shows old version

**Cause:** Browser cached old files

**Fix:**
```bash
# Hard refresh browser
Ctrl + Shift + R  (Chrome/Edge)
Ctrl + F5         (Firefox)

# Or clear browser cache completely
```

### Build fails

**Cause:** Permission issues with vite or node_modules

**Fix:**
```bash
cd /var/www/food-delivery/user-app
chmod +x node_modules/.bin/vite
npm run build
```

### Nginx reload fails

**Cause:** Configuration syntax error

**Fix:**
```bash
# Test configuration
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log
```

---

## 🔄 Rollback (If Something Goes Wrong)

If deployment causes issues:

```bash
# Find your backup
ls -la /var/www/ | grep backup

# Restore backup (replace TIMESTAMP with your backup timestamp)
sudo rm -rf /var/www/food-delivery
sudo mv /var/www/food-delivery-backup-TIMESTAMP /var/www/food-delivery

# Reload Nginx
sudo systemctl reload nginx
```

---

## 📊 What Changed - Technical Details

### CartContext.jsx
```javascript
// Now supports removing specific fish variants
removeFromCart(itemId, variant = null)
```

### Cart.jsx
```javascript
// Added Clear Cart button with confirmation
<button onClick={handleClearCart}>Clear Cart</button>
```

### Checkout.jsx
```javascript
// Auto-detects and removes invalid items
if (errorMessage.includes('Menu item not found')) {
  removeFromCart(invalidId);
  toast.error('Items removed. Please try again.');
}
```

---

## 📝 Important Notes

- ⚠️ **No backend changes** - Only frontend (user-app) needs rebuild
- ⚠️ **No database changes** - Existing data is safe
- ⚠️ **No environment variables** - No .env changes needed
- ✅ **Safe to deploy** - Changes are user-facing only

---

## 🎉 After Successful Deployment

Your users will now have:
- ✅ Automatic invalid item removal from cart
- ✅ Clear error messages when checkout fails
- ✅ Easy cart reset with "Clear Cart" button
- ✅ Better validation before checkout
- ✅ Improved handling of fish variant items

---

## 📞 Need Help?

Check:
- Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Nginx status: `sudo systemctl status nginx`
- User app files: `ls -la /var/www/food-delivery/user-app/dist/`

---

**Current EC2 IP:** 16.16.154.49
**User App:** http://16.16.154.49/
**Admin Panel:** http://16.16.154.49/admin

**GitHub Repo:** https://github.com/rabeeh20/food-cart
**Latest Commit:** `fix: resolve checkout error with invalid menu items`

---

**Deployment Time:** ~3 minutes
**Downtime:** None (zero-downtime deployment)
