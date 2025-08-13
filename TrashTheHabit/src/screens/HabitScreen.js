import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
  PanResponder,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SPACING } from '../constants/theme';
import FloatingNavbar from '../components/FloatingNavbar';
import { getUserSettings } from '../utils/storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const HabitScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  
  // Use dummy data as specified in requirements
  const [habits, setHabits] = useState([
    { id: 1, name: 'Vaping' },
    { id: 2, name: 'Overeating' },
    { id: 3, name: 'Doomscrolling' },
    { id: 4, name: 'Procrastinating' },
    { id: 5, name: 'Sleeping Late' },
  ]);
  
  const [completed, setCompleted] = useState([]);
  const [trashed, setTrashed] = useState([]);
  const [draggedHabit, setDraggedHabit] = useState(null);
  const [dragPosition] = useState(new Animated.ValueXY());
  const [activeDropZone, setActiveDropZone] = useState(null);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [showTrashOverlay, setShowTrashOverlay] = useState(false);
  const [user] = useState({ name: 'Jarryd' });
  const [currentRoute, setCurrentRoute] = useState('Home');
  const [settings, setSettings] = useState({
    navbarPosition: 'right',
    soundEnabled: true,
    hapticsEnabled: true,
    notificationsEnabled: true,
  });

  // Animation refs
  const successAnim = useRef(new Animated.Value(0)).current;
  const trashAnim = useRef(new Animated.Value(0)).current;
  const dropZoneAnim = useRef(new Animated.Value(0)).current;
  const panResponderRef = useRef(null);

  useEffect(() => {
    loadSettings();
    
    // Cleanup function to prevent memory leaks
    return () => {
      // Reset all animations when component unmounts
      successAnim.setValue(0);
      trashAnim.setValue(0);
      dropZoneAnim.setValue(0);
    };
  }, []);

  const loadSettings = async () => {
    try {
      const userSettings = await getUserSettings();
      if (userSettings) {
        setSettings(userSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleNavigation = (routeName) => {
    setCurrentRoute(routeName);
    navigation.navigate(routeName);
  };

  const createPanResponder = useCallback((habit) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        setDraggedHabit(habit);
        setActiveDropZone(null);
        
        dragPosition.setOffset({
          x: dragPosition.x._value,
          y: dragPosition.y._value,
        });
        
        dragPosition.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (evt, gestureState) => {
        dragPosition.setValue({ 
          x: gestureState.dx, 
          y: gestureState.dy 
        });
        
        const dropZoneY = screenHeight - 200;
        
        if (gestureState.moveY > dropZoneY - 50) {
          const leftZoneX = 20;
          const rightZoneX = screenWidth / 2 + 20;
          const zoneWidth = (screenWidth - 80) / 2;
          
          if (gestureState.moveX > leftZoneX && gestureState.moveX < leftZoneX + zoneWidth) {
            if (activeDropZone !== 'complete') {
              setActiveDropZone('complete');
              Animated.spring(dropZoneAnim, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
              }).start();
            }
          } else if (gestureState.moveX > rightZoneX && gestureState.moveX < rightZoneX + zoneWidth) {
            if (activeDropZone !== 'trash') {
              setActiveDropZone('trash');
              Animated.spring(dropZoneAnim, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
              }).start();
            }
          } else {
            if (activeDropZone !== null) {
              setActiveDropZone(null);
              Animated.spring(dropZoneAnim, {
                toValue: 0,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
              }).start();
            }
          }
        } else {
          if (activeDropZone !== null) {
            setActiveDropZone(null);
            Animated.spring(dropZoneAnim, {
              toValue: 0,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }).start();
          }
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (draggedHabit && activeDropZone) {
          handleDrop(activeDropZone, draggedHabit);
        }
        
        Animated.spring(dropZoneAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }).start();
        
        Animated.spring(dragPosition, {
          toValue: { x: 0, y: 0 },
          tension: 100,
          friction: 8,
          useNativeDriver: false,
        }).start(() => {
          setDraggedHabit(null);
          setActiveDropZone(null);
          dragPosition.setValue({ x: 0, y: 0 });
        });
      },
    });
  }, [activeDropZone, handleDrop]);

  const handleDrop = useCallback((zoneType, habit) => {
    console.log('handleDrop called with:', zoneType, habit.name);
    
    if (zoneType === 'complete') {
      console.log('Starting success animation');
      setShowSuccessOverlay(true);
      
      // Enhanced success animation with celebration
      const successSequence = Animated.sequence([
        Animated.timing(successAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.delay(1200),
        Animated.timing(successAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]);
      
      successSequence.start(() => {
        setShowSuccessOverlay(false);
        successAnim.setValue(0);
      });

      setCompleted(prev => [...prev, { ...habit, completedAt: new Date() }]);
      setHabits(prev => prev.filter(h => h.id !== habit.id));
    } else if (zoneType === 'trash') {
      console.log('Starting trash animation');
      setShowTrashOverlay(true);
      
      // Trash animation
      const trashSequence = Animated.sequence([
        Animated.timing(trashAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(800),
        Animated.timing(trashAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]);
      
      trashSequence.start(() => {
        setShowTrashOverlay(false);
        trashAnim.setValue(0);
      });

      setTrashed(prev => [...prev, { ...habit, trashedAt: new Date() }]);
      setHabits(prev => prev.filter(h => h.id !== habit.id));
    }
  }, [successAnim, trashAnim]);

  const renderHabitCard = useCallback((habit) => {
    const isDragging = draggedHabit?.id === habit.id;
    
    // Create pan responder only once per habit
    if (!panResponderRef.current) {
      panResponderRef.current = createPanResponder(habit);
    }
    
    return (
      <Animated.View
        key={habit.id}
        style={[
          styles.habitCard,
          isDragging && styles.draggingCard,
          isDragging && {
            transform: [
              {
                translateX: dragPosition.x,
              },
              {
                translateY: dragPosition.y,
              },
              { 
                rotate: dragPosition.y.interpolate({
                  inputRange: [-100, 0, 100],
                  outputRange: ['-5deg', '0deg', '5deg']
                })
              }
            ],
            zIndex: 1000,
            elevation: 10,
          }
        ]}
        {...panResponderRef.current.panHandlers}
      >
        <View style={styles.cardContent}>
          <View style={styles.dragHandle}>
            <Ionicons name="menu" size={20} color={COLORS.gray} />
          </View>
          
          <View style={styles.habitInfo}>
            <Text style={styles.habitName}>{habit.name}</Text>
          </View>
        </View>
      </Animated.View>
    );
  }, [draggedHabit, dragPosition, createPanResponder]);

  const renderDropZone = (type) => {
    const isComplete = type === 'complete';
    const isHighlighted = activeDropZone === type;
    
    // Scale down when highlighted (smaller animation)
    const dropZoneScale = dropZoneAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.95],
    });

    // Different highlight colors for each zone type
    const getHighlightStyle = () => {
      if (!isHighlighted) return {};
      
      if (isComplete) {
        return {
          backgroundColor: COLORS.success + '30',
          borderColor: COLORS.success,
          borderWidth: 3,
          borderStyle: 'solid',
        };
      } else {
        return {
          backgroundColor: COLORS.accent + '30',
          borderColor: COLORS.accent,
          borderWidth: 3,
          borderStyle: 'solid',
        };
      }
    };

    return (
      <Animated.View
        key={type}
        style={[
          styles.dropZone,
          isComplete ? styles.completeZone : styles.trashZone,
          getHighlightStyle(),
          {
            transform: [{ scale: isHighlighted ? dropZoneScale : 1 }]
          }
        ]}
      >
        <Ionicons
          name={isComplete ? 'checkmark-circle' : 'trash'}
          size={32}
          color={isComplete ? COLORS.success : COLORS.accent}
        />
        <Text style={[
          styles.dropZoneText,
          { color: isComplete ? COLORS.success : COLORS.accent }
        ]}>
          {isComplete ? 'Complete' : 'Trash'}
        </Text>
        {isHighlighted && (
          <Animated.View 
            style={[
              styles.dropIndicator,
              { 
                opacity: dropZoneAnim,
                backgroundColor: isComplete ? COLORS.success : COLORS.accent
              }
            ]}
          >
            <Text style={styles.dropIndicatorText}>Drop here!</Text>
          </Animated.View>
        )}
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome back, {user.name}!
        </Text>
        <Text style={styles.subtitle}>
          Your habits for today
        </Text>
      </View>

      <ScrollView 
        style={styles.habitsList}
        contentContainerStyle={[styles.habitsContent, { paddingBottom: 200 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!draggedHabit}
      >
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No habits left. You crushed it!</Text>
            <Text style={styles.emptySubtext}>
              Completed: {completed.length} | Trashed: {trashed.length}
            </Text>
          </View>
        ) : (
          habits.map(renderHabitCard)
        )}
      </ScrollView>

      <View style={[styles.dropZonesContainer, { paddingBottom: SPACING.lg + insets.bottom }]}>
        {renderDropZone('complete')}
        {renderDropZone('trash')}
      </View>

      {/* Success Animation Overlay */}
      {showSuccessOverlay && (
        <Animated.View 
          style={[
            styles.animationOverlay,
            styles.successOverlay,
            {
              opacity: successAnim,
            }
          ]}
        >
          <Animated.View style={[
            styles.successContent,
            {
              transform: [{
                scale: successAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.8, 1.1, 1],
                })
              }]
            }]
          }>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={100} color={COLORS.white} />
            </View>
            <Text style={styles.animationText}>Well done! You beat a habit today!</Text>
            <Text style={styles.successSubtext}>Keep up the amazing work!</Text>
          </Animated.View>
        </Animated.View>
      )}

      {/* Trash Animation Overlay */}
      {showTrashOverlay && (
        <Animated.View 
          style={[
            styles.animationOverlay,
            styles.trashOverlay,
            {
              opacity: trashAnim,
            }
          ]}
        >
          <Animated.View style={[
            styles.trashContent,
            {
              transform: [{
                scale: trashAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.8, 1.1, 1],
                })
              }]
            }]
          }>
            <View style={styles.trashIconContainer}>
              <Ionicons name="trash" size={100} color={COLORS.white} />
            </View>
            <Text style={styles.trashText}>Habit Trashed!</Text>
            <Text style={styles.trashSubtext}>Do better next time!</Text>
          </Animated.View>
        </Animated.View>
      )}

      <FloatingNavbar
        currentRoute={currentRoute}
        onNavigate={handleNavigation}
        position={settings.navbarPosition}
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
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  welcomeText: {
    ...FONTS.bold,
    fontSize: SIZES.extraLarge,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
  },
  habitsList: {
    flex: 1,
  },
  habitsContent: {
    padding: SPACING.lg,
    paddingBottom: 200, // Account for drop zones + system bar
  },
  habitCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  draggingCard: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 15,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  dragHandle: {
    marginRight: SPACING.md,
    padding: SPACING.sm,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  dropZonesContainer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    paddingBottom: SPACING.lg,
  },
  dropZone: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.sm,
    minHeight: 120,
    borderWidth: 2,
    borderStyle: 'dashed',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6.27,
    elevation: 8,
  },
  completeZone: {
    borderColor: COLORS.success,
  },
  trashZone: {
    borderColor: COLORS.accent,
  },
  dropZoneText: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  dropIndicator: {
    position: 'absolute',
    top: -10,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SIZES.radius,
  },
  dropIndicatorText: {
    ...FONTS.medium,
    color: COLORS.white,
    fontSize: SIZES.small,
  },
  animationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  successOverlay: {
    backgroundColor: 'rgba(76, 175, 80, 0.95)',
  },
  trashOverlay: {
    backgroundColor: 'rgba(255, 82, 82, 0.95)',
  },
  animationText: {
    ...FONTS.bold,
    fontSize: 24,
    color: COLORS.white,
    marginTop: SPACING.md,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  successContent: {
    alignItems: 'center',
    padding: SPACING.lg,
  },
  successIconContainer: {
    backgroundColor: COLORS.success + '50',
    borderRadius: 50,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  successSubtext: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.white,
    textAlign: 'center',
  },
  trashContent: {
    alignItems: 'center',
    padding: SPACING.lg,
  },
  trashIconContainer: {
    backgroundColor: COLORS.accent + '50',
    borderRadius: 50,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  trashText: {
    ...FONTS.bold,
    fontSize: 24,
    color: COLORS.white,
    marginTop: SPACING.md,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  trashSubtext: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.white,
    textAlign: 'center',
  },
});

export default HabitScreen; 