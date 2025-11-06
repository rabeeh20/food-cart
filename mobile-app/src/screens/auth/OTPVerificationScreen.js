import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

const OTPVerificationScreen = ({ route, navigation }) => {
  const { email } = route.params;
  const [otp, setOTP] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { verifyOTP, requestOTP } = useAuth();

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter the 6-digit OTP',
      });
      return;
    }

    setLoading(true);
    const result = await verifyOTP(email, otp);
    setLoading(false);

    if (result.success) {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Login successful!',
      });
      // Navigation handled by AuthContext
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: result.message,
      });
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    const result = await requestOTP(email);
    setResending(false);

    if (result.success) {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'OTP resent successfully',
      });
      setOTP('');
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: result.message,
      });
    }
  };

  return (
    <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{'\n'}
            {email}
          </Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChangeText={setOTP}
            keyboardType="number-pad"
            maxLength={6}
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleVerifyOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Verify OTP</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResendOTP}
            disabled={resending}
          >
            <Text style={styles.resendText}>
              {resending ? 'Resending...' : "Didn't receive? Resend OTP"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Change email address</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl * 2,
  },
  title: {
    fontSize: FONT_SIZES.xxl * 1.2,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 10,
    padding: SPACING.md,
    fontSize: FONT_SIZES.xl,
    marginBottom: SPACING.lg,
    textAlign: 'center',
    letterSpacing: 10,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  resendButton: {
    padding: SPACING.sm,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  resendText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  backText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },
});

export default OTPVerificationScreen;
