import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const FloatingNavbar = ({ 
  currentRoute, 
  onNavigate, 
  position = 'right' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [scaleAnimation] = useState(new Animated.Value(1));
  const [opacityAnimation] = useState(new Animated.Value(1));
  const [isVisible, setIsVisible] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  const navItems = [
    { key: 'Home', icon: 'home', label: 'Home' },
    { key: 'AddHabit', icon: 'add-circle', label: 'Add Habit' },
    { key: 'Progress', icon: 'trending-up', label: 'Progress' },
    { key: 'Settings', icon: 'settings', label: 'Settings' },
  ];

  const getNavbarStyle = () => {
    return position === 'left' ? styles.navbarLeft : styles.navbarRight;
  };

  const getCurrentScreenIcon = () => {
    const currentItem = navItems.find(item => item.key === currentRoute);
    return currentItem ? currentItem.icon : 'home';
  };

  // Auto-close timer for expanded navbar
  useEffect(() => {
    let timer;
    if (isExpanded) {
      timer = setTimeout(() => {
        setIsExpanded(false);
      }, 3000); // Close after 3 seconds
    }
    return () => clearTimeout(timer);
  }, [isExpanded]);

  // Handle navbar visibility timing
  useEffect(() => {
    if (hasInteracted) return; // Don't auto-hide if user has interacted

    const timer = setTimeout(() => {
      // Start pulsing animation
      const pulseAnimation = Animated.sequence([
        Animated.timing(scaleAnimation, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]);

      pulseAnimation.start(() => {
        // After pulsing, fade to transparent
        Animated.timing(opacityAnimation, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => {
          setIsVisible(false);
        });
      });
    }, 2000); // Start after 2 seconds

    return () => clearTimeout(timer);
  }, [currentRoute, hasInteracted]);

  const handleToggle = () => {
    setHasInteracted(true);
    setIsVisible(true);
    
    // Reset opacity to full
    Animated.timing(opacityAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    if (isExpanded) {
      // Collapse
      Animated.spring(scaleAnimation, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      // Expand
      Animated.spring(scaleAnimation, {
        toValue: 1.1,
        useNativeDriver: true,
      }).start();
    }
    
    setIsExpanded(!isExpanded);
  };

  const handleNavigation = (routeName) => {
    console.log('Navigating to:', routeName); // Debug log
    
    setHasInteracted(true);
    setIsVisible(true);
    
    // Reset opacity to full
    Animated.timing(opacityAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Collapse navbar after navigation
    Animated.spring(scaleAnimation, {
      toValue: 1,
      useNativeDriver: true,
    }).start(() => {
      setIsExpanded(false);
    });

    // Call the navigation function
    if (onNavigate) {
      onNavigate(routeName);
    } else {
      console.error('onNavigate function is not provided');
    }
  };

  // Reset interaction state when route changes
  useEffect(() => {
    setHasInteracted(false);
    setIsVisible(true);
    Animated.timing(opacityAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentRoute]);

  return (
    <Animated.View 
      style={[
        styles.container, 
        getNavbarStyle(),
        {
          opacity: opacityAnimation,
          transform: [{ scale: scaleAnimation }]
        }
      ]}
    >
      {/* Collapsed state - small circle with current screen icon */}
      {!isExpanded && (
        <TouchableOpacity
          style={styles.collapsedButton}
          onPress={handleToggle}
          activeOpacity={0.7}
        >
          <Ionicons
            name={getCurrentScreenIcon()}
            size={24}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
      )}

      {/* Expanded state - full navigation bar */}
      {isExpanded && (
        <Animated.View 
          style={[
            styles.expandedNavbar,
            { transform: [{ scale: scaleAnimation }] }
          ]}
        >
          {navItems.map((item, index) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.navItem,
                currentRoute === item.key && styles.navItemActive
              ]}
              onPress={() => handleNavigation(item.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.icon}
                size={24}
                color={currentRoute === item.key ? COLORS.white : COLORS.textSecondary}
              />
            </TouchableOpacity>
          ))}
          
          {/* Down arrow indicator */}
          <View style={styles.downArrow}>
            <Ionicons
              name="chevron-down"
              size={20}
              color={COLORS.textSecondary}
            />
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
  },
  navbarRight: {
    right: 20,
  },
  navbarLeft: {
    left: 20,
  },
  // Collapsed state - small circle
  collapsedButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.dark,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  // Expanded state - full navigation bar
  expandedNavbar: {
    backgroundColor: COLORS.surface,
    borderRadius: 25,
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.sm,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 250,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.dark,
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
  downArrow: {
    marginTop: SIZES.sm,
    alignItems: 'center',
  },
});

export default FloatingNavbar; 