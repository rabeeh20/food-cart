import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';
import {
  requestNotificationPermission,
  requestLocationPermission,
  checkNotificationPermission,
  checkLocationPermission,
} from '../../utils/permissions';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const notifStatus = await checkNotificationPermission();
    const locStatus = await checkLocationPermission();
    setNotificationEnabled(notifStatus);
    setLocationEnabled(locStatus);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const handleEditProfile = () => {
    Toast.show({
      type: 'info',
      text1: 'Coming Soon',
      text2: 'Edit profile feature will be available soon',
    });
  };

  const handleMyAddresses = () => {
    Toast.show({
      type: 'info',
      text1: 'Coming Soon',
      text2: 'Address management will be available soon',
    });
  };

  const handlePaymentMethods = () => {
    Toast.show({
      type: 'info',
      text1: 'Coming Soon',
      text2: 'Saved payment methods will be available soon',
    });
  };

  const handleNotifications = async () => {
    Alert.alert(
      'Notification Settings',
      notificationEnabled
        ? 'Notifications are enabled. You will receive order updates.'
        : 'Would you like to enable notifications to receive order updates?',
      notificationEnabled
        ? [
            { text: 'OK' },
            {
              text: 'Manage Permissions',
              onPress: () => Linking.openSettings(),
            },
          ]
        : [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Enable',
              onPress: async () => {
                const granted = await requestNotificationPermission();
                if (granted) {
                  setNotificationEnabled(true);
                  Toast.show({
                    type: 'success',
                    text1: 'Notifications Enabled',
                    text2: 'You will now receive order updates',
                  });
                }
              },
            },
          ]
    );
  };

  const handleLocation = async () => {
    Alert.alert(
      'Location Access',
      locationEnabled
        ? 'Location access is enabled for accurate delivery estimates.'
        : 'Would you like to enable location access for accurate delivery estimates?',
      locationEnabled
        ? [
            { text: 'OK' },
            {
              text: 'Manage Permissions',
              onPress: () => Linking.openSettings(),
            },
          ]
        : [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Enable',
              onPress: async () => {
                const granted = await requestLocationPermission();
                if (granted) {
                  setLocationEnabled(true);
                  Toast.show({
                    type: 'success',
                    text1: 'Location Enabled',
                    text2: 'We can now provide accurate delivery estimates',
                  });
                }
              },
            },
          ]
    );
  };

  const handleLanguage = () => {
    Toast.show({
      type: 'info',
      text1: 'Coming Soon',
      text2: 'Language selection will be available soon',
    });
  };

  const handleHelpSupport = () => {
    Alert.alert(
      'Help & Support',
      'Choose an option:',
      [
        {
          text: 'Call Support',
          onPress: () => Linking.openURL('tel:+1234567890'),
        },
        {
          text: 'Email Support',
          onPress: () => Linking.openURL('mailto:support@foodcart.com'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleTermsConditions = () => {
    Alert.alert(
      'Terms & Conditions',
      'This would open the Terms & Conditions page. Implementation coming soon.',
      [{ text: 'OK' }]
    );
  };

  const handlePrivacyPolicy = () => {
    Alert.alert(
      'Privacy Policy',
      'This would open the Privacy Policy page. Implementation coming soon.',
      [{ text: 'OK' }]
    );
  };

  const MenuOption = ({ icon, title, onPress, color = COLORS.text }) => (
    <TouchableOpacity style={styles.menuOption} onPress={onPress}>
      <View style={styles.menuLeft}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={[styles.menuText, { color }]}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={50} color={COLORS.white} />
        </View>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.menuContainer}>
          <MenuOption
            icon="person-outline"
            title="Edit Profile"
            onPress={handleEditProfile}
          />
          <MenuOption
            icon="location-outline"
            title="My Addresses"
            onPress={handleMyAddresses}
          />
          <MenuOption
            icon="card-outline"
            title="Payment Methods"
            onPress={handlePaymentMethods}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.menuContainer}>
          <MenuOption
            icon="notifications-outline"
            title="Notifications"
            onPress={handleNotifications}
          />
          <MenuOption
            icon="location-outline"
            title="Location Access"
            onPress={handleLocation}
          />
          <MenuOption
            icon="language-outline"
            title="Language"
            onPress={handleLanguage}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.menuContainer}>
          <MenuOption
            icon="help-circle-outline"
            title="Help & Support"
            onPress={handleHelpSupport}
          />
          <MenuOption
            icon="document-text-outline"
            title="Terms & Conditions"
            onPress={handleTermsConditions}
          />
          <MenuOption
            icon="shield-outline"
            title="Privacy Policy"
            onPress={handlePrivacyPolicy}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  userName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    opacity: 0.9,
  },
  section: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textLight,
    marginLeft: SPACING.md,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
  },
  menuContainer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.lightGray,
  },
  menuOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: FONT_SIZES.md,
    marginLeft: SPACING.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    margin: SPACING.lg,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  logoutText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.error,
    marginLeft: SPACING.sm,
  },
  footer: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  versionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
});

export default ProfileScreen;
