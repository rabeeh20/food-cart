import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { useCart } from '../../context/CartContext';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../../constants/Colors';

const MenuItemDetailScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const isVeg = item.isVeg !== false;

  const handleAddToCart = () => {
    if (item.stock <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Out of Stock',
        text2: 'This item is currently unavailable',
      });
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart(item);
    }

    Toast.show({
      type: 'success',
      text1: 'Added to Cart',
      text2: `${quantity}x ${item.name} added to cart`,
    });

    navigation.goBack();
  };

  const incrementQuantity = () => {
    if (quantity < item.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Large Image with Badges */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.image} />

          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
          </TouchableOpacity>

          {/* Veg/Non-Veg Badge */}
          <View style={styles.vegBadge}>
            <Text style={styles.vegBadgeText}>{isVeg ? '🟢' : '🔴'}</Text>
          </View>

          {/* Discount Badge */}
          {item.discount && item.discount > 0 ? (
            <LinearGradient
              colors={[COLORS.danger, '#C82333']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.discountBadge}
            >
              <Text style={styles.discountText}>{String(item.discount)}% OFF</Text>
            </LinearGradient>
          ) : null}
        </View>

        {/* Content Card */}
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.name}>{String(item.name || 'Unnamed Item')}</Text>

              {item.category ? (
                <View style={styles.categoryTag}>
                  <Text style={styles.categoryTagText}>{String(item.category)}</Text>
                </View>
              ) : null}
            </View>

            {item.rating ? (
              <View style={styles.ratingContainer}>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= item.rating ? 'star' : 'star-outline'}
                      size={16}
                      color={star <= item.rating ? COLORS.primary : COLORS.border}
                    />
                  ))}
                </View>
                <Text style={styles.ratingText}>{String(item.rating)}/5</Text>
              </View>
            ) : null}
          </View>

          {/* Price */}
          <Text style={styles.price}>₹{String(item.price || 0)}</Text>

          {/* Description */}
          {item.description ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.iconCircle}>
                  <Ionicons name="information-circle" size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.sectionTitle}>Description</Text>
              </View>
              <Text style={styles.description}>{String(item.description)}</Text>
            </View>
          ) : null}

          {/* Availability */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconCircle}>
                <Ionicons name="cube" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.sectionTitle}>Availability</Text>
            </View>
            <View style={styles.stockInfo}>
              {item.stock > 0 ? (
                <>
                  <View style={[styles.statusBadge, styles.statusBadgeSuccess]}>
                    <Text style={[styles.statusBadgeText, styles.statusBadgeTextSuccess]}>
                      IN STOCK
                    </Text>
                  </View>
                  <Text style={styles.stockText}>{String(item.stock)} items available</Text>
                </>
              ) : (
                <View style={[styles.statusBadge, styles.statusBadgeDanger]}>
                  <Text style={[styles.statusBadgeText, styles.statusBadgeTextDanger]}>
                    OUT OF STOCK
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Quantity Selector */}
          {item.stock > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.iconCircle}>
                  <Ionicons name="layers" size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.sectionTitle}>Quantity</Text>
              </View>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                  onPress={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <Ionicons
                    name="remove"
                    size={20}
                    color={quantity <= 1 ? COLORS.textLight : COLORS.white}
                  />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{String(quantity)}</Text>
                <TouchableOpacity
                  style={[styles.quantityButton, quantity >= item.stock && styles.quantityButtonDisabled]}
                  onPress={incrementQuantity}
                  disabled={quantity >= item.stock}
                >
                  <Ionicons
                    name="add"
                    size={20}
                    color={quantity >= item.stock ? COLORS.textLight : COLORS.white}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom CTA Button */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <View style={styles.priceInfo}>
            <Text style={styles.totalLabel}>Total Price</Text>
            <Text style={styles.totalPrice}>₹{String(item.price * quantity)}</Text>
          </View>

          <TouchableOpacity
            style={[styles.addButton, item.stock <= 0 && styles.disabledButton]}
            onPress={handleAddToCart}
            disabled={item.stock <= 0}
          >
            <Ionicons name="cart" size={20} color={COLORS.white} />
            <Text style={styles.addButtonText}>
              {item.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },

  // Image Section
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.lightGray,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: SPACING.lg,
    backgroundColor: COLORS.white,
    width: 40,
    height: 40,
    borderRadius: RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  vegBadge: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.lg,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.xl,
    ...SHADOWS.small,
  },
  vegBadgeText: {
    fontSize: 16,
  },
  discountBadge: {
    position: 'absolute',
    top: 50,
    right: SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  discountText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Content Section
  content: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    marginTop: -SPACING.lg,
    padding: SPACING.xl,
    ...SHADOWS.small,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flex: 1,
    marginRight: SPACING.md,
  },
  name: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.dark,
    marginBottom: SPACING.sm,
    lineHeight: 32,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  categoryTagText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMedium,
    fontWeight: FONT_WEIGHT.semibold,
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMedium,
    fontWeight: FONT_WEIGHT.medium,
  },
  price: {
    fontSize: 32,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xl,
  },

  // Section Styles
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.round,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.dark,
  },
  description: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textMedium,
    lineHeight: 24,
    paddingLeft: 44,
  },

  // Stock Info
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 44,
    gap: SPACING.md,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.xl,
  },
  statusBadgeSuccess: {
    backgroundColor: COLORS.successLight,
  },
  statusBadgeDanger: {
    backgroundColor: COLORS.dangerLight,
  },
  statusBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 0.5,
  },
  statusBadgeTextSuccess: {
    color: COLORS.success,
  },
  statusBadgeTextDanger: {
    color: COLORS.danger,
  },
  stockText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMedium,
    fontWeight: FONT_WEIGHT.medium,
  },

  // Quantity Controls
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 44,
    gap: SPACING.lg,
  },
  quantityButton: {
    backgroundColor: COLORS.primary,
    width: 44,
    height: 44,
    borderRadius: RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.button,
  },
  quantityButtonDisabled: {
    backgroundColor: COLORS.lightGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  quantityText: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.dark,
    minWidth: 40,
    textAlign: 'center',
  },

  // Footer
  footer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.medium,
  },
  footerContent: {
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  priceInfo: {
    flex: 1,
  },
  totalLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMedium,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalPrice: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    ...SHADOWS.button,
  },
  disabledButton: {
    backgroundColor: COLORS.lightGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold,
  },
});

export default MenuItemDetailScreen;
