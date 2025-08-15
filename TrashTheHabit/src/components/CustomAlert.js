import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SPACING } from '../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

const CustomAlert = ({ 
  visible, 
  title, 
  message, 
  type = 'info', // 'info', 'success', 'warning', 'error'
  showIcon = true,
  customIcon = null,
  onConfirm, 
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false,
  onClose,
  autoClose = false,
  autoCloseDelay = 3000,
}) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Entrance animation
      Animated.spring(animValue, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Auto close if enabled
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoCloseDelay);
        return () => clearTimeout(timer);
      }
    } else {
      // Exit animation
      Animated.timing(animValue, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, autoClose, autoCloseDelay]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    handleClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    handleClose();
  };

  const getTypeConfig = () => {
    // If custom icon is provided, use it with default info styling
    if (customIcon) {
      return {
        icon: customIcon,
        color: COLORS.primary,
        backgroundColor: COLORS.primary + '15',
      };
    }
    
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle',
          color: COLORS.success,
          backgroundColor: COLORS.success + '15',
        };
      case 'warning':
        return {
          icon: 'warning',
          color: COLORS.warning,
          backgroundColor: COLORS.warning + '15',
        };
      case 'error':
        return {
          icon: 'close-circle',
          color: COLORS.error,
          backgroundColor: COLORS.error + '15',
        };
      default:
        return {
          icon: 'information-circle',
          color: COLORS.primary,
          backgroundColor: COLORS.primary + '15',
        };
    }
  };

  const typeConfig = getTypeConfig();

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={handleClose}
        />
        
        <Animated.View 
          style={[
            styles.alertContainer,
            {
              opacity: animValue,
              transform: [{ scale: animValue }],
            },
          ]}
        >
          {/* Header with icon */}
          <View style={[styles.header, { backgroundColor: typeConfig.backgroundColor }]}>
            {showIcon && (
              <View 
                style={[
                  styles.iconContainer,
                  { backgroundColor: typeConfig.color + '20' },
                ]}
              >
                <Ionicons 
                  name={typeConfig.icon} 
                  size={32} 
                  color={typeConfig.color} 
                />
              </View>
            )}
            <Text style={[styles.title, { color: typeConfig.color }]}>
              {title}
            </Text>
          </View>

          {/* Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.message}>{message}</Text>
          </View>

          {/* Action buttons */}
          <View style={styles.buttonContainer}>
            {showCancel && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                styles.button, 
                styles.confirmButton,
                { backgroundColor: typeConfig.color }
              ]}
              onPress={handleConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  alertContainer: {
    width: screenWidth * 0.85,
    maxWidth: 400,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    alignItems: 'center',
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    textAlign: 'center',
  },
  messageContainer: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  message: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    paddingTop: SPACING.md,
    gap: SPACING.md,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.border,
  },
  confirmButton: {
    // backgroundColor set dynamically based on type
  },
  cancelButtonText: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
  },
  confirmButtonText: {
    ...FONTS.bold,
    fontSize: SIZES.font,
    color: COLORS.white,
  },
});

export default CustomAlert;
