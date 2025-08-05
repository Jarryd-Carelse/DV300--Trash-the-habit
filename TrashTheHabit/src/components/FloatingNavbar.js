import React from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const FloatingNavbar = ({ 
  currentRoute, 
  onNavigate, 
  position = 'right' // 'left' or 'right'
}) => {
  const navItems = [
    { key: 'Home', icon: 'home', label: 'Home' },
    { key: 'AddHabit', icon: 'add-circle', label: 'Add' },
    { key: 'Progress', icon: 'trending-up', label: 'Progress' },
    { key: 'Settings', icon: 'settings', label: 'Settings' },
  ];

  const getNavbarStyle = () => {
    return position === 'left' ? styles.navbarLeft : styles.navbarRight;
  };

  const getItemStyle = (itemKey) => {
    const isActive = currentRoute === itemKey;
    return [
      styles.navItem,
      isActive && styles.navItemActive,
    ];
  };

  const getIconStyle = (itemKey) => {
    const isActive = currentRoute === itemKey;
    return {
      color: isActive ? COLORS.white : COLORS.textSecondary,
      fontSize: 24,
    };
  };

  return (
    <View style={[styles.container, getNavbarStyle()]}>
      {navItems.map((item, index) => (
        <TouchableOpacity
          key={item.key}
          style={getItemStyle(item.key)}
          onPress={() => onNavigate(item.key)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={item.icon}
            style={getIconStyle(item.key)}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    backgroundColor: COLORS.surface,
    borderRadius: 25,
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.sm,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 200,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.dark,
  },
  navbarRight: {
    right: 20,
  },
  navbarLeft: {
    left: 20,
  },
  navItem: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SIZES.xs,
    backgroundColor: 'transparent',
  },
  navItemActive: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.medium,
  },
});

export default FloatingNavbar; 