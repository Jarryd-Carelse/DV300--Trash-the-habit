import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';

const DropZone = ({ 
  type,
  isActive = false,
  isHighlighted = false,
  style,
}) => {
  const isComplete = type === 'complete';
  
  const getContainerStyle = () => {
    const baseStyle = [styles.container];
    
    if (isComplete) {
      baseStyle.push(styles.completeContainer);
    } else {
      baseStyle.push(styles.trashContainer);
    }
    
    if (isActive) {
      baseStyle.push(styles.activeContainer);
    }
    
    if (isHighlighted) {
      baseStyle.push(styles.highlightedContainer);
    }
    
    return baseStyle;
  };

  const getIconStyle = () => {
    return {
      color: isComplete ? COLORS.success : COLORS.accent,
      fontSize: 32,
    };
  };

  const getTextStyle = () => {
    return [
      styles.text,
      { color: isComplete ? COLORS.success : COLORS.accent },
    ];
  };

  return (
    <Animated.View style={[getContainerStyle(), style]}>
      <Ionicons
        name={isComplete ? 'checkmark-circle' : 'trash'}
        style={getIconStyle()}
      />
      <Text style={getTextStyle()}>
        {isComplete ? 'Complete' : 'Trash'}
      </Text>
      {isActive && (
        <View style={styles.activeIndicator}>
          <Text style={styles.activeText}>Drop here!</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SIZES.sm,
    minHeight: 120,
    ...SHADOWS.medium,
  },
  completeContainer: {
    borderWidth: 2,
    borderColor: COLORS.success,
    borderStyle: 'dashed',
  },
  trashContainer: {
    borderWidth: 2,
    borderColor: COLORS.accent,
    borderStyle: 'dashed',
  },
  activeContainer: {
    backgroundColor: COLORS.lightGray,
    transform: [{ scale: 1.05 }],
  },
  highlightedContainer: {
    borderWidth: 3,
  },
  text: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    marginTop: SIZES.sm,
    textAlign: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    top: -10,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radius,
  },
  activeText: {
    ...FONTS.medium,
    color: COLORS.white,
    fontSize: SIZES.small,
  },
});

export default DropZone; 