import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import FloatingNavbar from '../components/FloatingNavbar';
import CustomAlert from '../components/CustomAlert';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SPACING } from '../constants/theme';
import { getUserSettings, saveUserSettings, clearAllData } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import { deleteUser, refreshUserSession } from '../config/firebase';

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
            trackColor={{ false: COLORS.border, true: COLORS.success + '40' }}
            thumbColor={switchValue ? COLORS.success : COLORS.gray}
            ios_backgroundColor={COLORS.border}
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
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
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
    if (!showPasswordInput) {
      // First show password input
      setShowPasswordInput(true);
      setAlertConfig({
        visible: true,
        title: 'Enter Password to Delete Account',
        message: 'Please enter your password to confirm account deletion. This action cannot be undone.',
        type: 'warning',
        showCancel: true,
        confirmText: 'Continue',
        cancelText: 'Cancel',
        onConfirm: () => {
          if (deletePassword.trim()) {
            performAccountDeletion(deletePassword);
          } else {
            setAlertConfig({
              visible: true,
              title: 'Error',
              message: 'Please enter your password',
              type: 'error',
            });
          }
        },
      });
    }
  };

  const performAccountDeletion = async (password) => {
    try {
      // First clear all local data
      await clearAllData();
      
      // Then delete the user from the database
      const result = await deleteUser(password);
      
      if (result.success) {
        setAlertConfig({
          visible: true,
          title: 'Account Deleted',
          message: 'Your account and all data have been permanently deleted. You will be redirected to the login screen.',
          type: 'success',
          autoClose: true,
          autoCloseDelay: 2000,
        });
        
        // Reset password input state
        setShowPasswordInput(false);
        setDeletePassword('');
        
        // The AuthContext will automatically redirect to login
        // after the user is signed out
      } else {
        setAlertConfig({
          visible: true,
          title: 'Error',
          message: result.error || 'Failed to delete account. Please try again.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: 'Failed to delete account. Please try again.',
        type: 'error',
      });
    }
  };

  const handleLogout = async () => {
    setAlertConfig({
      visible: true,
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      type: 'warning',
      showCancel: true,
      confirmText: 'Yes, Logout',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const result = await logout();
          if (result.success) {
            // Logout successful, user will be automatically redirected to login screen
            // by the AuthContext
          } else {
            setAlertConfig({
              visible: true,
              title: 'Error',
              message: result.error || 'Logout failed. Please try again.',
              type: 'error',
            });
          }
        } catch (error) {
          console.error('Error during logout:', error);
          setAlertConfig({
            visible: true,
            title: 'Error',
            message: 'Logout failed. Please try again.',
            type: 'error',
          });
        }
      },
    });
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
            title="Are you using your left or right hand?"
            subtitle={`Currently: ${settings.navbarPosition === 'right' ? 'Right hand (Right side)' : 'Left hand (Left side)'}`}
            icon="hand-left"
            showSwitch
            switchValue={settings.navbarPosition === 'right'}
            onSwitchChange={(value) => {
              const newPosition = value ? 'right' : 'left';
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
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingItem
            title="Delete Account & All Data"
            subtitle="Permanently delete your account and all data"
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

      {/* Password Input Modal for Account Deletion */}
      {showPasswordInput && (
        <KeyboardAvoidingView 
          style={styles.passwordModal}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.passwordModalContent}>
            <Text style={styles.passwordModalTitle}>Enter Your Password</Text>
            <Text style={styles.passwordModalMessage}>
              To confirm account deletion, please enter your password
            </Text>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter password"
              placeholderTextColor={COLORS.textSecondary}
              secureTextEntry
              value={deletePassword}
              onChangeText={setDeletePassword}
              returnKeyType="done"
              onSubmitEditing={() => {
                if (deletePassword.trim()) {
                  performAccountDeletion(deletePassword);
                } else {
                  setAlertConfig({
                    visible: true,
                    title: 'Error',
                    message: 'Please enter your password',
                    type: 'error',
                  });
                }
              }}
            />
            <View style={styles.passwordModalButtons}>
              <TouchableOpacity
                style={[styles.passwordModalButton, styles.cancelButton]}
                onPress={() => {
                  setShowPasswordInput(false);
                  setDeletePassword('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.passwordModalButton, styles.confirmButton]}
                onPress={() => {
                  if (deletePassword.trim()) {
                    performAccountDeletion(deletePassword);
                  } else {
                    setAlertConfig({
                      visible: true,
                      title: 'Error',
                      message: 'Please enter your password',
                      type: 'error',
                    });
                  }
                }}
              >
                <Text style={styles.confirmButtonText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        showCancel={alertConfig.showCancel}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        onConfirm={alertConfig.onConfirm}
        onClose={() => {
          setAlertConfig({ ...alertConfig, visible: false });
        }}
        autoClose={alertConfig.autoClose}
        autoCloseDelay={alertConfig.autoCloseDelay}
      />

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
  // Password Modal Styles
  passwordModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  passwordModalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SPACING.xl,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    maxHeight: '80%',
  },
  passwordModalTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  passwordModalMessage: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
    lineHeight: 20,
  },
  passwordInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    padding: SPACING.md,
    fontSize: SIZES.font,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    marginBottom: SPACING.lg,
  },
  passwordModalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  passwordModalButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.border,
  },
  confirmButton: {
    backgroundColor: COLORS.error,
  },
  cancelButtonText: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
  },
  confirmButtonText: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.white,
  },
});

export default SettingsScreen; 