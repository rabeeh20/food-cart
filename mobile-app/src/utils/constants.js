import Constants from 'expo-constants';

// API Configuration
export const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://16.16.154.49:5000/api';

// Colors
export const COLORS = {
  primary: '#ff6347',
  secondary: '#ffa07a',
  background: '#f5f5f5',
  white: '#ffffff',
  black: '#000000',
  gray: '#808080',
  lightGray: '#d3d3d3',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  text: '#333333',
  textLight: '#666666',
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Font Sizes
export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
};

// Order Status
export const ORDER_STATUS = {
  PLACED: 'placed',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

// Payment Methods
export const PAYMENT_METHODS = {
  COD: 'cod',
  RAZORPAY: 'razorpay',
};
