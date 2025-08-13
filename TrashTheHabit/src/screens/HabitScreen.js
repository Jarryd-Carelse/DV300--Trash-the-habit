import React, { useState, useEffect } from 'react';
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
        
        // Set the initial offset to the current position
        dragPosition.setOffset({
          x: dragPosition.x._value,
          y: dragPosition.y._value,
        });
        
        // Reset the value to 0 so we can track the delta
        dragPosition.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (evt, gestureState) => {
        // Update position with the gesture delta - no restrictions
        dragPosition.setValue({ 
          x: gestureState.dx, 
          y: gestureState.dy 
        });
        
        // Simple drop zone detection based on screen position
        const dropZoneY = screenHeight - 200;
        const dropZoneHeight = 120;
        
        // Only check drop zones when card is in the bottom area
        if (gestureState.moveY > dropZoneY) {
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
        // Flatten the offset and value
        dragPosition.flattenOffset();
        
        if (draggedHabit && activeDropZone) {
          handleDrop(activeDropZone);
        }
        
        // Animate back to original position
        Animated.spring(dragPosition, {
          toValue: { x: 0, y: 0 },
          tension: 100,
          friction: 8,
          useNativeDriver: false,
        }).start();
        
        setDraggedHabit(null);
        setActiveDropZone(null);
      },
    });
  };

  const handleDrop = (zoneType) => {
    if (!draggedHabit) return;

    if (zoneType === 'complete') {
      setCompleted(prev => [...prev, draggedHabit]);
      setHabits(prev => prev.filter(h => h.id !== draggedHabit.id));
    } else if (zoneType === 'trash') {
      setTrashed(prev => [...prev, draggedHabit]);
      setHabits(prev => prev.filter(h => h.id !== draggedHabit.id));
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
            <Text style={styles.dragIcon}>≡</Text>
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
    const isActive = activeDropZone === type;
    const isHighlighted = draggedHabit && isActive;
    
    return (
      <View
        style={[
          styles.dropZone,
          isComplete ? styles.completeZone : styles.trashZone,
          isActive && styles.activeDropZone,
          isHighlighted && styles.highlightedDropZone,
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
          <View style={styles.dropIndicator}>
            <Text style={styles.dropIndicatorText}>Drop here!</Text>
          </View>
        )}
      </View>
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
        scrollEnabled={!draggedHabit} // Disable scroll when dragging
      >
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No habits left. You crushed it! 💪</Text>
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
  },
  dragIcon: {
    fontSize: 20,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
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
  activeDropZone: {
    backgroundColor: COLORS.lightGray,
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
});

export default HabitScreen; 