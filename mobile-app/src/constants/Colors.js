// Design System Colors - Matching User Web App
export const COLORS = {
  // Primary Colors
  primary: '#FF6B35',
  primaryHover: '#FF5722',
  primaryLight: '#FFA726',
  secondary: '#FFA500',

  // Text Colors
  dark: '#2D2D2D',
  text: '#2D2D2D',
  textMedium: '#6C757D',
  textLight: '#9E9E9E',

  // Background Colors
  background: '#F8F9FA',
  cardBackground: '#FFFFFF',
  lightGray: '#F5F5F5',
  white: '#FFFFFF',

  // Status Colors
  success: '#28A745',
  successLight: '#D4EDDA',
  warning: '#FFC107',
  warningLight: '#FFF3CD',
  danger: '#DC3545',
  dangerLight: '#F8D7DA',
  info: '#17A2B8',

  // Border & Effects
  border: '#E0E0E0',

  // Gradient Colors
  gradientStart: '#FF6B35',
  gradientEnd: '#FF5722',
};

// Spacing Constants (in pixels)
export const SPACING = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  xxxl: 32,
  huge: 48,
};

// Border Radius
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 50, // for circular elements
};

// Font Sizes
export const FONT_SIZE = {
  tiny: 11,
  xs: 12,
  sm: 14,
  md: 15,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  title: 28,
  hero: 32,
};

// Font Weights
export const FONT_WEIGHT = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

// Shadows
export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  large: {
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 6,
  },
  button: {
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
};

// Status Colors Mapping for Orders
export const STATUS_COLORS = {
  placed: COLORS.primary,
  confirmed: COLORS.primary,
  preparing: COLORS.warning,
  ready: COLORS.warning,
  out_for_delivery: COLORS.warning,
  delivered: COLORS.success,
  cancelled: COLORS.danger,
};

export default COLORS;
