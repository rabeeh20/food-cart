import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCart, saveCart, clearCart as clearStorageCart } from '../utils/storage';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cart from storage on mount
  useEffect(() => {
    loadCart();
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    if (!loading) {
      saveCart(cart);
    }
  }, [cart, loading]);

  const loadCart = async () => {
    try {
      const storedCart = await getCart();
      setCart(storedCart);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item, variant = null) => {
    setCart(prevCart => {
      // For fish with variants, create unique identifier
      if (variant) {
        const existingItem = prevCart.find(i =>
          i._id === item._id &&
          i.variant?.preparation === variant.preparation &&
          i.variant?.weight === variant.weight
        );

        if (existingItem) {
          return prevCart.map(i =>
            (i._id === item._id &&
             i.variant?.preparation === variant.preparation &&
             i.variant?.weight === variant.weight)
              ? { ...i, quantity: i.quantity + 1 }
              : i
          );
        }

        // Add new fish with variant
        const calculatedPrice = (variant.weight * variant.pricePerKg) + variant.preparationPrice;
        return [...prevCart, {
          ...item,
          quantity: 1,
          variant,
          name: `${item.name} (${variant.preparation}) - ${variant.weight}kg`,
          price: calculatedPrice
        }];
      }

      // Regular menu items (non-fish)
      const existingItem = prevCart.find(i => i._id === item._id && !i.variant);
      if (existingItem) {
        return prevCart.map(i =>
          (i._id === item._id && !i.variant)
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId, variant = null) => {
    setCart(prevCart => {
      if (variant) {
        // Remove specific fish variant
        return prevCart.filter(i => !(
          i._id === itemId &&
          i.variant?.preparation === variant.preparation &&
          i.variant?.weight === variant.weight
        ));
      }
      // Remove all items with this ID (including variants)
      return prevCart.filter(i => i._id !== itemId);
    });
  };

  const updateQuantity = (itemId, quantity, variant = null) => {
    if (quantity <= 0) {
      removeFromCart(itemId, variant);
      return;
    }

    setCart(prevCart =>
      prevCart.map(i => {
        if (variant) {
          // Update specific variant
          if (i._id === itemId &&
              i.variant?.preparation === variant.preparation &&
              i.variant?.weight === variant.weight) {
            return { ...i, quantity };
          }
        } else if (i._id === itemId && !i.variant) {
          // Update regular item
          return { ...i, quantity };
        }
        return i;
      })
    );
  };

  const clearCartData = async () => {
    setCart([]);
    await clearStorageCart();
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart: clearCartData,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
