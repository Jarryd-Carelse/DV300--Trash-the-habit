import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import FloatingNavbar from '../components/FloatingNavbar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SPACING } from '../constants/theme';
import { getUserSettings, saveUserSettings, clearAllData } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';

// Move SettingItem outside to prevent recreation on every render
const SettingItem = React.memo(({ title, subtitle, icon, onPress, showSwitch = false, switchValue = false, onSwitchChange, index = 0 }) => {
  const itemAnim = useRef(new Animated.Value(0)).current;
  const iconAnim = useRef(new Animated.Value(0)).current;
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Only animate once when the screen first loads
    if (!hasAnimated.current) {
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(itemAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(iconAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
        hasAnimated.current = true;
      }, index * 100);
    } else {
      // If already animated, set to final state immediately
      itemAnim.setValue(1);
      iconAnim.setValue(1);
    }
  }, []);

  const iconScale = iconAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  return (
    <Animated.View
      style={{
        opacity: itemAnim,
        transform: [
          { translateY: itemAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [30, 0],
          })}
        ]
      }}
    >
      <TouchableOpacity 
        style={styles.settingItem} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.settingLeft}>
          <Animated.View 
            style={[
              styles.iconContainer,
              { transform: [{ scale: iconScale }] }
            ]}
          >
            <Ionicons name={icon} size={20} color={COLORS.primary} />
          </Animated.View>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>{title}</Text>
            {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
          </View>
        </View>
        
        {showSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: COLORS.lightGray, true: COLORS.primary + '40' }}
            thumbColor={switchValue ? COLORS.primary : COLORS.gray}
          />
        ) : (
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

const SettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    navbarPosition: 'right',
    soundEnabled: true,
    hapticsEnabled: true,
    notificationsEnabled: true,
  });
  const [currentRoute, setCurrentRoute] = useState('Settings');
  const { logout } = useAuth();

  // Twinning animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const switchAnim = useRef(new Animated.Value(1)).current;

  // Load settings when component mounts
  useEffect(() => {
    loadSettings();
  }, []);

  // Play entrance animations only when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      return () => {
        // Reset animations when leaving screen
        fadeAnim.setValue(0);
        slideAnim.setValue(50);
      };
    }, [])
  );

  const loadSettings = async () => {
    try {
      const userSettings = await getUserSettings();
      if (userSettings) {
        setSettings(userSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleNavigation = (routeName) => {
    setCurrentRoute(routeName);
    navigation.navigate(routeName);
  };

  const updateSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Switch toggle animation
    Animated.sequence([
      Animated.timing(switchAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(switchAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    await saveUserSettings(newSettings);
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your habits and progress. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Success', 'All data has been cleared');
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await logout();
              if (result.success) {
                // Logout successful, user will be automatically redirected to login screen
                // by the AuthContext
              } else {
                Alert.alert('Error', result.error || 'Logout failed. Please try again.');
              }
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Logout failed. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Customize your experience</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
          >
            <Ionicons name="person-circle" size={32} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Navigation</Text>
          <SettingItem
            title="Navbar Position"
            subtitle="Choose where the navigation bar appears"
            icon="navigate"
            onPress={() => {
              const newPosition = settings.navbarPosition === 'right' ? 'left' : 'right';
              updateSetting('navbarPosition', newPosition);
            }}
            index={0}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <SettingItem
            title="Sound Effects"
            subtitle="Enable or disable sound feedback"
            icon="volume-high"
            showSwitch
            switchValue={settings.soundEnabled}
            onSwitchChange={(value) => updateSetting('soundEnabled', value)}
            index={1}
          />
          <SettingItem
            title="Haptic Feedback"
            subtitle="Enable or disable vibration feedback"
            icon="phone-portrait"
            showSwitch
            switchValue={settings.hapticsEnabled}
            onSwitchChange={(value) => updateSetting('hapticsEnabled', value)}
            index={2}
          />
          <SettingItem
            title="Notifications"
            subtitle="Enable or disable push notifications"
            icon="notifications"
            showSwitch
            switchValue={settings.notificationsEnabled}
            onSwitchChange={(value) => updateSetting('notificationsEnabled', value)}
            index={3}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <SettingItem
            title="Clear All Data"
            subtitle="Delete all habits and progress"
            icon="trash"
            onPress={handleClearAllData}
            index={4}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingItem
            title="Logout"
            subtitle="Sign out of your account"
            icon="log-out"
            onPress={handleLogout}
            index={5}
          />
        </View>
      </ScrollView>

      <FloatingNavbar
        currentRoute={currentRoute}
        onNavigate={handleNavigation}
        position={settings.navbarPosition}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
    alignItems: 'center',
    marginRight: -SPACING.xl,
  },
  title: {
    ...FONTS.bold,
    fontSize: SIZES.extraLarge,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  profileButton: {
    paddingLeft: SPACING.xxs,
    paddingRight: SPACING.xs,
    paddingVertical: SPACING.sm,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...FONTS.bold,
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.lg,
    marginTop: SPACING.lg,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  settingSubtitle: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  versionText: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  copyrightText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
});

export default SettingsScreen; 