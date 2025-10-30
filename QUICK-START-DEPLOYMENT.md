# Quick Start Deployment Guide

Ultra-quick reference for deploying to AWS EC2. For detailed instructions, see [AWS-DEPLOYMENT-GUIDE.md](AWS-DEPLOYMENT-GUIDE.md).

---

## Before You Start

**You Need:**
- AWS account + EC2 instance launched (Ubuntu 22.04, t2.small min)
- Domain name with DNS configured
- SSH access to EC2
- Git repository with your code

**DNS Setup (IMPORTANT!):**
```
yourdomain.com        → EC2_IP
admin.yourdomain.com  → EC2_IP
api.yourdomain.com    → EC2_IP
```

---

## On EC2 Instance - Run These Commands

### 1. Initial Setup (5 minutes)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx, PM2, Git
sudo apt install nginx git -y
sudo npm install -g pm2

# Enable services
sudo systemctl enable nginx
pm2 startup systemd
# Run the command it outputs
```

### 2. Clone & Setup (3 minutes)

```bash
# Clone project
sudo mkdir -p /var/www/food-delivery
sudo chown -R $USER:$USER /var/www/food-delivery
cd /var/www
git clone YOUR_REPO_URL food-delivery
cd food-delivery
```

### 3. Configure Backend (2 minutes)

```bash
cd /var/www/food-delivery/backend

# Create .env from production template
cp .env.production .env
nano .env
```

**Edit these lines in .env:**
```env
USER_APP_URL=https://yourdomain.com
ADMIN_APP_URL=https://admin.yourdomain.com
# Rest stays the same (MongoDB, Razorpay, etc.)
```

```bash
# Install and start
npm install --production
mkdir -p logs
pm2 start ecosystem.config.cjs
pm2 save
```

### 4. Build Frontends (5 minutes)

**User App:**
```bash
cd /var/www/food-delivery/user-app
cp .env.production .env
nano .env
# Set: VITE_API_URL=https://api.yourdomain.com/api
npm install
npm run build
```

**Admin App:**
```bash
cd /var/www/food-delivery/admin-app
cp .env.production .env
nano .env
# Set: VITE_API_URL=https://api.yourdomain.com/api
npm install
npm run build
```

### 5. Configure Nginx (3 minutes)

```bash
# Copy config
sudo cp /var/www/food-delivery/nginx.conf /etc/nginx/sites-available/food-delivery

# Edit - Replace all 'yourdomain.com' with your actual domain
sudo nano /etc/nginx/sites-available/food-delivery

# Enable site
sudo ln -s /etc/nginx/sites-available/food-delivery /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test and restart
sudo nginx -t
sudo systemctl restart nginx

# Configure firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

### 6. SSL Certificates (2 minutes)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificates (replace with your domains)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d admin.yourdomain.com -d api.yourdomain.com

# Follow prompts, choose redirect option
```

---

## Test Your Deployment

1. **User App:** https://yourdomain.com
2. **Admin App:** https://admin.yourdomain.com
3. **API:** https://api.yourdomain.com/api/health

**Test Full Flow:**
- Login to user app with email/OTP
- Browse menu, add items to cart
- Place order (test payment)
- Login to admin panel
- Change order status
- **Watch real-time updates work!**

---

## Post-Deployment Checklist

```bash
# Check backend is running
pm2 status

# View logs
pm2 logs food-delivery-backend

# Check Nginx
sudo systemctl status nginx

# Test auto-renewal
sudo certbot renew --dry-run
```

**Security (IMPORTANT!):**
1. Change admin passwords immediately
2. Remove port 5000 from EC2 security group
3. Restrict SSH to your IP only

---

## Common Issues & Fixes

### Backend not starting
```bash
pm2 logs food-delivery-backend  # Check errors
cd /var/www/food-delivery/backend
cat .env  # Verify all variables set
pm2 restart food-delivery-backend
```

### WebSocket not connecting
```bash
sudo nano /etc/nginx/sites-available/food-delivery
# Verify /socket.io location block exists
sudo nginx -t && sudo systemctl restart nginx
```

### Build fails (memory)
```bash
# Add swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
# Retry build
```

### CORS errors
```bash
cd /var/www/food-delivery/backend
nano .env
# Verify USER_APP_URL and ADMIN_APP_URL match your domains
pm2 restart food-delivery-backend
```

---

## Update/Redeploy

```bash
cd /var/www/food-delivery
./deploy.sh
```

Or manually:
```bash
cd /var/www/food-delivery
git pull origin main

# Backend
cd backend
npm install --production
pm2 restart food-delivery-backend

# User app
cd ../user-app
npm install && npm run build

# Admin app
cd ../admin-app
npm install && npm run build

# Reload Nginx
sudo systemctl reload nginx
```

---

## Useful Commands

```bash
# View logs
pm2 logs food-delivery-backend
sudo tail -f /var/log/nginx/error.log

# Restart services
pm2 restart food-delivery-backend
sudo systemctl restart nginx

# Monitor resources
pm2 monit
htop

# Check disk space
df -h

# SSL certificates
sudo certbot certificates
sudo certbot renew
```

---

## Files You Created

- ✅ `/var/www/food-delivery/backend/.env` - Backend environment
- ✅ `/var/www/food-delivery/user-app/.env` - User app environment
- ✅ `/var/www/food-delivery/admin-app/.env` - Admin app environment
- ✅ `/etc/nginx/sites-available/food-delivery` - Nginx config

---

## Total Time: ~20 minutes

(Excluding DNS propagation time)

---

## Need Help?

See detailed guides:
- 📖 [Complete AWS Deployment Guide](AWS-DEPLOYMENT-GUIDE.md)
- ✅ [Deployment Checklist](DEPLOYMENT-CHECKLIST.md)
- 📝 [Main README](README.md)

---

**That's it! Your food delivery app should now be live! 🎉**

Test everything, change admin passwords, and you're ready to go!
