import axios from 'axios';

// MSG91 Configuration from environment variables
const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID;
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP via MSG91 SMS
 * @param {string} phone - Phone number in format +91XXXXXXXXXX
 * @param {string} otp - 6-digit OTP
 * @returns {Promise<Object>} Response object with success status
 */
export const sendOTPSMS = async (phone, otp) => {
  try {
    // Validate MSG91 credentials - only AUTH_KEY is required for default template
    if (!MSG91_AUTH_KEY) {
      console.error('MSG91 credentials not configured');
      return {
        success: false,
        error: 'SMS service not configured. Please contact administrator.'
      };
    }

    // Remove +91 prefix if present for MSG91 API
    const phoneNumber = phone.startsWith('+91') ? phone.slice(3) : phone;

    // Prepare MSG91 API request
    const url = 'https://control.msg91.com/api/v5/otp';
    const payload = {
      mobile: `91${phoneNumber}`,
      authkey: MSG91_AUTH_KEY,
      otp: otp
    };

    // Add template ID if configured (otherwise uses default template)
    if (MSG91_TEMPLATE_ID) {
      payload.template_id = MSG91_TEMPLATE_ID;
    }

    // Add sender ID if configured
    if (MSG91_SENDER_ID) {
      payload.sender = MSG91_SENDER_ID;
    }

    console.log(`Sending OTP to ${phone} via MSG91...`);

    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });

    console.log('MSG91 Response:', response.data);

    // MSG91 returns type: 'success' on successful OTP send
    if (response.data && response.data.type === 'success') {
      return {
        success: true,
        message: 'OTP sent successfully',
        data: response.data
      };
    } else {
      console.error('MSG91 Error Response:', response.data);
      return {
        success: false,
        error: response.data.message || 'Failed to send OTP'
      };
    }

  } catch (error) {
    console.error('SMS sending error:', error.response?.data || error.message);

    // Return user-friendly error message
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to send OTP. Please try again later.'
    };
  }
};

/**
 * Verify OTP via MSG91 (optional - if you want to use MSG91's verification)
 * Note: You can also verify OTP in your own backend by comparing stored OTP
 * @param {string} phone - Phone number in format +91XXXXXXXXXX
 * @param {string} otp - 6-digit OTP to verify
 * @returns {Promise<Object>} Response object with verification status
 */
export const verifyOTPViaMSG91 = async (phone, otp) => {
  try {
    if (!MSG91_AUTH_KEY) {
      return {
        success: false,
        error: 'SMS service not configured'
      };
    }

    // Remove +91 prefix
    const phoneNumber = phone.startsWith('+91') ? phone.slice(3) : phone;

    const url = `https://control.msg91.com/api/v5/otp/verify`;
    const params = {
      authkey: MSG91_AUTH_KEY,
      mobile: `91${phoneNumber}`,
      otp: otp
    };

    const response = await axios.get(url, { params });

    if (response.data && response.data.type === 'success') {
      return {
        success: true,
        message: 'OTP verified successfully',
        data: response.data
      };
    } else {
      return {
        success: false,
        error: response.data.message || 'OTP verification failed'
      };
    }

  } catch (error) {
    console.error('OTP verification error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'OTP verification failed'
    };
  }
};

/**
 * Resend OTP via MSG91
 * @param {string} phone - Phone number in format +91XXXXXXXXXX
 * @returns {Promise<Object>} Response object with success status
 */
export const resendOTP = async (phone) => {
  try {
    if (!MSG91_AUTH_KEY) {
      return {
        success: false,
        error: 'SMS service not configured'
      };
    }

    // Remove +91 prefix
    const phoneNumber = phone.startsWith('+91') ? phone.slice(3) : phone;

    const url = 'https://control.msg91.com/api/v5/otp/retry';
    const payload = {
      authkey: MSG91_AUTH_KEY,
      mobile: `91${phoneNumber}`,
      retrytype: 'text' // Can be 'text' or 'voice'
    };

    const response = await axios.post(url, payload);

    if (response.data && response.data.type === 'success') {
      return {
        success: true,
        message: 'OTP resent successfully',
        data: response.data
      };
    } else {
      return {
        success: false,
        error: response.data.message || 'Failed to resend OTP'
      };
    }

  } catch (error) {
    console.error('OTP resend error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to resend OTP'
    };
  }
};
