import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { orderAPI } from '../../utils/api';
import { useSocket } from '../../context/SocketContext';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS, STATUS_COLORS } from '../../constants/Colors';

const OrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { onEvent, offEvent } = useSocket();

  useEffect(() => {
    fetchOrders();

    // Listen for order status updates
    onEvent('order-status-changed', handleOrderUpdate);

    return () => {
      offEvent('order-status-changed', handleOrderUpdate);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getMyOrders();
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch orders',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleOrderUpdate = (updatedOrder) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order._id === updatedOrder._id ? updatedOrder : order
      )
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusColor = (status) => {
    return STATUS_COLORS[status] || COLORS.textMedium;
  };

  const getStatusBadgeStyle = (status) => {
    const styles = {
      placed: { bg: 'rgba(255, 107, 53, 0.1)', text: COLORS.primary },
      confirmed: { bg: 'rgba(255, 107, 53, 0.1)', text: COLORS.primary },
      preparing: { bg: COLORS.warningLight, text: '#856404' },
      ready: { bg: COLORS.warningLight, text: '#856404' },
      out_for_delivery: { bg: COLORS.warningLight, text: '#856404' },
      delivered: { bg: COLORS.successLight, text: COLORS.success },
      cancelled: { bg: COLORS.dangerLight, text: COLORS.danger },
    };
    return styles[status] || { bg: COLORS.lightGray, text: COLORS.textMedium };
  };

  const getStatusText = (status) => {
    const text = {
      placed: 'PLACED',
      confirmed: 'CONFIRMED',
      preparing: 'PREPARING',
      ready: 'READY',
      out_for_delivery: 'OUT FOR DELIVERY',
      delivered: 'DELIVERED',
      cancelled: 'CANCELLED',
    };
    return text[status] || status.toUpperCase();
  };

  const getStatusIcon = (status) => {
    const icons = {
      placed: 'checkmark-circle',
      confirmed: 'checkmark-done-circle',
      preparing: 'timer',
      ready: 'checkmark-done',
      out_for_delivery: 'bicycle',
      delivered: 'checkmark-circle',
      cancelled: 'close-circle',
    };
    return icons[status] || 'help-circle';
  };

  const isActiveOrder = (status) => {
    return ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(status);
  };

  const renderOrderItem = ({ item }) => {
    const statusStyle = getStatusBadgeStyle(item.orderStatus);
    const borderColor = getStatusColor(item.orderStatus);
    const isActive = isActiveOrder(item.orderStatus);

    return (
      <View style={[styles.orderCard, { borderLeftColor: borderColor }]}>
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.orderIdRow}>
              <Text style={styles.orderId}>#{item.orderId}</Text>
              {isActive && (
                <View style={styles.liveIndicator}>
                  <View style={styles.pulsingDot} />
                  <Text style={styles.liveText}>Live</Text>
                </View>
              )}
            </View>
            <Text style={styles.orderDate}>
              {new Date(item.createdAt).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {getStatusText(item.orderStatus)}
            </Text>
          </View>
        </View>

        {/* Status Timeline */}
        <View style={styles.statusTimeline}>
          <View style={styles.iconCircle}>
            <Ionicons name={getStatusIcon(item.orderStatus)} size={20} color={borderColor} />
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>
              {item.orderStatus === 'delivered' ? 'Order Delivered' :
               item.orderStatus === 'cancelled' ? 'Order Cancelled' :
               item.orderStatus === 'out_for_delivery' ? 'On the way' :
               item.orderStatus === 'preparing' ? 'Being prepared' :
               'Order confirmed'}
            </Text>
            <Text style={styles.timelineSubtitle}>
              {item.orderStatus === 'delivered' ? 'Your order has been delivered successfully' :
               item.orderStatus === 'cancelled' ? 'This order has been cancelled' :
               item.orderStatus === 'out_for_delivery' ? 'Your order is on the way' :
               'Your order is being prepared'}
            </Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.orderItems}>
          <Text style={styles.itemsTitle}>Order Items ({String(item.items.length)})</Text>
          <View style={styles.itemsList}>
            {item.items.slice(0, 3).map((orderItem, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemDot} />
                <Text style={styles.itemText}>
                  {String(orderItem.quantity)}x {orderItem.menuItem?.name || 'Item'}
                </Text>
              </View>
            ))}
            {item.items.length > 3 && (
              <Text style={styles.moreText}>
                and {String(item.items.length - 3)} more item{item.items.length - 3 > 1 ? 's' : ''}
              </Text>
            )}
          </View>
        </View>

        {/* Order Footer */}
        <View style={styles.orderFooter}>
          <View style={styles.footerLeft}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalText}>₹{String(item.totalAmount)}</Text>
          </View>

          <View style={styles.paymentBadge}>
            <Ionicons
              name={item.paymentMethod === 'cod' ? 'cash' : 'card'}
              size={14}
              color={COLORS.textMedium}
            />
            <Text style={styles.paymentMethod}>
              {item.paymentMethod === 'cod' ? 'COD' : 'Online'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="receipt-outline" size={80} color={COLORS.primary} />
        </View>
        <Text style={styles.emptyText}>No orders yet</Text>
        <Text style={styles.emptySubtext}>Your order history will appear here</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Orders</Text>
          <Text style={styles.subtitle}>{String(orders.length)} order{orders.length > 1 ? 's' : ''}</Text>
        </View>
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  title: {
    fontSize: FONT_SIZE.title,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.dark,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMedium,
    marginTop: 2,
  },

  listContainer: {
    padding: SPACING.lg,
  },

  // Order Card
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    ...SHADOWS.small,
  },

  // Order Header
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  headerLeft: {
    flex: 1,
    marginRight: SPACING.md,
  },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 4,
  },
  orderId: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.dark,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.successLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.xl,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  liveText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.success,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  orderDate: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMedium,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.xl,
  },
  statusText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 0.5,
  },

  // Status Timeline
  statusTimeline: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.lightGray,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.dark,
    marginBottom: 2,
  },
  timelineSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMedium,
    lineHeight: 18,
  },

  // Order Items
  orderItems: {
    marginBottom: SPACING.lg,
  },
  itemsTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.dark,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemsList: {
    gap: SPACING.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  itemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  itemText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.dark,
    fontWeight: FONT_WEIGHT.medium,
  },
  moreText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMedium,
    fontStyle: 'italic',
    marginLeft: 18,
  },

  // Order Footer
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerLeft: {
    flex: 1,
  },
  totalLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMedium,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalText: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  paymentMethod: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMedium,
    fontWeight: FONT_WEIGHT.semibold,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxxl,
    backgroundColor: COLORS.background,
  },
  emptyIconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZE.title,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.dark,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: FONT_SIZE.base,
    color: COLORS.textMedium,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default OrdersScreen;
