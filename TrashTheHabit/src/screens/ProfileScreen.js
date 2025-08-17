import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SPACING } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import CustomAlert from '../components/CustomAlert';
import * as Firebase from '../config/firebase';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  
  // Debug: Check what's available
  useEffect(() => {
    console.log('Firebase functions available:', {
      getUserProfile: typeof Firebase.getUserProfile,
      updateUserProfile: typeof Firebase.updateUserProfile,
      auth: typeof Firebase.auth
    });
    
    console.log('Current userProfile state:', userProfile);
    console.log('Current avatar seed:', userProfile.avatarSeed);
  }, [userProfile]);
  
  const [userProfile, setUserProfile] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    dateOfBirth: '',
    avatarSeed: '', // Random seed for avatar generation
    avatarStyle: 'adventurer', // Default avatar style
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [habitStats, setHabitStats] = useState({
    total: 0,
    completed: 0,
    failed: 0
  });
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  // Load user profile from Firestore when component mounts
  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  // Generate avatar seed if user doesn't have one
  useEffect(() => {
    if (user && !userProfile.avatarSeed) {
      generateNewAvatar('adventurer');
    }
  }, [user, userProfile.avatarSeed]);

  const getAvatarUrl = (seed, style = 'adventurer') => {
    if (!seed) return null;
    return `https://api.dicebear.com/7.x/${style}/png?seed=${seed}`;
  };

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      
      // Check if function exists
      if (typeof Firebase.getUserProfile !== 'function') {
        console.error('getUserProfile function not available');
        setIsLoading(false);
        return;
      }
      
      const profile = await Firebase.getUserProfile();
      if (profile) {
        setUserProfile(prev => ({
          ...prev,
          ...profile,
          email: user?.email || prev.email,
          avatarSeed: profile.avatarSeed || prev.avatarSeed,
          avatarStyle: profile.avatarStyle || prev.avatarStyle
        }));
      }
      
      // Load habit statistics
      await loadHabitStats();
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHabitStats = async () => {
    try {
      if (typeof Firebase.getUserHabits !== 'function') {
        console.error('getUserHabits function not available');
        return;
      }

      // Get habits once to calculate statistics
      const habitsData = await new Promise((resolve) => {
        const unsubscribe = Firebase.getUserHabits((data) => {
          unsubscribe();
          resolve(data);
        });
      });

      if (habitsData) {
        const total = habitsData.all?.length || 0;
        const completed = habitsData.completed?.length || 0;
        const failed = habitsData.failed?.length || 0;
        
        const stats = {
          total,
          completed,
          failed
        };
        
        console.log('Habit statistics loaded:', stats);
        setHabitStats(stats);
      }
    } catch (error) {
      console.error('Error loading habit statistics:', error);
    }
  };

  const handleEditProfile = async () => {
    if (isEditing) {
      // Validate that all required fields are filled
      if (!editData.firstName.trim() || !editData.lastName.trim() || !editData.dateOfBirth.trim()) {
        setAlertConfig({
          visible: true,
          title: 'Error',
          message: 'Please fill in all fields (First Name, Last Name, and Date of Birth)',
          type: 'error',
        });
        return;
      }

      try {
        // Check if function exists
        if (typeof Firebase.updateUserProfile !== 'function') {
          console.error('updateUserProfile function not available');
          setAlertConfig({
            visible: true,
            title: 'Error',
            message: 'Profile update function not available',
            type: 'error',
          });
          return;
        }
        
        // Save to Firestore
        const result = await Firebase.updateUserProfile({
          firstName: editData.firstName.trim(),
          lastName: editData.lastName.trim(),
          dateOfBirth: editData.dateOfBirth.trim()
        });

        if (result.success) {
          // Update local state
          setUserProfile(prev => ({
            ...prev,
            firstName: editData.firstName.trim(),
            lastName: editData.lastName.trim(),
            dateOfBirth: editData.dateOfBirth.trim()
          }));
          setIsEditing(false);
          setAlertConfig({
            visible: true,
            title: 'Success',
            message: 'Profile updated successfully!',
            type: 'success',
            autoClose: true,
            autoCloseDelay: 2000,
          });
        } else {
          setAlertConfig({
            visible: true,
            title: 'Error',
            message: result.error || 'Failed to update profile',
            type: 'error',
          });
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        setAlertConfig({
          visible: true,
          title: 'Error',
          message: 'Failed to update profile. Please try again.',
          type: 'error',
        });
      }
    } else {
      // Start editing - populate edit data with current values
      setEditData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        dateOfBirth: userProfile.dateOfBirth || '',
      });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
    });
  };

  const handleChangeAvatar = () => {
    setAlertConfig({
      visible: true,
      title: 'Change Avatar',
      message: 'Do you want to randomize your avatar?',
      type: 'info',
      showCancel: true,
      confirmText: 'Yes',
      cancelText: 'Cancel',
      onConfirm: () => generateNewAvatar('adventurer'),
    });
  };

  const generateNewAvatar = (style = 'adventurer') => {
    // Use a more reliable seed generation
    const seed = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    console.log('Generating new avatar with seed:', seed, 'style:', style);
    
    setUserProfile(prev => ({
      ...prev,
      avatarSeed: seed,
      avatarStyle: style
    }));
    
    // Save to Firestore
    if (user?.uid) {
      Firebase.updateUserProfile({ 
        avatarSeed: seed,
        avatarStyle: style
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
      confirmText: 'Logout',
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerButtons}>
          {isEditing && (
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={handleCancelEdit}
            >
              <Ionicons name="close" size={24} color={COLORS.error} />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={handleEditProfile}
          >
            <Ionicons 
              name={isEditing ? "checkmark" : "create-outline"} 
              size={24} 
              color={isEditing ? COLORS.success : COLORS.primary} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : (
          <>
            <View style={styles.profileSection}>
              <View style={styles.profileImageContainer}>
                {userProfile.avatarSeed ? (
                  <Image
                    source={{ uri: getAvatarUrl(userProfile.avatarSeed, userProfile.avatarStyle) }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.defaultAvatar}>
                    <Ionicons name="person" size={60} color={COLORS.white} />
                  </View>
                )}
                <TouchableOpacity 
                  style={styles.changePhotoButton} 
                  onPress={handleChangeAvatar}
                >
                  <Ionicons name="shuffle" size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.userName}>
                {userProfile.firstName && userProfile.lastName 
                  ? `${userProfile.firstName} ${userProfile.lastName}`
                  : 'Complete Your Profile'
                }
              </Text>
              <Text style={styles.userEmail}>{userProfile.email}</Text>
              {(!userProfile.firstName || !userProfile.lastName || !userProfile.dateOfBirth) && (
                <Text style={styles.profileIncomplete}>
                  Please fill in your profile information
                </Text>
              )}
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Ionicons name="person" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>First Name</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.editInput}
                      value={editData.firstName}
                      onChangeText={(text) => setEditData(prev => ({ ...prev, firstName: text }))}
                      placeholder="Enter first name"
                      placeholderTextColor={COLORS.textSecondary}
                    />
                  ) : (
                    <Text style={[
                      styles.infoValue,
                      !userProfile.firstName && styles.emptyField
                    ]}>
                      {userProfile.firstName || 'Not set'}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Ionicons name="person" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Last Name</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.editInput}
                      value={editData.lastName}
                      onChangeText={(text) => setEditData(prev => ({ ...prev, lastName: text }))}
                      placeholder="Enter last name"
                      placeholderTextColor={COLORS.textSecondary}
                    />
                  ) : (
                    <Text style={[
                      styles.infoValue,
                      !userProfile.lastName && styles.emptyField
                    ]}>
                      {userProfile.lastName || 'Not set'}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Ionicons name="mail" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{userProfile.email}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Ionicons name="calendar" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Date of Birth</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.editInput}
                      value={editData.dateOfBirth}
                      onChangeText={(text) => setEditData(prev => ({ ...prev, dateOfBirth: text }))}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={COLORS.textSecondary}
                    />
                  ) : (
                    <Text style={[
                      styles.infoValue,
                      !userProfile.dateOfBirth && styles.emptyField
                    ]}>
                      {userProfile.dateOfBirth ? formatDate(userProfile.dateOfBirth) : 'Not set'}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>Statistics</Text>
              
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{habitStats.total}</Text>
                  <Text style={styles.statLabel}>Total Habits</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{habitStats.completed}</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{habitStats.failed}</Text>
                  <Text style={styles.statLabel}>Failed</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>

        <View style={styles.logoutSection}>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
          >
            <Ionicons name="log-out" size={20} color={COLORS.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        showCancel={alertConfig.showCancel}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        onConfirm={alertConfig.onConfirm}
        onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
        autoClose={alertConfig.autoClose}
        autoCloseDelay={alertConfig.autoCloseDelay}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButton: {
    padding: SPACING.sm,
  },
  editButton: {
    padding: SPACING.sm,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: SPACING.lg,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.success || '#4CAF50', // Green color
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userName: {
    ...FONTS.bold,
    fontSize: SIZES.extraLarge,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
  },
  profileIncomplete: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.warning || COLORS.accent,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  infoSection: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  infoValue: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  editInput: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.text,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statsSection: {
    padding: SPACING.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
  },
  statNumber: {
    ...FONTS.bold,
    fontSize: SIZES.extraLarge,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  logoutSection: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error + '20',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  logoutText: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.error,
    marginLeft: SPACING.sm,
  },
  emptyField: {
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  loadingText: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
  },
  defaultAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COLORS.primary,
  },
});

export default ProfileScreen;
