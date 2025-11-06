import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderAPI } from '../../utils/api';
import { COLORS, SPACING, FONT_SIZES, PAYMENT_METHODS } from '../../utils/constants';

const CheckoutScreen = ({ navigation }) => {
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.COD);
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Empty Cart',
        text2: 'Please add items to cart',
      });
      return;
    }

    // For demo, using a default address
    const defaultAddress = {
      street: '123 Main St',
      city: 'Demo City',
      state: 'Demo State',
      zipCode: '12345',
      phone: '1234567890',
    };

    setLoading(true);

    try {
      const orderData = {
        items: cart.map(item => ({
          menuItem: item._id,
          quantity: item.quantity,
          ...(item.variant && {
            variant: item.variant,
            isFish: true,
          }),
        })),
        deliveryAddress: defaultAddress,
        paymentMethod,
      };

      const response = await orderAPI.create(orderData);

      if (response.data.success) {
        if (paymentMethod === PAYMENT_METHODS.COD) {
          clearCart();
          Toast.show({
            type: 'success',
            text1: 'Order Placed!',
            text2: 'Your order has been placed successfully',
          });
          navigation.navigate('Orders');
        } else {
          // Handle online payment
          Toast.show({
            type: 'info',
            text1: 'Payment',
            text2: 'Online payment coming soon!',
          });
        }
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to place order',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <View style={styles.addressCard}>
          <Ionicons name="location" size={24} color={COLORS.primary} />
          <View style={styles.addressInfo}>
            <Text style={styles.addressText}>123 Main St</Text>
            <Text style={styles.addressSubtext}>Demo City, Demo State - 12345</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.changeButton}>
          <Text style={styles.changeButtonText}>Change Address</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <TouchableOpacity
          style={[
            styles.paymentOption,
            paymentMethod === PAYMENT_METHODS.COD && styles.selectedPayment,
          ]}
          onPress={() => setPaymentMethod(PAYMENT_METHODS.COD)}
        >
          <Ionicons
            name="cash-outline"
            size={24}
            color={paymentMethod === PAYMENT_METHODS.COD ? COLORS.primary : COLORS.gray}
          />
          <Text style={styles.paymentText}>Cash on Delivery</Text>
          {paymentMethod === PAYMENT_METHODS.COD && (
            <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentOption,
            paymentMethod === PAYMENT_METHODS.RAZORPAY && styles.selectedPayment,
          ]}
          onPress={() => setPaymentMethod(PAYMENT_METHODS.RAZORPAY)}
        >
          <Ionicons
            name="card-outline"
            size={24}
            color={paymentMethod === PAYMENT_METHODS.RAZORPAY ? COLORS.primary : COLORS.gray}
          />
          <Text style={styles.paymentText}>Online Payment</Text>
          {paymentMethod === PAYMENT_METHODS.RAZORPAY && (
            <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items ({cart.length})</Text>
            <Text style={styles.summaryValue}>₹{getCartTotal()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>₹40</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{getCartTotal() + 40}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.placeOrderButton, loading && styles.disabledButton]}
        onPress={handlePlaceOrder}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.placeOrderText}>Place Order</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  section: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  addressCard: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  addressInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  addressText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  addressSubtext: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  changeButton: {
    alignSelf: 'flex-start',
  },
  changeButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPayment: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(255, 99, 71, 0.05)',
  },
  paymentText: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
  },
  summaryCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  summaryValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  totalRow: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  totalLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  placeOrderButton: {
    backgroundColor: COLORS.primary,
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  placeOrderText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});

export default CheckoutScreen;
