import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

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
        return [...prevCart, {
          ...item,
          quantity: 1,
          variant,
          displayName: `${item.name} (${variant.preparation}) - ${variant.weight}kg`,
          finalPrice: (variant.weight * variant.pricePerKg) + variant.preparationPrice
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

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(i => i._id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(i =>
        i._id === itemId ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      // Fish items with variants use finalPrice
      const itemPrice = item.variant ? item.finalPrice : item.price;
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount
    }}>
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
