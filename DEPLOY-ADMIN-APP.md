# Deploy Admin App to EC2 - Fish Management Fix

## 🎯 Issue
The Fish Management page at `http://16.16.154.49/admin/fish` is not working because the admin app on EC2 hasn't been rebuilt with the latest code.

## 📦 What Needs to be Deployed

The admin app has these new features that need to be deployed:
- ✅ Fish Management page (`/fish` route)
- ✅ Sprite image management
- ✅ Game settings configuration

## 🚀 EC2 Deployment Commands

### Quick Commands (Copy and Run):

```bash
# 1. SSH into EC2
ssh -i your-key.pem ubuntu@16.16.154.49

# 2. Navigate to project
cd /var/www/food-delivery

# 3. Pull latest code
git pull origin main

# 4. Rebuild admin app
cd admin-app
npm install
npm run build

# 5. Reload Nginx
sudo nginx -t && sudo systemctl reload nginx

# Done! Test at http://16.16.154.49/admin/fish
```

---

## 📋 Step-by-Step Instructions

### Step 1: SSH into EC2
```bash
ssh -i your-key.pem ubuntu@16.16.154.49
```

### Step 2: Backup current admin app (optional but recommended)
```bash
sudo cp -r /var/www/food-delivery/admin-app/dist /var/www/food-delivery/admin-app/dist-backup-$(date +%Y%m%d-%H%M%S)
```

### Step 3: Navigate to project and pull code
```bash
cd /var/www/food-delivery
git pull origin main
```

You should see:
```
Updating...
 admin-app/src/pages/FishManagement.jsx
 admin-app/src/App.jsx
 ...
```

### Step 4: Check that Fish Management exists
```bash
ls -la admin-app/src/pages/FishManagement.jsx
```

Should show the file exists.

### Step 5: Install admin app dependencies
```bash
cd admin-app
npm install
```

### Step 6: Build admin app
```bash
# Fix permissions if needed
chmod +x node_modules/.bin/vite

# Build the admin app
npm run build
```

Wait for build to complete. You should see:
```
✓ built in XXs
```

### Step 7: Verify build output
```bash
ls -la dist/
```

Should show `index.html` and `assets/` directory.

### Step 8: Test and reload Nginx
```bash
sudo nginx -t
```

If test passes:
```bash
sudo systemctl reload nginx
```

### Step 9: Check Nginx status
```bash
sudo systemctl status nginx
```

Should show "active (running)".

---

## 🧪 Testing the Deployment

1. **Clear browser cache**: Press `Ctrl + Shift + R`

2. **Login to admin panel**: http://16.16.154.49/admin

3. **Navigate to Fish Management**:
   - Click on "Fish Management" in the navbar
   - OR directly visit: http://16.16.154.49/admin/fish

4. **You should see**:
   - Fish Management page with list of fish
   - "Add New Fish" button
   - Game Settings button
   - Fish items in a grid layout

---

## ⚡ Single Command Deploy (All-in-One)

After SSH, run this single command:

```bash
cd /var/www/food-delivery && git pull origin main && cd admin-app && npm install && npm run build && sudo nginx -t && sudo systemctl reload nginx && echo "✅ Admin app deployed!"
```

---

## 🐛 Troubleshooting

### Issue: Still showing 404 at /admin/fish

**Cause**: Browser cache or old service worker

**Fix**:
```bash
# Hard refresh browser
Ctrl + Shift + R  (Chrome/Edge)
Ctrl + F5         (Firefox)

# Or open in incognito/private window
Ctrl + Shift + N  (Chrome)
Ctrl + Shift + P  (Firefox)
```

### Issue: Build fails with memory error

**Cause**: Not enough memory on EC2 instance

**Fix**: Add swap space
```bash
# Create 2GB swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make it permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Retry build
cd /var/www/food-delivery/admin-app
npm run build
```

### Issue: Build fails with "vite: command not found"

**Cause**: Permissions issue

**Fix**:
```bash
cd /var/www/food-delivery/admin-app
chmod +x node_modules/.bin/vite
npm run build
```

### Issue: Nginx test fails

**Cause**: Configuration error

**Fix**:
```bash
# Check error details
sudo nginx -t

# View error log
sudo tail -f /var/log/nginx/error.log

# Restart nginx if needed
sudo systemctl restart nginx
```

### Issue: Page loads but API calls fail

**Cause**: Backend not updated or not running

**Fix**:
```bash
# Check backend status
pm2 status food-delivery-backend

# Restart backend
pm2 restart food-delivery-backend

# Check logs
pm2 logs food-delivery-backend --lines 50
```

---

## 🔄 Rollback (If Something Goes Wrong)

If the deployment causes issues:

```bash
# Find your backup
ls -la /var/www/food-delivery/admin-app/ | grep dist-backup

# Restore backup (replace TIMESTAMP)
cd /var/www/food-delivery/admin-app
rm -rf dist
mv dist-backup-TIMESTAMP dist

# Reload Nginx
sudo systemctl reload nginx
```

---

## 📝 What's Being Deployed

### New Admin App Features:

1. **Fish Management Page** (`/fish`)
   - Full CRUD operations for fish items
   - Image upload for fish photos
   - Sprite sheet management for game animations
   - Species selection
   - Price per kg management
   - Stock tracking
   - Min/Max weight settings

2. **Game Settings**
   - Enable/disable fishing game
   - Configure game parameters
   - Manage game appearance

3. **Enhanced Navigation**
   - New "Fish Management" menu item
   - Improved routing

---

## 🎉 After Successful Deployment

You'll be able to:
- ✅ Access Fish Management at http://16.16.154.49/admin/fish
- ✅ Add, edit, and delete fish items
- ✅ Upload fish images and sprite sheets
- ✅ Configure game settings
- ✅ Manage fish inventory and pricing

---

## 📊 Deployment Checklist

- [ ] SSH into EC2 server
- [ ] Navigate to project directory
- [ ] Pull latest code from GitHub
- [ ] Verify FishManagement.jsx exists
- [ ] Install dependencies
- [ ] Build admin app successfully
- [ ] Verify dist/ directory created
- [ ] Test Nginx configuration
- [ ] Reload Nginx
- [ ] Clear browser cache
- [ ] Login to admin panel
- [ ] Navigate to /admin/fish
- [ ] Verify Fish Management page loads
- [ ] Test adding a fish item

---

## ⏱️ Estimated Time

- Pull code: 10 seconds
- Install dependencies: 30 seconds
- Build admin app: 2-3 minutes
- Reload Nginx: 5 seconds
- **Total: ~4 minutes**

---

## 📞 Need Help?

**Check logs:**
```bash
# Nginx error log
sudo tail -f /var/log/nginx/error.log

# Nginx access log
sudo tail -f /var/log/nginx/access.log

# Backend logs (if API issues)
pm2 logs food-delivery-backend
```

**Verify deployment:**
```bash
# Check admin app dist exists
ls -la /var/www/food-delivery/admin-app/dist/

# Check Nginx is serving correct files
curl -I http://localhost/admin/

# Check routing works
curl http://localhost/admin/fish
```

---

**Current EC2 IP:** 16.16.154.49
**Admin Panel:** http://16.16.154.49/admin
**Fish Management:** http://16.16.154.49/admin/fish

**GitHub Repo:** https://github.com/rabeeh20/food-cart
