import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SIZES, FONTS, SPACING } from '../constants/theme';

const UserInfo = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="person-circle" size={16} color={COLORS.primary} />
      </View>
      <Text style={styles.emailText} numberOfLines={1}>
        {user.email}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconContainer: {
    marginRight: SPACING.xs,
  },
  emailText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    maxWidth: 150,
  },
});

export default UserInfo;
