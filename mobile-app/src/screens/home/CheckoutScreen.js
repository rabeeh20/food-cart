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
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Checkout</Text>
          <Text style={styles.headerSubtitle}>Review your order details</Text>
        </View>

        {/* Delivery Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="location" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
          </View>

          {fetchingAddresses ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading addresses...</Text>
            </View>
          ) : selectedAddress ? (
            <>
              <View style={styles.addressCard}>
                <View style={styles.addressHeader}>
                  <Text style={styles.addressLabel}>Deliver to</Text>
                  {selectedAddress.isDefault ? (
                    <View style={styles.defaultBadge}>
                      <Ionicons name="star" size={10} color={COLORS.white} />
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.addressText}>{String(selectedAddress.street || '')}</Text>
                <Text style={styles.addressSubtext}>
                  {String(selectedAddress.city || '')}, {String(selectedAddress.state || '')} - {String(selectedAddress.zipCode || '')}
                </Text>
                {selectedAddress.phone ? (
                  <View style={styles.phoneRow}>
                    <Ionicons name="call-outline" size={14} color={COLORS.textLight} />
                    <Text style={styles.phoneText}>{String(selectedAddress.phone)}</Text>
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
                <Ionicons name="create-outline" size={16} color={COLORS.primary} />
                <Text style={styles.changeButtonText}>Change Address</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.noAddressCard}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="location-outline" size={40} color={COLORS.primary} />
              </View>
              <Text style={styles.noAddressTitle}>No Address Found</Text>
              <Text style={styles.noAddressText}>Add a delivery address to continue</Text>
              <TouchableOpacity
                style={styles.addAddressButton}
                onPress={() => Toast.show({
                  type: 'info',
                  text1: 'Coming Soon',
                  text2: 'Address management feature coming soon!',
                })}
              >
                <Ionicons name="add-circle-outline" size={20} color={COLORS.white} />
                <Text style={styles.addAddressButtonText}>Add New Address</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="wallet" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === PAYMENT_METHODS.COD && styles.selectedPayment,
            ]}
            onPress={() => setPaymentMethod(PAYMENT_METHODS.COD)}
          >
            <View style={styles.paymentLeft}>
              <View style={[
                styles.paymentIconCircle,
                paymentMethod === PAYMENT_METHODS.COD && styles.selectedPaymentIcon
              ]}>
                <Ionicons
                  name="cash"
                  size={20}
                  color={paymentMethod === PAYMENT_METHODS.COD ? COLORS.white : COLORS.gray}
                />
              </View>
              <View>
                <Text style={styles.paymentTitle}>Cash on Delivery</Text>
                <Text style={styles.paymentSubtitle}>Pay when you receive</Text>
              </View>
            </View>
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
            <View style={styles.paymentLeft}>
              <View style={[
                styles.paymentIconCircle,
                paymentMethod === PAYMENT_METHODS.RAZORPAY && styles.selectedPaymentIcon
              ]}>
                <Ionicons
                  name="card"
                  size={20}
                  color={paymentMethod === PAYMENT_METHODS.RAZORPAY ? COLORS.white : COLORS.gray}
                />
              </View>
              <View>
                <Text style={styles.paymentTitle}>Online Payment</Text>
                <Text style={styles.paymentSubtitle}>UPI, Card, Wallet</Text>
              </View>
            </View>
            {paymentMethod === PAYMENT_METHODS.RAZORPAY && (
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Order Summary Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="receipt" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.sectionTitle}>Order Summary</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items ({String(cart.length)})</Text>
              <Text style={styles.summaryValue}>₹{String(getCartTotal())}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>₹40</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹{String(getCartTotal() + 40)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomContainer}>
        <View style={styles.bottomSummary}>
          <View>
            <Text style={styles.bottomLabel}>Total Amount</Text>
            <Text style={styles.bottomValue}>₹{String(getCartTotal() + 40)}</Text>
          </View>
          <TouchableOpacity
            style={[styles.placeOrderButton, loading && styles.disabledButton]}
            onPress={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <Text style={styles.placeOrderText}>Place Order</Text>
                <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  section: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 99, 71, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  loadingText: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  addressCard: {
    padding: SPACING.md,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  addressLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  addressSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  phoneText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginLeft: 6,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  defaultBadgeText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 99, 71, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  noAddressCard: {
    padding: SPACING.xl,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    alignItems: 'center',
  },
  noAddressTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  noAddressText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 24,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addAddressButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    fontWeight: '700',
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: SPACING.sm,
    paddingVertical: SPACING.xs,
    gap: 6,
  },
  changeButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  selectedPayment: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(255, 99, 71, 0.05)',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  selectedPaymentIcon: {
    backgroundColor: COLORS.primary,
  },
  paymentTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  paymentSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  summaryCard: {
    padding: SPACING.md,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  summaryValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#dee2e6',
    marginVertical: SPACING.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  bottomSpacing: {
    height: 100,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  bottomValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  placeOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 24,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  placeOrderText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
});

export default CheckoutScreen;
