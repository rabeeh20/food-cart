#!/bin/bash
# Deploy Nginx Configuration Script
# Run this on your EC2 server

echo "🚀 Deploying Nginx configuration..."

# Backup existing config
if [ -f /etc/nginx/sites-available/food-delivery ]; then
    echo "📦 Backing up existing config..."
    sudo cp /etc/nginx/sites-available/food-delivery /etc/nginx/sites-available/food-delivery.backup.$(date +%Y%m%d_%H%M%S)
fi

# Create the nginx config
echo "📝 Creating new nginx configuration..."
sudo tee /etc/nginx/sites-available/food-delivery > /dev/null <<'EOF'
# Nginx Configuration for Food Delivery Application
# HTTP ONLY (No SSL) - Production Ready

server {
    listen 80;
    server_name _;

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
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;

        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
    }

    # Admin app
    location /admin {
        alias /var/www/food-delivery/admin-app/dist;
        index index.html;
        try_files $uri $uri/ /admin/index.html =404;
    }

    # User app (default)
    location / {
        root /var/www/food-delivery/user-app/dist;
        index index.html;
        try_files $uri $uri/ /index.html =404;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 1000;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml application/atom+xml image/svg+xml;
}
EOF

# Enable the site
echo "🔗 Enabling site..."
sudo ln -sf /etc/nginx/sites-available/food-delivery /etc/nginx/sites-enabled/

# Remove default site if exists
if [ -f /etc/nginx/sites-enabled/default ]; then
    echo "🗑️  Removing default site..."
    sudo rm /etc/nginx/sites-enabled/default
fi

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuration test passed!"
    echo "🔄 Reloading nginx..."
    sudo systemctl reload nginx
    echo "✅ Nginx reloaded successfully!"
    echo ""
    echo "🎉 Deployment complete!"
    echo "📱 Mobile App API: http://YOUR_IP/api"
    echo "👤 User App: http://YOUR_IP/"
    echo "🔧 Admin App: http://YOUR_IP/admin"
else
    echo "❌ Configuration test failed! Please check the errors above."
    exit 1
fi
