import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { menuAPI, fishAPI } from '../../utils/api';
import { useCart } from '../../context/CartContext';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../../constants/Colors';

const HomeScreen = ({ navigation }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [gameEnabled, setGameEnabled] = useState(false);
  const { cart, addToCart, getCartCount, getCartTotal, clearCart } = useCart();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch menu items - show error if this fails
    try {
      const menuResponse = await menuAPI.getAll();
      if (menuResponse.data.success) {
        const items = menuResponse.data.menuItems;
        setMenuItems(items);
        setFilteredItems(items);

        // Extract unique categories
        const uniqueCategories = ['All', ...new Set(items.map(item => item.category).filter(Boolean))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch menu',
      });
    }

    // Fetch fish game settings - silent fail (optional feature)
    try {
      const fishResponse = await fishAPI.getGameSettings();
      if (fishResponse.data.success) {
        setGameEnabled(fishResponse.data.gameSettings.fishingGameEnabled);
      }
    } catch (error) {
      // Silent fail - fishing game is optional
      console.log('Fish game settings unavailable');
    }

    setLoading(false);
    setRefreshing(false);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    if (category === 'All') {
      setFilteredItems(menuItems);
    } else {
      setFilteredItems(menuItems.filter(item => item.category === category));
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleAddToCart = (item) => {
    if (item.stock > 0) {
      addToCart(item);
      Toast.show({
        type: 'success',
        text1: 'Added to cart',
        text2: `${item.name} added to cart`,
        visibilityTime: 2000,
      });
    }
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => clearCart(),
        },
      ]
    );
  };

  const renderMenuItem = ({ item }) => {
    const isVeg = item.isVeg !== false; // Default to veg if not specified

    return (
      <TouchableOpacity
        style={styles.menuCard}
        onPress={() => navigation.navigate('MenuItemDetail', { item })}
        activeOpacity={0.9}
      >
        {/* Image Container */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.itemImage} />

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

        {/* Content */}
        <View style={styles.itemContent}>
          <Text style={styles.itemName} numberOfLines={1}>
            {String(item.name || 'Unnamed')}
          </Text>

          {item.description ? (
            <Text style={styles.itemDescription} numberOfLines={2}>
              {String(item.description)}
            </Text>
          ) : null}

          {item.category ? (
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{String(item.category)}</Text>
            </View>
          ) : null}

          {/* Price and Add Button Row */}
          <View style={styles.itemFooter}>
            <Text style={styles.itemPrice}>₹{String(item.price || 0)}</Text>

            {item.stock > 0 ? (
              <TouchableOpacity
                style={styles.addButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleAddToCart(item);
                }}
              >
                <Ionicons name="add" size={24} color={COLORS.white} />
              </TouchableOpacity>
            ) : (
              <View style={styles.outOfStockBadge}>
                <Text style={styles.outOfStockText}>Out</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.brandName}>FoodCart</Text>
          </View>

          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <Ionicons name="cart-outline" size={28} color={COLORS.white} />
            {getCartCount() > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{String(getCartCount())}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={cart.length > 0 ? styles.scrollViewWithCart : null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Promotional Banner */}
        {gameEnabled && (
          <TouchableOpacity
            style={styles.bannerContainer}
            onPress={() => navigation.navigate('FishingGame')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[COLORS.gradientStart, COLORS.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.promoBanner}
            >
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>Catch Fresh Fish Daily!</Text>
                <Text style={styles.bannerDescription}>
                  Try your luck and catch the freshest fish of the day. Choose your preparation style and enjoy the best seafood delivered to your door!
                </Text>
              </View>
              <View style={styles.bannerIcon}>
                <Text style={styles.fishEmoji}>🎣</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Category Filter */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryCard,
                  selectedCategory === category && styles.categoryCardActive,
                ]}
                onPress={() => handleCategorySelect(category)}
                activeOpacity={0.7}
              >
                <Text style={styles.categoryIcon}>
                  {category === 'All' ? '🍽️' : category === 'Starters' ? '🥗' : category === 'Main Course' ? '🍛' : category === 'Desserts' ? '🍰' : category === 'Beverages' ? '🥤' : '🍴'}
                </Text>
                <Text
                  style={[
                    styles.categoryName,
                    selectedCategory === category && styles.categoryNameActive,
                  ]}
                >
                  {String(category)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Menu Items Grid */}
        <View style={styles.menuSection}>
          {filteredItems.length > 0 ? (
            <View style={styles.menuGrid}>
              {filteredItems.map((item) => (
                <View key={item._id} style={styles.menuItemWrapper}>
                  {renderMenuItem({ item })}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="restaurant-outline" size={80} color={COLORS.border} />
              <Text style={styles.emptyText}>
                {selectedCategory === 'All' ? 'No menu items available' : `No items in ${String(selectedCategory)}`}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Mobile Checkout Bar */}
      {cart.length > 0 && (
        <View style={styles.mobileCheckoutBar}>
          <View style={styles.checkoutBarContent}>
            {/* Item Thumbnail with Badge */}
            <View style={styles.thumbnailContainer}>
              <Image
                source={{ uri: cart[0].image }}
                style={styles.cartThumbnail}
              />
              {cart.length > 1 && (
                <View style={styles.itemCountBadge}>
                  <Text style={styles.itemCountText}>{String(cart.length)}</Text>
                </View>
              )}
            </View>

            {/* Item Info */}
            <View style={styles.checkoutInfo}>
              <Text style={styles.checkoutItemCount}>
                {String(cart.length)} item{cart.length > 1 ? 's' : ''}
              </Text>
              <Text style={styles.checkoutPrice}>₹{String(getCartTotal())}</Text>
            </View>

            {/* Checkout Button */}
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => navigation.navigate('Cart')}
            >
              <Text style={styles.checkoutButtonText}>Checkout</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
            </TouchableOpacity>

            {/* Delete Button */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleClearCart}
            >
              <Ionicons name="trash-outline" size={22} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        </View>
      )}
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

  // Header Styles
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    ...SHADOWS.medium,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  brandName: {
    fontSize: 26,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  cartButton: {
    position: 'relative',
    padding: SPACING.xs,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.round,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  cartBadgeText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
  },

  scrollView: {
    flex: 1,
  },

  // Promotional Banner
  bannerContainer: {
    margin: SPACING.lg,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  promoBanner: {
    flexDirection: 'row',
    padding: SPACING.xxxl,
    borderRadius: RADIUS.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  bannerContent: {
    flex: 1,
    zIndex: 2,
  },
  bannerTitle: {
    fontSize: FONT_SIZE.hero,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  bannerDescription: {
    fontSize: FONT_SIZE.md,
    color: COLORS.white,
    opacity: 0.95,
    lineHeight: 22,
  },
  bannerIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.lg,
  },
  fishEmoji: {
    fontSize: 64,
  },

  // Categories Section
  categoriesSection: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.title,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.dark,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  categoriesContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  categoryCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 100,
    alignItems: 'center',
    gap: SPACING.sm,
    ...SHADOWS.small,
  },
  categoryCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(255, 107, 53, 0.05)',
  },
  categoryIcon: {
    fontSize: 40,
  },
  categoryName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    textAlign: 'center',
  },
  categoryNameActive: {
    color: COLORS.primary,
  },

  // Menu Section
  menuSection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  menuItemWrapper: {
    width: '50%',
    padding: SPACING.xs,
  },

  // Menu Card
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 140,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.lightGray,
  },
  vegBadge: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.xl,
    ...SHADOWS.small,
  },
  vegBadgeText: {
    fontSize: 14,
  },
  discountBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  discountText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Item Content
  itemContent: {
    padding: SPACING.md,
  },
  itemName: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.dark,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMedium,
    marginBottom: SPACING.sm,
    lineHeight: 16,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  categoryTagText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMedium,
    fontWeight: FONT_WEIGHT.medium,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  itemPrice: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 44,
    height: 44,
    borderRadius: RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.button,
  },
  outOfStockBadge: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  outOfStockText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    fontWeight: FONT_WEIGHT.semibold,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: FONT_SIZE.base,
    color: COLORS.textLight,
    marginTop: SPACING.lg,
  },

  // ScrollView with cart
  scrollViewWithCart: {
    paddingBottom: 100,
  },

  // Mobile Checkout Bar
  mobileCheckoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...SHADOWS.large,
  },
  checkoutBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  thumbnailContainer: {
    position: 'relative',
  },
  cartThumbnail: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  itemCountBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.round,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  itemCountText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
  checkoutInfo: {
    flex: 1,
    marginLeft: SPACING.xs,
  },
  checkoutItemCount: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMedium,
    marginBottom: 2,
  },
  checkoutPrice: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.dark,
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    gap: 6,
    ...SHADOWS.button,
  },
  checkoutButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
  deleteButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
});

export default HomeScreen;
