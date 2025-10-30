# Quick Start - IP-Only Deployment (No Domain)

Ultra-fast deployment guide using only EC2 IP address. **No domain required!**

---

## What You Get

```
User App:  http://YOUR_EC2_IP/
Admin App: http://YOUR_EC2_IP/admin
API:       http://YOUR_EC2_IP/api/
```

---

## Prerequisites

- AWS account
- EC2 instance running (Ubuntu 22.04, t2.small min)
- Your EC2 public IP address
- SSH access to EC2

---

## 🚀 Deployment Commands (Copy & Paste)

### 1. Connect to EC2

```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
```

### 2. Install Everything (5 minutes)

```bash
# Update & install Node.js
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git

# Install PM2
sudo npm install -g pm2
pm2 startup systemd
# Run the command it outputs

# Verify
node --version
nginx -v
```

### 3. Clone & Setup (2 minutes)

```bash
# Clone project
sudo mkdir -p /var/www/food-delivery
sudo chown -R $USER:$USER /var/www/food-delivery
cd /var/www
git clone YOUR_REPO_URL food-delivery
cd food-delivery
```

### 4. Configure Backend (1 minute)

```bash
cd /var/www/food-delivery/backend
cp .env.production.ip .env

# Edit .env - Replace YOUR_EC2_IP with actual IP
nano .env
# Update these lines:
# USER_APP_URL=http://YOUR_ACTUAL_IP
# ADMIN_APP_URL=http://YOUR_ACTUAL_IP/admin
# Save: Ctrl+X, Y, Enter

# Start backend
npm install --production
mkdir -p logs
pm2 start ecosystem.config.cjs
pm2 save
```

### 5. Build User App (3 minutes)

```bash
cd /var/www/food-delivery/user-app
cp .env.production.ip .env

# Edit .env
nano .env
# Update: VITE_API_URL=http://YOUR_ACTUAL_IP/api
# Save: Ctrl+X, Y, Enter

npm install
npm run build
```

### 6. Build Admin App (3 minutes)

```bash
cd /var/www/food-delivery/admin-app
cp .env.production.ip .env

# Edit .env
nano .env
# Update: VITE_API_URL=http://YOUR_ACTUAL_IP/api
# Save: Ctrl+X, Y, Enter

npm install
npm run build
```

### 7. Configure Nginx (1 minute)

```bash
# Setup Nginx
sudo cp /var/www/food-delivery/nginx-ip-only.conf /etc/nginx/sites-available/food-delivery
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

### 8. Create Admin Accounts

```bash
cd /var/www/food-delivery/backend
npm run seed
```

---

## ✅ Test Your Deployment

Open browser and go to (replace with your IP):

```
User App:  http://54.123.45.67/
Admin App: http://54.123.45.67/admin
API:       http://54.123.45.67/api/health
```

**Login to Admin:**
- Email: `superadmin@fooddelivery.com`
- Password: `SuperAdmin@123`

⚠️ **Change this password immediately!**

---

## 📋 Quick Checklist

- [ ] EC2 security group allows port 80 (HTTP)
- [ ] PM2 shows backend running: `pm2 status`
- [ ] User app loads at `http://YOUR_IP/`
- [ ] Admin app loads at `http://YOUR_IP/admin`
- [ ] API responds at `http://YOUR_IP/api/health`
- [ ] Can login to user app with email/OTP
- [ ] Can login to admin panel
- [ ] Real-time updates work
- [ ] Admin passwords changed

---

## 🔧 Common Commands

```bash
# Check status
pm2 status
sudo systemctl status nginx

# View logs
pm2 logs food-delivery-backend
sudo tail -f /var/log/nginx/error.log

# Restart
pm2 restart food-delivery-backend
sudo systemctl restart nginx

# Monitor
pm2 monit
```

---

## 🔄 Update Application

```bash
cd /var/www/food-delivery
chmod +x deploy-ip.sh
./deploy-ip.sh
```

Or manually:
```bash
cd /var/www/food-delivery
git pull
cd backend && pm2 restart food-delivery-backend
cd ../user-app && npm run build
cd ../admin-app && npm run build
sudo systemctl reload nginx
```

---

## ⚠️ Security (Do This Now!)

1. **Change admin passwords** (login to admin panel)
2. **Remove port 5000** from EC2 security group
3. **Restrict SSH** to your IP only in security group

---

## 🐛 Troubleshooting

### Can't access website
```bash
# Check services
pm2 status
sudo systemctl status nginx

# Test locally
curl http://localhost/
curl http://localhost/api/health

# Restart everything
pm2 restart food-delivery-backend
sudo systemctl restart nginx
```

### 502 Bad Gateway
```bash
# Backend not running
pm2 logs food-delivery-backend
pm2 restart food-delivery-backend
```

### WebSocket not connecting
```bash
# Check Nginx config
sudo nginx -t
sudo systemctl restart nginx

# Check backend CORS
cd /var/www/food-delivery/backend
cat .env | grep URL
```

---

## 📊 File Structure After Deployment

```
/var/www/food-delivery/
├── backend/              (Running via PM2)
│   ├── .env             (Updated with your IP)
│   └── logs/
├── user-app/
│   └── dist/            (Served by Nginx at /)
├── admin-app/
│   └── dist/            (Served by Nginx at /admin)
└── deploy-ip.sh         (Update script)

/etc/nginx/sites-enabled/
└── food-delivery        (Config from nginx-ip-only.conf)
```

---

## 🎯 Total Time: ~15 minutes

**Next Steps:**
1. Test all features thoroughly
2. Change admin passwords
3. Configure security group properly
4. Start taking orders! 🎉

---

## 📚 Need More Help?

See detailed guide: [DEPLOYMENT-GUIDE-IP-ONLY.md](DEPLOYMENT-GUIDE-IP-ONLY.md)

---

**That's it! Your app is live! 🚀**

Access at: `http://YOUR_EC2_IP/`
