# Fix Admin App Routing Issue on EC2

## 🐛 Problem
When accessing admin app at `http://16.16.154.49/admin/orders` and refreshing the page, it redirects to `http://16.16.154.49/orders` (user app).

## 🔍 Root Cause
1. Admin app was built without a `base` path in Vite config
2. When served from `/admin/` subdirectory, React Router doesn't handle refreshes correctly
3. Nginx configuration needs to properly serve admin app for all `/admin/*` routes

## ✅ Solution
The fix involves:
1. Adding `base: '/admin/'` to admin app's vite.config.js
2. Rebuilding the admin app with correct base path
3. Using correct Nginx configuration

## 🚀 EC2 Deployment Steps

### Step 1: SSH into EC2
```bash
ssh -i your-key.pem ubuntu@16.16.154.49
```

### Step 2: Pull Latest Code
```bash
cd /var/www/food-delivery
git pull origin main
```

You should see:
```
Updating e0680c9..605954b
 admin-app/vite.config.js  | 1 +
 nginx-ip-simple.conf      | 60 +++++++++++++++++++++++++++++++++++++++
```

### Step 3: Verify the Fix
```bash
# Check vite.config.js has base path
cat admin-app/vite.config.js | grep base
```

Should show: `base: '/admin/',`

### Step 4: Rebuild Admin App
```bash
cd /var/www/food-delivery/admin-app

# Install dependencies (if any new ones)
npm install

# Build with new base path
npm run build
```

Wait for build to complete (~2-3 minutes).

### Step 5: Update Nginx Configuration
```bash
# Backup current nginx config
sudo cp /etc/nginx/sites-available/food-delivery /etc/nginx/sites-available/food-delivery.backup

# Copy new configuration
sudo cp /var/www/food-delivery/nginx-ip-simple.conf /etc/nginx/sites-available/food-delivery

# Test nginx configuration
sudo nginx -t
```

Should show: `syntax is ok` and `test is successful`

### Step 6: Reload Nginx
```bash
sudo systemctl reload nginx
```

### Step 7: Verify Nginx is Running
```bash
sudo systemctl status nginx
```

Should show `active (running)`.

---

## 🧪 Testing the Fix

1. **Clear browser cache**: Press `Ctrl + Shift + R`

2. **Test admin login**: http://16.16.154.49/admin

3. **Navigate to orders**: Click "Orders" in navbar
   - URL should be: http://16.16.154.49/admin/orders

4. **Refresh the page**: Press `F5` or `Ctrl + R`
   - ✅ Should stay at: http://16.16.154.49/admin/orders
   - ❌ Should NOT redirect to: http://16.16.154.49/orders

5. **Test Fish Management**: Click "Fish Management"
   - URL should be: http://16.16.154.49/admin/fish
   - Refresh should keep you on same page

6. **Test all admin routes**:
   - http://16.16.154.49/admin/dashboard - Works ✅
   - http://16.16.154.49/admin/orders - Works ✅
   - http://16.16.154.49/admin/menu - Works ✅
   - http://16.16.154.49/admin/fish - Works ✅

---

## ⚡ Quick Deploy (One Command)

After SSH:
```bash
cd /var/www/food-delivery && \
git pull origin main && \
cd admin-app && \
npm install && \
npm run build && \
cd .. && \
sudo cp nginx-ip-simple.conf /etc/nginx/sites-available/food-delivery && \
sudo nginx -t && \
sudo systemctl reload nginx && \
echo "✅ Admin app routing fixed!"
```

---

## 🐛 Troubleshooting

### Issue: Admin page shows 404 after update

**Fix**: Clear browser cache completely
```bash
# In browser
Ctrl + Shift + Delete

# Select "Cached images and files"
# Click "Clear data"

# Then hard refresh
Ctrl + Shift + R
```

### Issue: Build fails with EACCES permission error

**Fix**: Fix node_modules permissions
```bash
cd /var/www/food-delivery/admin-app
sudo chown -R $USER:$USER node_modules
chmod +x node_modules/.bin/vite
npm run build
```

### Issue: Nginx test fails

**Fix**: Check nginx config syntax
```bash
# View nginx error
sudo nginx -t

# Check error log
sudo tail -f /var/log/nginx/error.log

# Restore backup if needed
sudo cp /etc/nginx/sites-available/food-delivery.backup /etc/nginx/sites-available/food-delivery
sudo nginx -t && sudo systemctl reload nginx
```

### Issue: Still redirecting after all steps

**Causes**:
1. Browser cache
2. Service worker cache
3. Old build not replaced

**Fixes**:
```bash
# 1. Open in incognito/private window
Ctrl + Shift + N (Chrome)
Ctrl + Shift + P (Firefox)

# 2. Clear service worker (in browser DevTools):
# F12 > Application > Service Workers > Unregister

# 3. Verify build has correct base path:
cd /var/www/food-delivery/admin-app
cat dist/index.html | grep '<script'
# Should show: src="/admin/assets/..."

# 4. If paths are wrong, rebuild:
npm run build
sudo systemctl reload nginx
```

---

## 📝 What Changed

### 1. admin-app/vite.config.js
```diff
export default defineConfig({
  plugins: [react()],
+ base: '/admin/',  // Set base path for deployment
  server: {
    port: 5174,
```

### 2. Nginx Configuration (nginx-ip-simple.conf)
```nginx
# Admin app with React Router support
location /admin {
    alias /var/www/food-delivery/admin-app/dist;
    try_files $uri $uri/ /admin/index.html;
    index index.html;
}
```

The key changes:
- ✅ `base: '/admin/'` tells Vite to build assets with correct paths
- ✅ `try_files $uri $uri/ /admin/index.html` ensures React Router works on refresh
- ✅ All admin assets load from `/admin/assets/` correctly

---

## 🔄 Rollback (If Needed)

If something goes wrong:

```bash
# 1. Restore nginx config
sudo cp /etc/nginx/sites-available/food-delivery.backup /etc/nginx/sites-available/food-delivery
sudo systemctl reload nginx

# 2. Restore previous admin build
cd /var/www/food-delivery
git log --oneline -5  # Find previous commit
git checkout e0680c9  # Replace with previous commit hash
cd admin-app
npm run build
sudo systemctl reload nginx

# 3. Return to latest
git checkout main
```

---

## ✅ Verification Checklist

After deployment:
- [ ] Admin login works at /admin
- [ ] Can navigate to /admin/orders
- [ ] Refreshing /admin/orders stays on same page
- [ ] Can navigate to /admin/fish
- [ ] Refreshing /admin/fish stays on same page
- [ ] All admin routes work with refresh
- [ ] Assets load correctly (no 404s in browser console)
- [ ] User app still works at /
- [ ] User app routes still work (/, /menu, /cart, /orders)

---

## 🎉 Expected Result

**Before Fix**:
- Visit: http://16.16.154.49/admin/orders
- Press F5 (refresh)
- ❌ Redirects to: http://16.16.154.49/orders (user app)

**After Fix**:
- Visit: http://16.16.154.49/admin/orders
- Press F5 (refresh)
- ✅ Stays at: http://16.16.154.49/admin/orders (admin app)

---

## 📊 Technical Details

### Why This Happens

React Router uses client-side routing. When you refresh a page:
1. Browser makes request to server: GET /admin/orders
2. Nginx needs to serve `/admin/index.html` (not /orders)
3. React Router then handles the /orders route internally

### Without Base Path:
- Admin app builds with assets at: `/assets/index-abc123.js`
- When served from `/admin/`, browser looks for: `http://16.16.154.49/assets/...`
- ❌ Should look for: `http://16.16.154.49/admin/assets/...`

### With Base Path:
- Admin app builds with assets at: `/admin/assets/index-abc123.js`
- When served from `/admin/`, browser looks for: `http://16.16.154.49/admin/assets/...`
- ✅ Correct path!

---

## 📞 Still Having Issues?

**Check logs:**
```bash
# Nginx access log
sudo tail -f /var/log/nginx/access.log

# Nginx error log
sudo tail -f /var/log/nginx/error.log

# Check what files nginx is serving
sudo tail -f /var/log/nginx/access.log | grep admin
```

**Verify admin build:**
```bash
cd /var/www/food-delivery/admin-app
ls -la dist/
cat dist/index.html | head -20
```

**Test nginx config:**
```bash
# Check if admin location is configured
sudo nginx -T | grep -A 10 "location /admin"
```

---

**Current EC2 IP:** 16.16.154.49
**Admin Panel:** http://16.16.154.49/admin
**GitHub Repo:** https://github.com/rabeeh20/food-cart
**Latest Commit:** 605954b - fix admin routing

---

**Deployment Time:** ~5 minutes
**Downtime:** None

After this fix, all admin routes will work correctly with page refreshes! 🎉
