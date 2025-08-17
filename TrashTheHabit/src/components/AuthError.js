import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SPACING } from '../constants/theme';

const AuthError = ({ error, onRetry, onDismiss }) => {
  if (!error) return null;

  return (
    <View style={styles.container}>
      <View style={styles.errorContent}>
        <View style={styles.errorIcon}>
          <Ionicons name="alert-circle" size={24} color={COLORS.error} />
        </View>
        <View style={styles.errorText}>
          <Text style={styles.errorTitle}>Authentication Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
        {onDismiss && (
          <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
            <Ionicons name="close" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.error + '10',
    borderWidth: 1,
    borderColor: COLORS.error + '30',
    borderRadius: SIZES.radius,
    padding: SPACING.md,
    margin: SPACING.md,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  errorIcon: {
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  errorText: {
    flex: 1,
  },
  errorTitle: {
    ...FONTS.bold,
    fontSize: SIZES.font,
    color: COLORS.error,
    marginBottom: SPACING.xs,
  },
  errorMessage: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  dismissButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  retryButton: {
    alignSelf: 'flex-start',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.error,
    borderRadius: SIZES.radius,
  },
  retryText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.white,
  },
});

export default AuthError;
