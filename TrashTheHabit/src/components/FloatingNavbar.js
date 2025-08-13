import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const FloatingNavbar = ({ 
  currentRoute, 
  onNavigate, 
  position = 'right' 
}) => {
  const navItems = [
    { key: 'Home', icon: 'home', label: 'Home' },
    { key: 'AddHabit', icon: 'add-circle', label: 'Add Habit' },
    { key: 'Progress', icon: 'trending-up', label: 'Progress' },
    { key: 'Settings', icon: 'settings', label: 'Settings' },
  ];

  const [isExpanded, setIsExpanded] = useState(false);
  const [scaleAnimation] = useState(new Animated.Value(1));
  const [opacityAnimation] = useState(new Animated.Value(1));
  const [isVisible, setIsVisible] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const navItemScaleAnims = useRef(navItems.map(() => new Animated.Value(1))).current;

  const getNavbarStyle = () => {
    return position === 'left' ? styles.navbarLeft : styles.navbarRight;
  };

  const getCurrentScreenIcon = () => {
    const currentItem = navItems.find(item => item.key === currentRoute);
    return currentItem ? currentItem.icon : 'home';
  };

  const animateButtonPress = (animRef) => {
    Animated.sequence([
      Animated.timing(animRef, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animRef, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateNavItemPress = (index) => {
    Animated.sequence([
      Animated.timing(navItemScaleAnims[index], {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(navItemScaleAnims[index], {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(navItemScaleAnims[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

 
  useEffect(() => {
    let timer;
    if (isExpanded) {
      timer = setTimeout(() => {
        setIsExpanded(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [isExpanded]);

 
  useEffect(() => {
    if (hasInteracted) return; 

    const timer = setTimeout(() => {
     
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
        
        Animated.timing(opacityAnimation, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => {
          setIsVisible(false);
        });
      });
    }, 2000); 

    return () => clearTimeout(timer);
  }, [currentRoute, hasInteracted]);

  const handleToggle = () => {
    setHasInteracted(true);
    setIsVisible(true);
    
    animateButtonPress(buttonScaleAnim);
    
    Animated.timing(opacityAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    if (isExpanded) {
      Animated.spring(scaleAnimation, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(scaleAnimation, {
        toValue: 1.1,
        useNativeDriver: true,
      }).start();
    }
    
    setIsExpanded(!isExpanded);
  };

  const handleNavigation = (routeName, index) => {
    console.log('Navigating to:', routeName); 
    
    setHasInteracted(true);
    setIsVisible(true);
    
    animateNavItemPress(index);
    
    Animated.timing(opacityAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.spring(scaleAnimation, {
      toValue: 1,
      useNativeDriver: true,
    }).start(() => {
      setIsExpanded(false);
    });

    if (onNavigate) {
      onNavigate(routeName);
    } else {
      console.error('onNavigate function is not provided');
    }
  };

 
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
      {!isExpanded && (
        <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
          <TouchableOpacity
            style={styles.collapsedButton}
            onPress={handleToggle}
            activeOpacity={1}
          >
            <Ionicons
              name={getCurrentScreenIcon()}
              size={24}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </Animated.View>
      )}

      {isExpanded && (
        <Animated.View 
          style={[
            styles.expandedNavbar,
            { transform: [{ scale: scaleAnimation }] }
          ]}
        >
          {navItems.map((item, index) => (
            <Animated.View 
              key={item.key}
              style={{ transform: [{ scale: navItemScaleAnims[index] }] }}
            >
              <TouchableOpacity
                style={[
                  styles.navItem,
                  currentRoute === item.key && styles.navItemActive
                ]}
                onPress={() => handleNavigation(item.key, index)}
                activeOpacity={1}
              >
                <Ionicons
                  name={item.icon}
                  size={24}
                  color={currentRoute === item.key ? COLORS.white : COLORS.textSecondary}
                />
              </TouchableOpacity>
            </Animated.View>
          ))}
          
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
    zIndex: 1000,
  },
  navbarRight: {
    right: 20,
  },
  navbarLeft: {
    left: 20,
  },
 
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