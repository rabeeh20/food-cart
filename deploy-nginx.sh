#!/bin/bash

# Food Delivery App - Nginx Deployment Script
# This script deploys the HTTP-only nginx configuration for the food delivery app
# Run with: sudo ./deploy-nginx.sh

echo "=========================================="
echo "Food Delivery App - Nginx Deployment"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run as root or with sudo"
    exit 1
fi

# Backup existing config
BACKUP_FILE="/etc/nginx/sites-available/food-delivery.backup.$(date +%Y%m%d_%H%M%S)"
if [ -f "/etc/nginx/sites-available/food-delivery" ]; then
    echo "📦 Backing up existing config to: $BACKUP_FILE"
    cp /etc/nginx/sites-available/food-delivery "$BACKUP_FILE"
fi

# Create new nginx configuration
echo "📝 Creating new nginx configuration..."
cat > /etc/nginx/sites-available/food-delivery <<'EOF'
# Nginx Configuration for Food Delivery Application
# HTTP ONLY (No SSL) - Production Ready
# FIXED: No nested location blocks to prevent 500 errors

server {
    listen 80;
    server_name _;  # Accept all hostnames/IPs

    client_max_body_size 10M;

    # Security headers (HTTP only)
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API endpoints - Backend proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS headers for mobile app
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;

        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }

    # WebSocket support for Socket.io
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket timeout settings
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;

        # CORS for Socket.io
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
    }

    # Admin app static assets with caching - Must come BEFORE /admin location
    location ~ ^/admin/assets/ {
        root /var/www/food-delivery/admin-app/dist;
        rewrite ^/admin/(.*)$ /$1 break;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Admin app - Must come AFTER assets location
    location /admin {
        alias /var/www/food-delivery/admin-app/dist;
        index index.html;
        try_files $uri $uri/ /admin/index.html;

        # Cache control for HTML files only
        add_header Cache-Control "no-cache" always;
    }

    # User app static assets with caching
    location ~ ^/assets/ {
        root /var/www/food-delivery/user-app/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # User app (default) - Must be last
    location / {
        root /var/www/food-delivery/user-app/dist;
        index index.html;
        try_files $uri $uri/ /index.html;

        # Cache control for HTML files only
        add_header Cache-Control "no-cache" always;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 1000;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/rss+xml
        application/atom+xml
        image/svg+xml;
}
EOF

# Enable the site
echo "🔗 Enabling site configuration..."
ln -sf /etc/nginx/sites-available/food-delivery /etc/nginx/sites-enabled/

# Test nginx configuration
echo ""
echo "🧪 Testing nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    # Reload nginx
    echo ""
    echo "🔄 Reloading nginx..."
    systemctl reload nginx

    if [ $? -eq 0 ]; then
        echo ""
        echo "=========================================="
        echo "✅ Deployment successful!"
        echo "=========================================="
        echo ""
        echo "Your apps should now be accessible at:"
        echo "  • User App:  http://YOUR_IP/"
        echo "  • Admin App: http://YOUR_IP/admin"
        echo "  • API:       http://YOUR_IP/api"
        echo ""
        echo "Changes from previous config:"
        echo "  ✓ Fixed nested location blocks (admin app 500 error)"
        echo "  ✓ Simplified admin app routing"
        echo "  ✓ Proper static asset caching"
        echo "  ✓ CORS headers for mobile app"
        echo ""
    else
        echo ""
        echo "❌ Failed to reload nginx"
        echo "Please check the logs: sudo tail -f /var/log/nginx/error.log"
        exit 1
    fi
else
    echo ""
    echo "❌ Nginx configuration test failed"
    echo "Restoring backup..."
    if [ -f "$BACKUP_FILE" ]; then
        cp "$BACKUP_FILE" /etc/nginx/sites-available/food-delivery
        echo "Backup restored. Please check the configuration."
    fi
    exit 1
fi
