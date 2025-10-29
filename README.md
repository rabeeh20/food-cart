# Food Delivery Application - MERN Stack

A complete food delivery application with user app, admin panel, and backend API.

## Features

### User App
- Gmail OTP authentication (login/signup)
- Browse menu items with filters (category, veg/non-veg)
- Shopping cart functionality
- Save multiple delivery addresses
- Place orders with Razorpay payment integration
- View order history and track status

### Admin Panel
- Secure login with email/password
- Dashboard with statistics
- Order management with status updates
- Real-time order tracking

### Backend
- RESTful API with Express.js
- MongoDB Atlas database
- JWT authentication
- Email OTP verification with Nodemailer
- Razorpay payment gateway integration
- Order management system

## Tech Stack

- **Frontend**: React, Vite, React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT, Gmail OTP
- **Payment**: Razorpay
- **Email**: Nodemailer (Gmail)

## Project Structure

```
food-cart/
├── backend/           # Express API server
├── user-app/          # User-facing React app
├── admin-app/         # Admin panel React app
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- Gmail account with App Password enabled
- Razorpay account (test mode)

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Update `.env` with your credentials:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fooddelivery?retryWrites=true&w=majority

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_very_long_random_secret_key

# Gmail (for OTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-digit-app-password

# Razorpay
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Admin
ADMIN_EMAIL=admin@fooddelivery.com
ADMIN_PASSWORD=Admin@123
```

**Gmail App Password Setup:**
1. Go to Google Account → Security
2. Enable 2-Factor Authentication
3. Go to Security → App passwords
4. Generate password for "Mail"
5. Use this 16-digit password in `EMAIL_PASS`

**Razorpay Setup:**
1. Sign up at https://razorpay.com
2. Use Test Mode
3. Get API Key ID and Secret from Dashboard → Settings → API Keys

**Seed Database:**
```bash
npm run seed
```

This will create:
- Admin user (use credentials from .env)
- Sample menu items

**Start Backend:**
```bash
npm run dev
```

Backend runs at http://localhost:5000

### 2. User App Setup

```bash
cd user-app
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Update `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

**Start User App:**
```bash
npm run dev
```

User app runs at http://localhost:5173

### 3. Admin App Setup

```bash
cd admin-app
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Update `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

**Start Admin App:**
```bash
npm run dev
```

Admin app runs at http://localhost:5174

## Running All Apps

Open 3 terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - User App:**
```bash
cd user-app
npm run dev
```

**Terminal 3 - Admin App:**
```bash
cd admin-app
npm run dev
```

## Default Credentials

### Admin Panel
- Email: admin@fooddelivery.com (or as set in .env)
- Password: Admin@123 (or as set in .env)

### User App
- Use any valid Gmail address
- OTP will be sent to email for verification

## API Endpoints

### Authentication
- `POST /api/auth/request-otp` - Request OTP
- `POST /api/auth/verify-otp` - Verify OTP and login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Menu
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:id` - Get menu item by ID
- `POST /api/menu` - Add menu item (Admin)
- `PUT /api/menu/:id` - Update menu item (Admin)
- `DELETE /api/menu/:id` - Delete menu item (Admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `PATCH /api/orders/:id/cancel` - Cancel order

### Address
- `GET /api/address` - Get all addresses
- `POST /api/address` - Add address
- `PUT /api/address/:id` - Update address
- `DELETE /api/address/:id` - Delete address
- `PATCH /api/address/:id/set-default` - Set default

### Payment
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify-payment` - Verify payment

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/orders` - Get all orders
- `PATCH /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/stats/dashboard` - Dashboard statistics

## Usage Flow

### For Users:
1. Open http://localhost:5173
2. Click "Login" and enter email
3. Check email for OTP (6-digit code)
4. Enter OTP to login
5. Browse menu and add items to cart
6. Go to cart and proceed to checkout
7. Add delivery address
8. Complete payment with Razorpay (test mode)
9. View order in "My Orders"

### For Admin:
1. Open http://localhost:5174
2. Login with admin credentials
3. View dashboard statistics
4. Go to "Orders" to manage orders
5. Update order status (confirmed, preparing, ready, out for delivery, delivered)

## Razorpay Test Cards

For testing payments in Razorpay test mode:

**Card Number:** 4111 1111 1111 1111
**CVV:** Any 3 digits
**Expiry:** Any future date
**Name:** Any name

## Order Status Flow

1. **placed** - Order created by user
2. **confirmed** - Payment successful
3. **preparing** - Kitchen preparing order
4. **ready** - Order ready for delivery
5. **out_for_delivery** - Out for delivery
6. **delivered** - Order delivered
7. **cancelled** - Order cancelled

## Troubleshooting

### Email OTP not received
- Check Gmail App Password is correct
- Check spam folder
- Ensure 2FA is enabled on Gmail
- Verify EMAIL_USER and EMAIL_PASS in .env

### Payment not working
- Ensure Razorpay keys are in test mode
- Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
- Verify Razorpay script is loading

### MongoDB connection error
- Check MONGODB_URI is correct
- Ensure IP whitelist in MongoDB Atlas (allow 0.0.0.0/0 for testing)
- Verify network connection

### Port already in use
- Change PORT in backend .env
- Change port in vite.config.js for frontend apps

## Building for Production

### Backend
```bash
cd backend
npm start
```

### User App
```bash
cd user-app
npm run build
```

### Admin App
```bash
cd admin-app
npm run build
```

## License

MIT

## Support

For issues or questions, please create an issue in the repository.
