import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FloatingNavbar from '../components/FloatingNavbar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SPACING } from '../constants/theme';
import { getUserSettings, saveUserSettings, clearAllData, setLoginStatus } from '../utils/storage';

const SettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    navbarPosition: 'right',
    soundEnabled: true,
    hapticsEnabled: true,
    notificationsEnabled: true,
  });
  const [currentRoute, setCurrentRoute] = useState('Settings');

  useEffect(() => {
    loadSettings();
  }, []);

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
             
              await setLoginStatus(false);
              
             
              navigation.replace('Login');
            } catch (error) {
              console.error('Error during logout:', error);
             
              navigation.replace('Login');
            }
          },
        },
      ]
    );
  };

  const SettingItem = ({ title, subtitle, icon, onPress, showSwitch = false, switchValue = false, onSwitchChange }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={20} color={COLORS.primary} />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
          thumbColor={COLORS.white}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your experience</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Navigation</Text>
          <SettingItem
            title="Navbar Position"
            subtitle={settings.navbarPosition === 'right' ? 'Right-handed' : 'Left-handed'}
            icon="hand-left"
            onPress={() => {
              const newPosition = settings.navbarPosition === 'right' ? 'left' : 'right';
              updateSetting('navbarPosition', newPosition);
            }}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <SettingItem
            title="Sound Effects"
            subtitle="Play sounds for actions"
            icon="volume-high"
            showSwitch
            switchValue={settings.soundEnabled}
            onSwitchChange={(value) => updateSetting('soundEnabled', value)}
          />
          <SettingItem
            title="Haptic Feedback"
            subtitle="Vibrate on actions"
            icon="phone-portrait"
            showSwitch
            switchValue={settings.hapticsEnabled}
            onSwitchChange={(value) => updateSetting('hapticsEnabled', value)}
          />
          <SettingItem
            title="Notifications"
            subtitle="Receive reminders"
            icon="notifications"
            showSwitch
            switchValue={settings.notificationsEnabled}
            onSwitchChange={(value) => updateSetting('notificationsEnabled', value)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <SettingItem
            title="Clear All Data"
            subtitle="Delete all habits and progress"
            icon="trash"
            onPress={handleClearAllData}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingItem
            title="Logout"
            subtitle="Sign out of your account"
            icon="log-out"
            onPress={handleLogout}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>Trash the Habit v1.0.0</Text>
          <Text style={styles.copyrightText}>© 2024 Trash the Habit</Text>
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
  title: {
    ...FONTS.bold,
    fontSize: SIZES.extraLarge,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
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