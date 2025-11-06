import React, { useState, useEffect } from 'react';
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
import { orderAPI, addressAPI } from '../../utils/api';
import { COLORS, SPACING, FONT_SIZES, PAYMENT_METHODS } from '../../utils/constants';

const CheckoutScreen = ({ navigation }) => {
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.COD);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [fetchingAddresses, setFetchingAddresses] = useState(true);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await addressAPI.getAll();
      if (response.data.success) {
        const fetchedAddresses = response.data.addresses;
        setAddresses(fetchedAddresses);

        // Auto-select default address or first address
        const defaultAddr = fetchedAddresses.find(addr => addr.isDefault);
        setSelectedAddress(defaultAddr || fetchedAddresses[0] || null);
      }
    } catch (error) {
      console.log('Failed to fetch addresses:', error);
      // Silent fail - user can still use default address
    } finally {
      setFetchingAddresses(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Empty Cart',
        text2: 'Please add items to cart',
      });
      return;
    }

    if (!selectedAddress) {
      Toast.show({
        type: 'error',
        text1: 'No Address',
        text2: 'Please add a delivery address',
      });
      return;
    }

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
        deliveryAddress: {
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zipCode,
          phone: selectedAddress.phone,
        },
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

        {fetchingAddresses ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading addresses...</Text>
          </View>
        ) : selectedAddress ? (
          <>
            <View style={styles.addressCard}>
              <Ionicons name="location" size={24} color={COLORS.primary} />
              <View style={styles.addressInfo}>
                <Text style={styles.addressText}>{String(selectedAddress.street || '')}</Text>
                <Text style={styles.addressSubtext}>
                  {String(selectedAddress.city || '')}, {String(selectedAddress.state || '')} - {String(selectedAddress.zipCode || '')}
                </Text>
                {selectedAddress.phone ? (
                  <Text style={styles.addressSubtext}>Phone: {String(selectedAddress.phone)}</Text>
                ) : null}
              </View>
              {selectedAddress.isDefault ? (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>Default</Text>
                </View>
              ) : null}
            </View>
            <TouchableOpacity
              style={styles.changeButton}
              onPress={() => Toast.show({
                type: 'info',
                text1: 'Coming Soon',
                text2: 'Address management feature coming soon!',
              })}
            >
              <Text style={styles.changeButtonText}>Change Address</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.noAddressCard}>
            <Ionicons name="location-outline" size={32} color={COLORS.textLight} />
            <Text style={styles.noAddressText}>No delivery address found</Text>
            <TouchableOpacity
              style={styles.addAddressButton}
              onPress={() => Toast.show({
                type: 'info',
                text1: 'Coming Soon',
                text2: 'Address management feature coming soon!',
              })}
            >
              <Text style={styles.addAddressButtonText}>Add Address</Text>
            </TouchableOpacity>
          </View>
        )}
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
            <Text style={styles.summaryLabel}>Items ({String(cart.length)})</Text>
            <Text style={styles.summaryValue}>₹{String(getCartTotal())}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>₹40</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{String(getCartTotal() + 40)}</Text>
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  loadingText: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  addressCard: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    alignItems: 'flex-start',
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
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: SPACING.xs,
  },
  defaultBadgeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: '500',
  },
  noAddressCard: {
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    alignItems: 'center',
  },
  noAddressText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  addAddressButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  addAddressButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    fontWeight: '600',
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
