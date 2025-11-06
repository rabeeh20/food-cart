import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import MenuItemDetailScreen from '../screens/home/MenuItemDetailScreen';
import CartScreen from '../screens/home/CartScreen';
import CheckoutScreen from '../screens/home/CheckoutScreen';
import FishingGameScreen from '../screens/home/FishingGameScreen';

const Stack = createNativeStackNavigator();

const HomeNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MenuItemDetail"
        component={MenuItemDetailScreen}
        options={{ title: 'Item Details' }}
      />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: 'Shopping Cart' }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ title: 'Checkout' }}
      />
      <Stack.Screen
        name="FishingGame"
        component={FishingGameScreen}
        options={{ title: 'Fishing Game' }}
      />
    </Stack.Navigator>
  );
};

export default HomeNavigator;
