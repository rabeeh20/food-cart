import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
export const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"FoodCart" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your FoodCart OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff6b6b;">FoodCart OTP Verification</h2>
          <p>Your OTP code is:</p>
          <h1 style="color: #4ecdc4; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
          <p>This OTP will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this OTP, please ignore this email.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP Email sent:', info.messageId);

    return {
      success: true,
      message: 'OTP sent successfully'
    };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: 'Failed to send OTP email. Please try again later.'
    };
  }
};

// Send order confirmation email
export const sendOrderConfirmation = async (email, orderDetails) => {
  try {
    const mailOptions = {
      from: `"FoodCart" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Order Confirmation - ${orderDetails.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff6b6b;">Order Confirmed!</h2>
          <p>Thank you for your order. Your order has been confirmed.</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
            <p><strong>Total Amount:</strong> ₹${orderDetails.totalAmount}</p>
            <p><strong>Delivery Address:</strong> ${orderDetails.address}</p>
          </div>
          <p>We'll notify you once your order is on the way!</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent:', info.messageId);

    return {
      success: true,
      message: 'Order confirmation email sent'
    };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: 'Failed to send order confirmation email'
    };
  }
};
