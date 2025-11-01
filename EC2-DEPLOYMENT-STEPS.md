# EC2 Deployment Steps - Quick Guide

## ✅ Status Check

- ✅ **Local code**: Updated with image upload feature
- ✅ **Git commit**: All changes committed
- ✅ **GitHub**: Code pushed to https://github.com/rabeeh20/food-cart
- ⏳ **EC2 server**: Needs to pull and rebuild

---

## 🚀 Deploy to EC2 (Follow These Steps)

### Method 1: Automated Script (Recommended)

**Step 1:** Copy the deployment script to EC2

From your local computer:
```bash
scp -i your-key.pem deploy-image-upload.sh ubuntu@16.16.154.49:/home/ubuntu/
```

**Step 2:** SSH into EC2 and run the script
```bash
ssh -i your-key.pem ubuntu@16.16.154.49

# Make script executable
chmod +x deploy-image-upload.sh

# Run the deployment script
./deploy-image-upload.sh
```

The script will:
- ✅ Create backup
- ✅ Pull latest code from GitHub
- ✅ Install dependencies
- ✅ Restart backend
- ✅ Rebuild admin app
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

**Step 3:** Verify new files exist
```bash
ls -la backend/config/cloudinary.js
ls -la backend/middleware/upload.js
```

You should see both files listed.

**Step 4:** Add Cloudinary credentials to backend .env

First, create a Cloudinary account if you haven't:
- Go to https://cloudinary.com/users/register_free
- Note down: Cloud Name, API Key, API Secret

Then add credentials:
```bash
nano backend/.env
```

Add these lines at the end:
```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

Save: `Ctrl+X`, then `Y`, then `Enter`

**Step 5:** Install backend dependencies (if needed)
```bash
cd backend
npm install
```

**Step 6:** Restart backend
```bash
pm2 restart food-delivery-backend

# Check logs for errors
pm2 logs food-delivery-backend --lines 20
```

Look for:
- ✅ "Server running on port 5000"
- ✅ "MongoDB connected"
- ❌ Any Cloudinary errors

**Step 7:** Rebuild admin app
```bash
cd /var/www/food-delivery/admin-app

# Fix permissions if needed
chmod +x node_modules/.bin/vite

# Build
npm run build
```

Wait for build to complete (should say "✓ built in Xs")

**Step 8:** Rebuild user app (hamburger menu fix)
```bash
cd /var/www/food-delivery/user-app

# Fix permissions if needed
chmod +x node_modules/.bin/vite

# Build
npm run build
```

**Step 9:** Reload Nginx
```bash
# Test configuration
sudo nginx -t

# If test passes, reload
sudo systemctl reload nginx
```

**Step 10:** Clear browser cache and test
- Press `Ctrl + Shift + R` in your browser (hard refresh)
- Go to http://16.16.154.49/admin
- Login as Super Admin
- Go to Menu Management
- Click "Add New Item"
- You should now see FILE UPLOAD instead of URL input!

---

## 🔍 Verification Checklist

After deployment, verify:

- [ ] Backend is running: `pm2 status food-delivery-backend`
- [ ] No backend errors: `pm2 logs food-delivery-backend --lines 50`
- [ ] Admin app shows file upload (not URL input)
- [ ] Can select image file
- [ ] Image preview shows
- [ ] "Max size: 5MB" help text visible
- [ ] Can upload image successfully
- [ ] Image displays in menu grid
- [ ] User app hamburger menu closes on mobile

---

## 🐛 Troubleshooting

### Admin panel still shows "Image URL" input

**Cause:** Browser cached old files

**Fix:**
```bash
# Hard refresh browser
Ctrl + Shift + R  (Chrome/Edge)
Ctrl + F5         (Firefox)

# Or clear browser cache completely
```

### Upload fails with 401 Unauthorized

**Cause:** Admin token expired

**Fix:** Logout and login again

### Upload fails with 500 Server Error

**Cause:** Missing Cloudinary credentials or invalid

**Fix:**
```bash
# Check backend logs
pm2 logs food-delivery-backend

# Verify .env has correct credentials
cat backend/.env | grep CLOUDINARY

# Restart backend after fixing .env
pm2 restart food-delivery-backend
```

### Backend shows "Cannot find module 'cloudinary'"

**Cause:** Dependencies not installed

**Fix:**
```bash
cd /var/www/food-delivery/backend
npm install cloudinary multer
pm2 restart food-delivery-backend
```

### Admin app build fails

**Cause:** Permission issues with vite

**Fix:**
```bash
cd /var/www/food-delivery/admin-app
chmod +x node_modules/.bin/vite
npm run build
```

---

## 📊 What Changed

### Backend Files (New):
- ✨ `backend/config/cloudinary.js` - Cloudinary SDK configuration
- ✨ `backend/middleware/upload.js` - Multer file upload middleware
- 🔧 `backend/routes/menu.js` - Added POST /upload-image endpoint

### Frontend Files (Modified):
- 🔧 `admin-app/src/pages/MenuManagement.jsx` - File upload UI
- 🔧 `admin-app/src/pages/MenuManagement.css` - Upload styles
- 🔧 `user-app/src/components/Navbar.jsx` - Fixed hamburger menu

### Config Files:
- 🔧 `.gitignore` - Added nul file exclusion

---

## 🎉 After Successful Deployment

Your admin panel will have:
- ✅ File upload button (click to select image)
- ✅ Image preview before upload
- ✅ Validation (images only, max 5MB)
- ✅ "Remove Image" button
- ✅ Upload progress indicator
- ✅ Automatic image optimization
- ✅ Images stored in Cloudinary CDN

### Test the Feature:
1. Go to Menu Management
2. Click "Add New Item"
3. Click file input, select an image
4. Preview should appear
5. Fill in other details (name, price, etc.)
6. Click "Add Item"
7. Image uploads to Cloudinary first
8. Then menu item is created
9. Success toast appears
10. Image displays in menu grid

---

## 🔄 Rollback (If Something Goes Wrong)

If deployment causes issues:

```bash
# Stop backend
pm2 stop food-delivery-backend

# Find your backup
ls -la /var/www/ | grep backup

# Restore backup (replace YYYYMMDD-HHMMSS with your backup timestamp)
sudo rm -rf /var/www/food-delivery
sudo mv /var/www/food-delivery-backup-YYYYMMDD-HHMMSS /var/www/food-delivery

# Restart services
pm2 restart food-delivery-backend
sudo systemctl reload nginx
```

---

## 📞 Need Help?

Check:
- PM2 logs: `pm2 logs food-delivery-backend`
- Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- This guide: [IMAGE-UPLOAD-DEPLOYMENT.md](IMAGE-UPLOAD-DEPLOYMENT.md)

---

**Current EC2 IP:** 16.16.154.49
**Admin Panel:** http://16.16.154.49/admin
**User App:** http://16.16.154.49/

**GitHub Repo:** https://github.com/rabeeh20/food-cart
