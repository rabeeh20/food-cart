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

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { requestOTP } = useAuth();

  const handleSendOTP = async () => {
    if (!email.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your email address',
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid email address',
      });
      return;
    }

    setLoading(true);
    const result = await requestOTP(email);
    setLoading(false);

    if (result.success) {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: result.message,
      });
      navigation.navigate('OTPVerification', { email });
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
          <Text style={styles.title}>FoodCart</Text>
          <Text style={styles.subtitle}>Delicious food delivered to your door</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          <Text style={styles.hint}>We'll send you an OTP to verify your email</Text>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSendOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Send OTP</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.infoText}>
            We'll verify your account via email OTP
          </Text>
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
    fontSize: FONT_SIZES.xxl * 1.5,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    opacity: 0.9,
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
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 10,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    marginBottom: SPACING.xs,
  },
  hint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginBottom: SPACING.lg,
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
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});

export default LoginScreen;
