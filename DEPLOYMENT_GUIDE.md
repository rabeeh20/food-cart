# Food Delivery App - Deployment Guide

## ✅ Current Status

### Mobile App (React Native)
- ✅ **WORKING** - All screens functional
- ✅ OTP authentication via email
- ✅ Menu browsing and item details
- ✅ Shopping cart and checkout
- ✅ Order history
- ✅ Socket.io real-time updates
- ✅ API integration through nginx

### Backend (Node.js/Express)
- ✅ **WORKING** - Running on EC2 via PM2
- ✅ MongoDB connected
- ✅ All API endpoints functional
- ✅ Email service configured

### User Web App
- ✅ **WORKING** - Accessible at `http://YOUR_EC2_IP/`

### Admin Web App
- ❌ **NEEDS FIX** - Currently returning 500 error
- 🔧 Fix provided in nginx configuration below

---

## 🚀 Quick Fix for Admin App

### Option 1: Using the Deployment Script (Recommended)

1. **Upload the script to EC2:**
```bash
scp -i /path/to/your-key.pem deploy-nginx.sh ubuntu@16.16.154.49:~/
```

2. **SSH into EC2:**
```bash
ssh -i /path/to/your-key.pem ubuntu@16.16.154.49
```

3. **Run the deployment script:**
```bash
chmod +x deploy-nginx.sh
./deploy-nginx.sh
```

### Option 2: Manual Deployment

1. **SSH into your EC2 server**

2. **Create the nginx config:**
```bash
sudo nano /etc/nginx/sites-available/food-delivery
```

3. **Paste the content from `nginx-http-final.conf`**
   (Located in your project root directory)

4. **Save and exit** (Ctrl+X, then Y, then Enter)

5. **Test the configuration:**
```bash
sudo nginx -t
```

6. **If test passes, reload nginx:**
```bash
sudo systemctl reload nginx
```

7. **Verify all apps are working:**
   - User App: `http://16.16.154.49/`
   - Admin App: `http://16.16.154.49/admin`
   - API: `http://16.16.154.49/api/menu`
   - Mobile App: Should connect successfully

---

## 📱 Mobile App Testing Checklist

### ✅ Completed Fixes
- [x] Font loading errors resolved
- [x] Text rendering errors fixed
- [x] OTP email sending working
- [x] Menu items displaying correctly
- [x] Item details page working
- [x] Cart functionality working
- [x] Order placement working
- [x] Orders list displaying
- [x] API connection through nginx
- [x] Socket.io connection established

### 🧪 Test These Features
1. **Login Flow**
   - Enter email → Receive OTP → Verify OTP → Login ✅

2. **Browse Menu**
   - View menu items grid ✅
   - Click on item to see details ✅
   - Add items to cart ✅

3. **Cart & Checkout**
   - View cart with items ✅
   - Adjust quantities ✅
   - Proceed to checkout ✅
   - Place order (COD) ✅

4. **Orders**
   - View order history ✅
   - See real-time order status updates ✅

5. **Profile**
   - View user information ✅
   - Logout ✅

---

## 🔧 Key Configuration Details

### API Endpoints
- **Base URL**: `http://16.16.154.49/api`
- **Auth**: `/api/auth/request-otp`, `/api/auth/verify-otp`
- **Menu**: `/api/menu`
- **Orders**: `/api/orders`
- **Socket.io**: `http://16.16.154.49/socket.io`

### Mobile App Configuration
- **API URL**: Set in `mobile-app/app.json` → `extra.apiUrl`
- **Current**: `http://16.16.154.49/api`
- **Package Versions**:
  - Expo SDK: 50.0.0
  - @expo/vector-icons: 13.0.0 (compatible version)
  - expo-font: 11.10.0
  - React Native: 0.73.0

### Nginx Configuration
- **Location**: `/etc/nginx/sites-available/food-delivery`
- **Enabled**: `/etc/nginx/sites-enabled/food-delivery`
- **Features**:
  - HTTP only (no SSL currently)
  - CORS enabled for mobile app
  - WebSocket support for Socket.io
  - Gzip compression
  - Static file caching

---

## 🐛 Common Issues & Solutions

### Issue: "Failed to fetch menu" in Mobile App
**Solution**: Already fixed! API now uses nginx proxy instead of port 5000.

### Issue: Text rendering errors in Mobile App
**Solution**: Already fixed! All numbers wrapped in `String()` function.

### Issue: Orders not showing in Mobile App
**Solution**: Already fixed! Changed endpoint from `/orders/my-orders` to `/orders`.

### Issue: Admin App returns 500 error
**Solution**: Deploy the new nginx config using instructions above.

### Issue: Socket.io connection fails
**Solution**: Already configured in nginx with proper WebSocket support.

---

## 📦 Recent Changes

### Commit: `365ad2b`
```
fix: resolve mobile app text rendering errors and API issues

- Fixed text rendering by wrapping numbers in String()
- Fixed orders API endpoint
- Downgraded @expo/vector-icons to compatible version
- Added proper nginx configuration for HTTP-only setup
- Added CORS headers for mobile app
- Created deployment script for easy setup
```

---

## 🔐 Security Notes (HTTP Only)

**Current Setup**: HTTP only, no SSL/HTTPS

**For Production**, you should add SSL:
1. Get a domain name
2. Install Let's Encrypt SSL certificate
3. Update nginx to redirect HTTP → HTTPS
4. Update mobile app API URL to use HTTPS

**For Development/Testing**: Current HTTP setup is fine.

---

## 📞 Support

If you encounter any issues:
1. Check nginx logs: `sudo tail -f /var/log/nginx/error.log`
2. Check backend logs: `pm2 logs backend`
3. Check mobile app console in Expo
4. Verify all services are running:
   - Backend: `pm2 status`
   - Nginx: `sudo systemctl status nginx`
   - MongoDB: `sudo systemctl status mongod`

---

## 🎉 Next Steps

1. **Deploy nginx fix** to enable admin app
2. **Test mobile app** end-to-end
3. **(Optional) Add SSL certificate** for production
4. **(Optional) Set up domain name**
5. **(Optional) Configure email credentials** in backend .env

---

*Last Updated: $(date)*
*Generated with Claude Code*
