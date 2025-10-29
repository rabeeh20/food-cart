# Food Delivery Backend

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your credentials:
   - MongoDB Atlas URI
   - Gmail credentials (for OTP)
   - Razorpay API keys
   - JWT secret

4. Seed the database with admin and menu items:
```bash
npm run seed
```

5. Start the development server:
```bash
npm run dev
```

## Gmail App Password Setup

1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Go to Security > App passwords
4. Generate app password for "Mail"
5. Use this password in EMAIL_PASS

## API Endpoints

### Authentication
- POST `/api/auth/request-otp` - Request OTP
- POST `/api/auth/verify-otp` - Verify OTP and login
- GET `/api/auth/profile` - Get user profile
- PUT `/api/auth/profile` - Update profile

### Menu
- GET `/api/menu` - Get all menu items
- GET `/api/menu/:id` - Get single menu item
- POST `/api/menu` - Add menu item (Admin)
- PUT `/api/menu/:id` - Update menu item (Admin)
- DELETE `/api/menu/:id` - Delete menu item (Admin)

### Orders
- POST `/api/orders` - Create order
- GET `/api/orders` - Get user orders
- GET `/api/orders/:id` - Get single order
- PATCH `/api/orders/:id/cancel` - Cancel order

### Address
- GET `/api/address` - Get all addresses
- POST `/api/address` - Add address
- PUT `/api/address/:id` - Update address
- DELETE `/api/address/:id` - Delete address

### Payment
- POST `/api/payment/create-order` - Create Razorpay order
- POST `/api/payment/verify-payment` - Verify payment

### Admin
- POST `/api/admin/login` - Admin login
- GET `/api/admin/orders` - Get all orders
- PATCH `/api/admin/orders/:id/status` - Update order status
- GET `/api/admin/stats/dashboard` - Dashboard stats
