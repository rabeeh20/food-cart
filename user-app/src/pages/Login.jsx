import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';
import './Login.css';

const Login = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate email format
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        toast.error('Please enter a valid email address');
        setLoading(false);
        return;
      }

      const response = await authAPI.requestOTP(email);
      if (response.data.success) {
        toast.success('OTP sent to your email!');
        setStep(2);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.verifyOTP(email, otp);
      if (response.data.success) {
        login(response.data.user, response.data.token);
        toast.success('Login successful!');
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <h1>Welcome to FoodCart</h1>
          <p className="subtitle">Login or Sign up with your email</p>

          {step === 1 ? (
            <form onSubmit={handleRequestOTP}>
              <div className="input-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                />
                <small>We'll send you an OTP to verify your email</small>
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <div className="input-group">
                <label>Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  required
                />
                <small>OTP sent to {email}</small>
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
              <button
                type="button"
                className="btn btn-outline btn-block"
                onClick={() => setStep(1)}
                style={{ marginTop: '10px' }}
              >
                Change Email Address
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
