import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const KEYS = {
  TOKEN: '@food_delivery_token',
  USER: '@food_delivery_user',
  CART: '@food_delivery_cart',
};

// Token storage
export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem(KEYS.TOKEN, token);
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(KEYS.TOKEN);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(KEYS.TOKEN);
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

// User storage
export const saveUser = async (user) => {
  try {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user:', error);
  }
};

export const getUser = async () => {
  try {
    const user = await AsyncStorage.getItem(KEYS.USER);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const removeUser = async () => {
  try {
    await AsyncStorage.removeItem(KEYS.USER);
  } catch (error) {
    console.error('Error removing user:', error);
  }
};

// Cart storage
export const saveCart = async (cart) => {
  try {
    await AsyncStorage.setItem(KEYS.CART, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart:', error);
  }
};

export const getCart = async () => {
  try {
    const cart = await AsyncStorage.getItem(KEYS.CART);
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Error getting cart:', error);
    return [];
  }
};

export const clearCart = async () => {
  try {
    await AsyncStorage.removeItem(KEYS.CART);
  } catch (error) {
    console.error('Error clearing cart:', error);
  }
};

// Clear all storage
export const clearAllStorage = async () => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};
