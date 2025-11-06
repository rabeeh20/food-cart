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
import Toast from 'react-native-toast-message';
import { useCart } from '../../context/CartContext';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

const MenuItemDetailScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

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
      <ScrollView>
        <Image source={{ uri: item.image }} style={styles.image} />

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.name}>{String(item.name || 'Unnamed Item')}</Text>
              <Text style={styles.category}>{String(item.category || 'Uncategorized')}</Text>
            </View>
            {item.rating ? (
              <View style={styles.rating}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{String(item.rating)}</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.price}>₹{String(item.price || 0)}</Text>

          {item.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{String(item.description)}</Text>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Availability</Text>
            <View style={styles.stockInfo}>
              {item.stock > 0 ? (
                <>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                  <Text style={styles.stockText}>{String(item.stock)} items in stock</Text>
                </>
              ) : (
                <>
                  <Ionicons name="close-circle" size={20} color={COLORS.error} />
                  <Text style={[styles.stockText, styles.outOfStock]}>Out of Stock</Text>
                </>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Quantity</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={decrementQuantity}
              disabled={quantity <= 1}
            >
              <Ionicons name="remove" size={20} color={quantity <= 1 ? COLORS.gray : COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{String(quantity)}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={incrementQuantity}
              disabled={quantity >= item.stock}
            >
              <Ionicons name="add" size={20} color={quantity >= item.stock ? COLORS.gray : COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.addButton, item.stock <= 0 && styles.disabledButton]}
          onPress={handleAddToCart}
          disabled={item.stock <= 0}
        >
          <Text style={styles.addButtonText}>
            {item.stock > 0 ? `Add to Cart - ₹${String(item.price * quantity)}` : 'Out of Stock'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: COLORS.lightGray,
  },
  content: {
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  headerLeft: {
    flex: 1,
  },
  name: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  category: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  price: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    lineHeight: 22,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.success,
    fontWeight: '500',
  },
  outOfStock: {
    color: COLORS.error,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  quantityLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginHorizontal: SPACING.lg,
    minWidth: 30,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.gray,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});

export default MenuItemDetailScreen;
