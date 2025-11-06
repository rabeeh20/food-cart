# Food Delivery Mobile App

React Native mobile application for the Food Delivery platform, built with Expo.

## Features

- 📱 Cross-platform (iOS & Android)
- 🔐 OTP-based authentication
- 🍔 Browse menu items
- 🛒 Shopping cart with real-time updates
- 💳 Multiple payment methods (COD, Razorpay)
- 📦 Order tracking
- 🐟 Fishing game feature
- 🔔 Real-time notifications via Socket.io

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator
- Expo Go app on your physical device (optional)

## Installation

1. Navigate to the mobile-app directory:
```bash
cd mobile-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
- **iOS Simulator**: Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal
- **Physical Device**: Scan the QR code with Expo Go app

## Project Structure

```
mobile-app/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # App screens
│   │   ├── auth/        # Authentication screens
│   │   ├── home/        # Home stack screens
│   │   └── main/        # Main tab screens
│   ├── navigation/      # Navigation setup
│   ├── context/         # React Context providers
│   ├── utils/           # Utilities and helpers
│   └── assets/          # Images and static files
├── App.js               # Root component
├── app.json             # Expo configuration
└── package.json         # Dependencies
```

## Configuration

The API URL is configured in `app.json`:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://16.16.154.49:5000/api"
    }
  }
}
```

Change this to your backend API URL if different.

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web (experimental)

## Technologies Used

- **React Native** - Mobile framework
- **Expo** - Development platform
- **React Navigation** - Navigation library
- **AsyncStorage** - Local storage
- **Axios** - HTTP client
- **Socket.io** - Real-time communication
- **Expo Vector Icons** - Icon library

## Current Implementation Status

### ✅ Completed
- Project setup and configuration
- Navigation structure (Auth, Main, Home navigators)
- Context providers (Auth, Cart, Socket)
- API utilities and storage helpers
- Authentication screens (Login, OTP Verification)

### 🚧 In Progress
- Main app screens (Home, Cart, Orders, Profile)
- Menu browsing
- Cart functionality
- Checkout flow

### 📝 Upcoming
- Order tracking
- Address management
- Fishing game
- Push notifications
- Payment integration

## Development Notes

1. **Hot Reload**: Changes to code automatically refresh the app
2. **Console Logs**: Check the Metro bundler terminal for logs
3. **Remote Debugging**: Shake device or press Cmd+D (iOS) / Cmd+M (Android)

## Backend API

This app connects to the Food Delivery backend API running at:
- Production: `http://16.16.154.49:5000/api`
- Local: `http://localhost:5000/api` (for development)

Make sure the backend server is running before testing the app.

## Troubleshooting

### Metro Bundler Issues
```bash
# Clear cache
expo start -c
```

### Package Installation Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### iOS Simulator Not Opening
```bash
# Open simulator manually
open -a Simulator
```

## Next Steps

1. Install dependencies: `npm install`
2. Start the app: `npm start`
3. Test authentication flow
4. Continue development of remaining screens

## Support

For issues or questions, please contact the development team.
