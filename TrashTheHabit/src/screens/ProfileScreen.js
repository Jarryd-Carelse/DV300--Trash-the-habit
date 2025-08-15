import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SIZES, FONTS, SPACING } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  
  const [userProfile, setUserProfile] = useState({
    firstName: 'Jarryd',
    lastName: 'Carelse',
    email: user?.email || 'jarryd@mail.com',
    dateOfBirth: '1990-01-01',
    profileImage: null, 
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
  });
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  const handleEditProfile = () => {
    if (isEditing) {
      
      setUserProfile(prev => ({
        ...prev,
        firstName: editData.firstName || prev.firstName,
        lastName: editData.lastName || prev.lastName,
        dateOfBirth: editData.dateOfBirth || prev.dateOfBirth,
      }));
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } else {
      
      setEditData({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        dateOfBirth: userProfile.dateOfBirth,
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

  const handleChangePhoto = async () => {
    try {
      setIsLoadingImage(true);
      
      
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraPermission.status !== 'granted' || mediaLibraryPermission.status !== 'granted') {
        const permissionMessage = 
          cameraPermission.status !== 'granted' && mediaLibraryPermission.status !== 'granted'
            ? 'Camera and Photo Library permissions are required.'
            : cameraPermission.status !== 'granted'
            ? 'Camera permission is required.'
            : 'Photo Library permission is required.';
            
        Alert.alert(
          'Permission Required',
          `${permissionMessage} Please go to your device Settings > Privacy & Security > Camera/Photos and enable access for this app.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => {
              
              Alert.alert('Settings', 'Please manually open your device settings and enable camera and photo permissions for this app.');
            }}
          ]
        );
        setIsLoadingImage(false);
        return;
      }

   
      Alert.alert(
        'Change Profile Picture',
        'Choose an option',
        [
          {
            text: 'Take Photo',
            onPress: async () => {
              try {
                const result = await ImagePicker.launchCameraAsync({
                  mediaTypes: 'images',
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.8,
                });

                if (!result.canceled && result.assets[0]) {
                  setUserProfile(prev => ({
                    ...prev,
                    profileImage: result.assets[0].uri,
                  }));
                }
              } catch (error) {
                console.error('Error taking photo:', error);
                Alert.alert('Error', 'Failed to take photo. Please try again.');
              } finally {
                setIsLoadingImage(false);
              }
            },
          },
          {
            text: 'Choose from Library',
            onPress: async () => {
              try {
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: 'images',
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.8,
                });

                if (!result.canceled && result.assets[0]) {
                  setUserProfile(prev => ({
                    ...prev,
                    profileImage: result.assets[0].uri,
                  }));
                }
              } catch (error) {
                console.error('Error picking image:', error);
                Alert.alert('Error', 'Failed to pick image. Please try again.');
              } finally {
                setIsLoadingImage(false);
              }
            },
          },
          {
            text: 'Remove Current Photo',
            style: 'destructive',
            onPress: () => {
              setUserProfile(prev => ({
                ...prev,
                profileImage: null,
              }));
              setIsLoadingImage(false);
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              setIsLoadingImage(false);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      setIsLoadingImage(false);
    }
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
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {userProfile.profileImage ? (
              <Image 
                source={{ uri: userProfile.profileImage }} 
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.defaultAvatar}>
                <Ionicons name="person" size={60} color={COLORS.white} />
              </View>
            )}
            <TouchableOpacity 
              style={[styles.changePhotoButton, isLoadingImage && styles.changePhotoButtonDisabled]} 
              onPress={handleChangePhoto}
              disabled={isLoadingImage}
            >
              {isLoadingImage ? (
                <Ionicons name="hourglass" size={20} color={COLORS.white} />
              ) : (
                <Ionicons name="camera" size={20} color={COLORS.white} />
              )}
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>
            {userProfile.firstName} {userProfile.lastName}
          </Text>
          <Text style={styles.userEmail}>{userProfile.email}</Text>
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
                <Text style={styles.infoValue}>{userProfile.firstName}</Text>
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
                <Text style={styles.infoValue}>{userProfile.lastName}</Text>
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
                <Text style={styles.infoValue}>{formatDate(userProfile.dateOfBirth)}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>15</Text>
              <Text style={styles.statLabel}>Habits Tracked</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>7</Text>
              <Text style={styles.statLabel}>Trashed</Text>
            </View>
          </View>
        </View>

        <View style={styles.logoutSection}>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
          >
            <Ionicons name="log-out" size={20} color={COLORS.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  },
  defaultAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  changePhotoButtonDisabled: {
    opacity: 0.7,
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
  infoSection: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: SPACING.lg,
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
});

export default ProfileScreen;
