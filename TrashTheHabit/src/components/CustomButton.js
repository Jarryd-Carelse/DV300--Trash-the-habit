import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';

const CustomButton = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  loading = false,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'danger'
  size = 'medium', // 'small', 'medium', 'large'
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]];
    
    switch (variant) {
      case 'secondary':
        baseStyle.push(styles.secondary);
        break;
      case 'outline':
        baseStyle.push(styles.outline);
        break;
      case 'danger':
        baseStyle.push(styles.danger);
        break;
      default:
        baseStyle.push(styles.primary);
    }
    
    if (disabled) {
      baseStyle.push(styles.disabled);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseTextStyle = [styles.text, styles[`${size}Text`]];
    
    switch (variant) {
      case 'outline':
        baseTextStyle.push(styles.outlineText);
        break;
      case 'danger':
        baseTextStyle.push(styles.dangerText);
        break;
      default:
        baseTextStyle.push(styles.primaryText);
    }
    
    if (disabled) {
      baseTextStyle.push(styles.disabledText);
    }
    
    return baseTextStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' ? COLORS.primary : COLORS.white} 
          size="small" 
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.light,
  },
  // Size variants
  small: {
    height: 40,
    paddingHorizontal: SIZES.padding,
  },
  medium: {
    height: SIZES.buttonHeight,
    paddingHorizontal: SIZES.padding * 1.5,
  },
  large: {
    height: 60,
    paddingHorizontal: SIZES.padding * 2,
  },
  // Color variants
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.lightGray,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  danger: {
    backgroundColor: COLORS.accent,
  },
  disabled: {
    backgroundColor: COLORS.lightGray,
    opacity: 0.6,
  },
  // Text styles
  text: {
    ...FONTS.medium,
    textAlign: 'center',
  },
  smallText: {
    fontSize: SIZES.small,
  },
  mediumText: {
    fontSize: SIZES.font,
  },
  largeText: {
    fontSize: SIZES.large,
  },
  primaryText: {
    color: COLORS.white,
  },
  secondaryText: {
    color: COLORS.text,
  },
  outlineText: {
    color: COLORS.primary,
  },
  dangerText: {
    color: COLORS.white,
  },
  disabledText: {
    color: COLORS.textSecondary,
  },
});

export default CustomButton; 