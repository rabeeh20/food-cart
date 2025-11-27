import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../utils/api';
import { saveToken, getToken, removeToken, saveUser, getUser, removeUser } from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on app launch
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await getToken();
      const savedUser = await getUser();

      if (token && savedUser) {
        setUser(savedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestOTP = async (email) => {
    try {
      console.log('📧 Requesting OTP for:', email);
      const response = await authAPI.requestOTP(email);
      console.log('✅ OTP request successful:', response.data);
      return { success: true, message: response.data.message };
    } catch (error) {
      console.log('❌ OTP request failed:', error.message);
      console.log('Error details:', error.response?.data || error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send OTP',
      };
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const response = await authAPI.verifyOTP(email, otp);

      if (response.data.success) {
        const { token, user: userData } = response.data;

        // Save token and user data
        await saveToken(token);
        await saveUser(userData);

        setUser(userData);
        setIsAuthenticated(true);

        return { success: true, message: 'Login successful' };
      }

      return { success: false, message: 'Verification failed' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to verify OTP',
      };
    }
  };

  const logout = async () => {
    try {
      await removeToken();
      await removeUser();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const updateUser = async (userData) => {
    try {
      await saveUser(userData);
      setUser(userData);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        requestOTP,
        verifyOTP,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
