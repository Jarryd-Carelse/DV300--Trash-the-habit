import React, { useState, useEffect, useRef } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SPACING, SHADOWS } from '../constants/theme';
import FloatingNavbar from '../components/FloatingNavbar';
import { getUserSettings } from '../utils/storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const HabitScreen = ({ navigation }) => {
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

  useEffect(() => {
    loadSettings();
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

  const createPanResponder = (habit) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        setDraggedHabit(habit);
        setActiveDropZone(null);
        
        // Set the initial offset to the current position
        dragPosition.setOffset({
          x: dragPosition.x._value,
          y: dragPosition.y._value,
        });
        
        // Reset the value to 0 so we can track the delta
        dragPosition.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (evt, gestureState) => {
        // Update position with the gesture delta
        dragPosition.setValue({ 
          x: gestureState.dx, 
          y: gestureState.dy 
        });
        
        // Drop zone detection - allow card to overlap zones
        const dropZoneY = screenHeight - 200;
        
        if (gestureState.moveY > dropZoneY - 50) { // Allow earlier detection
          const leftZoneX = 20;
          const rightZoneX = screenWidth / 2 + 20;
          const zoneWidth = (screenWidth - 80) / 2;
          
          if (gestureState.moveX > leftZoneX && gestureState.moveX < leftZoneX + zoneWidth) {
            setActiveDropZone('complete');
          } else if (gestureState.moveX > rightZoneX && gestureState.moveX < rightZoneX + zoneWidth) {
            setActiveDropZone('trash');
          } else {
            setActiveDropZone(null);
          }
        } else {
          setActiveDropZone(null);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (draggedHabit && activeDropZone) {
          handleDrop(activeDropZone, draggedHabit);
        }
        
        // Animate back to original position
        Animated.spring(dragPosition, {
          toValue: { x: 0, y: 0 },
          tension: 100,
          friction: 8,
          useNativeDriver: false,
        }).start(() => {
          setDraggedHabit(null);
          setActiveDropZone(null);
        });
      },
    });
  };

  const handleDrop = (zoneType, habit) => {
    if (zoneType === 'complete') {
      // Success animation
      Animated.sequence([
        Animated.timing(successAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(successAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setCompleted(prev => [...prev, { ...habit, completedAt: new Date() }]);
      setHabits(prev => prev.filter(h => h.id !== habit.id));
    } else if (zoneType === 'trash') {
      // Trash animation
      Animated.sequence([
        Animated.timing(trashAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(trashAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setTrashed(prev => [...prev, { ...habit, trashedAt: new Date() }]);
      setHabits(prev => prev.filter(h => h.id !== habit.id));
    }
  };

  const renderHabitCard = (habit) => {
    const isDragging = draggedHabit?.id === habit.id;
    
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
        {...createPanResponder(habit).panHandlers}
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
  };

  const renderDropZone = (type) => {
    const isComplete = type === 'complete';
    const isHighlighted = activeDropZone === type;
    
    const dropZoneScale = dropZoneAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.05],
    });

    return (
      <Animated.View
        key={type}
        style={[
          styles.dropZone,
          isComplete ? styles.completeZone : styles.trashZone,
          isHighlighted && styles.highlightedDropZone,
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
              { opacity: dropZoneAnim }
            ]}
          >
            <Text style={styles.dropIndicatorText}>Drop here!</Text>
          </Animated.View>
        )}
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
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
        contentContainerStyle={styles.habitsContent}
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

      <View style={styles.dropZonesContainer}>
        {renderDropZone('complete')}
        {renderDropZone('trash')}
      </View>

      {/* Success Animation Overlay */}
      {successAnim > 0 && (
        <Animated.View 
          style={[
            styles.animationOverlay,
            styles.successOverlay,
            {
              opacity: successAnim,
              transform: [{ scale: successAnim }]
            }
          ]}
        >
          <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
          <Text style={styles.animationText}>Habit Completed!</Text>
        </Animated.View>
      )}

      {/* Trash Animation Overlay */}
      {trashAnim > 0 && (
        <Animated.View 
          style={[
            styles.animationOverlay,
            styles.trashOverlay,
            {
              opacity: trashAnim,
              transform: [{ scale: trashAnim }]
            }
          ]}
        >
          <Ionicons name="trash" size={80} color={COLORS.accent} />
          <Text style={styles.animationText}>Habit Trashed!</Text>
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
    paddingBottom: 200, // Account for drop zones
  },
  habitCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  draggingCard: {
    ...SHADOWS.dark,
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
    ...SHADOWS.medium,
  },
  completeZone: {
    borderColor: COLORS.success,
  },
  trashZone: {
    borderColor: COLORS.accent,
  },
  highlightedDropZone: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
    borderWidth: 3,
    borderStyle: 'solid',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
  },
  successOverlay: {
    backgroundColor: COLORS.success + '20',
  },
  trashOverlay: {
    backgroundColor: COLORS.accent + '20',
  },
  animationText: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
});

export default HabitScreen; 