# Image Upload Feature - Deployment Guide

## 📋 Overview
The menu management now uses **Cloudinary** for image uploads instead of requiring URL input. This guide will help you deploy these changes to your EC2 server from GitHub.

---

## 🎯 What Changed

### Backend Files (New/Modified):
- ✨ **`backend/config/cloudinary.js`** (NEW) - Cloudinary SDK configuration
- ✨ **`backend/middleware/upload.js`** (NEW) - Multer file upload middleware
- 🔧 **`backend/routes/menu.js`** (MODIFIED) - Added POST /upload-image endpoint

### Frontend Files (Modified):
- 🔧 **`admin-app/src/pages/MenuManagement.jsx`** - Replaced URL input with file upload
- 🔧 **`admin-app/src/pages/MenuManagement.css`** - Added styles for image upload UI

---

## 🚀 Deployment Steps

### Step 1: Create Cloudinary Account (Free Tier)

1. Go to [Cloudinary Sign Up](https://cloudinary.com/users/register_free)
2. Sign up for a free account (no credit card required)
3. After signup, go to **Dashboard**
4. Note down your account details:
   - **Cloud Name**: e.g., `dxxxxxxx`
   - **API Key**: e.g., `123456789012345`
   - **API Secret**: e.g., `abcdefghijklmnopqrstuvwxyz12`

**Free Tier Includes:**
- ✅ 25 GB storage
- ✅ 25 GB bandwidth per month
- ✅ Unlimited image transformations
- ✅ Perfect for small to medium food delivery apps!

---

### Step 2: Push Code to GitHub

From your local computer:

```bash
# Navigate to project directory
cd c:\Users\pcrab\OneDrive\Desktop\food-cart

# Add all changes
git add .

# Commit with descriptive message
git commit -m "Add Cloudinary image upload for menu management

- Add Cloudinary configuration and upload middleware
- Replace URL input with file upload in admin panel
- Add image preview and validation
- Auto-optimize images (resize, quality, format)"

# Push to GitHub
git push origin main
```

---

### Step 3: Pull Changes on EC2 Server

SSH into your EC2 server:

```bash
ssh -i your-key.pem ubuntu@13.49.102.67
cd /var/www/food-delivery
```

Pull the latest changes from GitHub:

```bash
# Backup current code (optional but recommended)
sudo cp -r /var/www/food-delivery /var/www/food-delivery-backup-$(date +%Y%m%d)

# Pull latest code
git pull origin main
```

---

### Step 4: Configure Cloudinary Credentials

Add Cloudinary credentials to your backend environment file:

```bash
cd /var/www/food-delivery/backend
nano .env
```

Add these lines (replace with your actual Cloudinary credentials from Step 1):

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Example:**
```env
CLOUDINARY_CLOUD_NAME=dfz5x2abc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz12
```

Save and exit: `Ctrl+X`, then `Y`, then `Enter`

---

### Step 5: Install Dependencies (if needed)

The packages `cloudinary` and `multer` should already be in `package.json`. Verify installation:

```bash
cd /var/www/food-delivery/backend
npm install
```

This will install any missing dependencies.

---

### Step 6: Restart Backend

```bash
# Restart the backend service
pm2 restart food-delivery-backend

# Check logs for errors
pm2 logs food-delivery-backend --lines 50
```

**What to look for:**
- ✅ "Server running on port 5000" or similar
- ✅ "MongoDB connected successfully"
- ❌ Any errors related to Cloudinary or missing modules

---

### Step 7: Rebuild Admin App

```bash
cd /var/www/food-delivery/admin-app

# Fix permissions if needed
chmod +x node_modules/.bin/vite

# Build the app
npm run build
```

**Expected output:**
```
vite v4.x.x building for production...
✓ built in Xs
```

---

### Step 8: Rebuild User App (Hamburger Menu Fix)

Since we also fixed the hamburger menu in the user app, rebuild it too:

```bash
cd /var/www/food-delivery/user-app

# Fix permissions if needed
chmod +x node_modules/.bin/vite

# Build the app
npm run build
```

---

### Step 9: Reload Nginx

```bash
# Test Nginx configuration
sudo nginx -t

# If test passes, reload
sudo systemctl reload nginx
```

---

### Step 10: Test the Feature 🎉

1. Open your admin panel: `http://13.49.102.67/admin`
2. Login as Super Admin
3. Go to **Menu Management**
4. Click **"Add New Item"** or **Edit** an existing item
5. You should now see:
   - ✅ File input instead of URL input
   - ✅ Help text: "Max size: 5MB. Formats: JPG, PNG, GIF, WEBP"
   - ✅ Image preview after selecting file
   - ✅ "Remove Image" button
   - ✅ "Uploading image..." status during upload

6. Try adding a new menu item with an image:
   - Select an image from your computer
   - Preview should appear immediately
   - Click **"Add Item"**
   - Image uploads to Cloudinary first
   - Then menu item is created with Cloudinary URL
   - Success toast should appear
   - Image should display in the menu grid

---

## 🔄 How It Works

```
User selects image
      ↓
Frontend validates (type, size < 5MB)
      ↓
Frontend shows preview (FileReader)
      ↓
User clicks "Add/Update Item"
      ↓
Frontend uploads image to Backend
POST /api/menu/upload-image
      ↓
Backend (Multer) receives file as Buffer
      ↓
Backend uploads Buffer to Cloudinary
      ↓
Cloudinary processes & optimizes:
  • Resize to max 800x600
  • Auto quality optimization
  • Auto format conversion (WebP for modern browsers)
      ↓
Cloudinary returns secure_url
      ↓
Frontend receives imageUrl
      ↓
Frontend submits menu item with Cloudinary URL
      ↓
Backend saves menu item to MongoDB
      ↓
Image served from Cloudinary CDN worldwide ⚡
```

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| **No Manual URLs** | Admins just click and select files |
| **Auto Validation** | Type checking (images only) and size limit (5MB) |
| **Live Preview** | See image before uploading |
| **Auto Optimization** | Cloudinary resizes (800x600 max), optimizes quality |
| **Format Conversion** | Auto-converts to best format (WebP, JPEG, etc.) |
| **CDN Delivery** | Images served from global CDN (fast worldwide) |
| **Free Tier** | 25 GB storage, 25 GB bandwidth/month |
| **Organized Storage** | Images in `food-delivery/menu-items/` folder |

---

## 🐛 Troubleshooting

### Backend Issues

#### Error: "Cannot find module 'cloudinary'"
```bash
cd /var/www/food-delivery/backend
npm install cloudinary multer
pm2 restart food-delivery-backend
```

#### Error: "Invalid cloud_name" or "Must supply api_key"
- Check `.env` file has correct credentials
- Ensure no extra spaces in `.env` values
- Restart backend: `pm2 restart food-delivery-backend`

#### Error: "Upload failed" or 500 Server Error
```bash
# Check backend logs
pm2 logs food-delivery-backend --lines 100

# Look for Cloudinary errors
pm2 logs food-delivery-backend | grep -i cloudinary
```

---

### Frontend Issues

#### File input not showing
```bash
# Verify files were pulled correctly
cd /var/www/food-delivery/admin-app
git status
git log -1

# Rebuild admin app
npm run build
```

#### Upload fails with 401 Unauthorized
- Admin token expired - logout and login again
- Check browser console for errors
- Verify Super Admin permissions

#### Image preview not working
- Check browser console for JavaScript errors
- Ensure MenuManagement.jsx was updated correctly
- Hard refresh browser: `Ctrl+Shift+R` (Chrome) or `Ctrl+F5` (Firefox)

---

### Git Issues

#### Merge conflicts during git pull
```bash
# Stash local changes
git stash

# Pull changes
git pull origin main

# Re-apply your changes
git stash pop

# Resolve conflicts manually if needed
```

#### Accidentally edited files on server
```bash
# Discard local changes on server
git reset --hard HEAD

# Pull fresh copy
git pull origin main
```

---

## 📊 Monitoring

### Check Backend Status
```bash
pm2 status
pm2 logs food-delivery-backend --lines 50
```

### Check Nginx Status
```bash
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### Check Disk Space (for logs)
```bash
df -h
```

---

## 🔒 Security Notes

1. **Never commit `.env` files** to GitHub
   - Already in `.gitignore`
   - Cloudinary credentials are sensitive

2. **Cloudinary credentials** should only be in:
   - `/var/www/food-delivery/backend/.env` on EC2
   - NOT in frontend code
   - NOT in GitHub

3. **File upload security**:
   - ✅ File type validation (images only)
   - ✅ File size limit (5MB)
   - ✅ Super Admin only permission
   - ✅ Multer memory storage (no temp files)

---

## 🎨 Optional: Customize Image Settings

Edit `backend/routes/menu.js` line ~82 to change Cloudinary transformations:

```javascript
transformation: [
  { width: 1200, height: 900, crop: 'limit' },  // Larger images
  { quality: 'auto:best' },                      // Best quality
  { fetch_format: 'auto' }                       // Auto format
]
```

**Crop modes:**
- `limit` - Resize only if larger
- `fill` - Resize and crop to exact dimensions
- `fit` - Resize to fit within dimensions
- `scale` - Resize ignoring aspect ratio

---

## 🗑️ Optional: Auto-Delete Old Images

To delete images from Cloudinary when menu items are deleted, modify `backend/routes/menu.js`:

```javascript
router.delete('/:id', verifySuperAdmin, async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Extract public_id from Cloudinary URL
    if (menuItem.image && menuItem.image.includes('cloudinary.com')) {
      const urlParts = menuItem.image.split('/');
      const publicIdWithExt = urlParts.slice(urlParts.indexOf('food-delivery')).join('/');
      const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');

      // Delete from Cloudinary
      try {
        await cloudinary.uploader.destroy(publicId);
        console.log(`Deleted image from Cloudinary: ${publicId}`);
      } catch (cloudinaryError) {
        console.error('Failed to delete from Cloudinary:', cloudinaryError);
        // Continue with menu item deletion even if Cloudinary delete fails
      }
    }

    await MenuItem.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});
```

---

## 📝 Rollback Plan (If Something Goes Wrong)

If deployment causes issues, you can quickly rollback:

```bash
# Stop current version
pm2 stop food-delivery-backend

# Restore backup
sudo rm -rf /var/www/food-delivery
sudo mv /var/www/food-delivery-backup-YYYYMMDD /var/www/food-delivery

# Restart services
pm2 restart food-delivery-backend
sudo systemctl reload nginx
```

---

## 📚 Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Multer Documentation](https://github.com/expressjs/multer)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

## ✅ Deployment Checklist

- [ ] Created Cloudinary account
- [ ] Noted Cloud Name, API Key, API Secret
- [ ] Committed code to GitHub
- [ ] Pushed to GitHub (`git push origin main`)
- [ ] SSH'd into EC2 server
- [ ] Backed up current code (optional)
- [ ] Pulled latest code (`git pull origin main`)
- [ ] Added Cloudinary credentials to `backend/.env`
- [ ] Installed dependencies (`npm install`)
- [ ] Restarted backend (`pm2 restart food-delivery-backend`)
- [ ] Checked backend logs (no errors)
- [ ] Rebuilt admin app (`npm run build`)
- [ ] Rebuilt user app (`npm run build`)
- [ ] Reloaded Nginx (`sudo systemctl reload nginx`)
- [ ] Tested image upload in admin panel
- [ ] Verified images display correctly
- [ ] Tested hamburger menu on mobile (user app)

---

## 🎉 Success!

You've successfully upgraded from manual URL input to professional image uploads with Cloudinary!

Your admins can now:
- ✅ Simply click and select images
- ✅ See previews before uploading
- ✅ Have images automatically optimized and resized
- ✅ Benefit from fast CDN delivery worldwide

All for **FREE** with Cloudinary's generous free tier! 🚀

---

**Questions or Issues?**
- Check PM2 logs: `pm2 logs food-delivery-backend`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Review this guide's Troubleshooting section
- Verify Cloudinary dashboard for uploaded images

**Pro Tip:** You can view all uploaded images in your Cloudinary dashboard under Media Library → `food-delivery/menu-items/`
