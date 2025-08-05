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

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const HabitScreen = ({ navigation }) => {
  // Use dummy data as specified in requirements
  const [habits, setHabits] = useState([
    { id: 1, name: 'Vaping', emoji: '💨' },
    { id: 2, name: 'Overeating', emoji: '🍕' },
    { id: 3, name: 'Doomscrolling', emoji: '📱' },
    { id: 4, name: 'Procrastinating', emoji: '⏰' },
    { id: 5, name: 'Sleeping Late', emoji: '😴' },
  ]);
  
  const [completed, setCompleted] = useState([]);
  const [trashed, setTrashed] = useState([]);
  const [draggedHabit, setDraggedHabit] = useState(null);
  const [dragPosition] = useState(new Animated.ValueXY());
  const [activeDropZone, setActiveDropZone] = useState(null);
  const [user] = useState({ name: 'Jarryd' });
  const [currentRoute, setCurrentRoute] = useState('Home');
  const [navbarPosition, setNavbarPosition] = useState('right');

  const handleNavigation = (routeName) => {
    setCurrentRoute(routeName);
    navigation.navigate(routeName);
  };

  const createPanResponder = (habit) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setDraggedHabit(habit);
        dragPosition.setOffset({
          x: dragPosition.x._value,
          y: dragPosition.y._value,
        });
        dragPosition.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (evt, gestureState) => {
        dragPosition.setValue({ x: gestureState.dx, y: gestureState.dy });
        
        // Check if dragging over drop zones
        const dropZoneY = screenHeight - 200; // Approximate Y position of drop zones
        const dropZoneHeight = 120;
        
        if (gestureState.moveY > dropZoneY && gestureState.moveY < dropZoneY + dropZoneHeight) {
          // Check X position for left/right drop zones
          const leftZoneX = 20; // Left drop zone X position
          const rightZoneX = screenWidth / 2 + 20; // Right drop zone X position
          const zoneWidth = (screenWidth - 80) / 2; // Width of each drop zone
          
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
      onPanResponderRelease: () => {
        dragPosition.flattenOffset();
        
        if (draggedHabit && activeDropZone) {
          handleDrop(activeDropZone);
        }
        
        setDraggedHabit(null);
        setActiveDropZone(null);
        
        Animated.spring(dragPosition, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
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
            transform: dragPosition.getTranslateTransform(),
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
          
          <View style={styles.emojiContainer}>
            <Text style={styles.emoji}>{habit.emoji}</Text>
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
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome back, {user.name}!
        </Text>
        <Text style={styles.subtitle}>
          Your habits for today
        </Text>
      </View>

      {/* Habits List Section */}
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

      {/* Drop Zones Section */}
      <View style={styles.dropZonesContainer}>
        {renderDropZone('complete')}
        {renderDropZone('trash')}
      </View>

      {/* Floating Navigation Bar */}
      <FloatingNavbar
        currentRoute={currentRoute}
        onNavigate={handleNavigation}
        position={navbarPosition}
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
  emojiContainer: {
    marginLeft: SPACING.md,
  },
  emoji: {
    fontSize: 24,
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
    transform: [{ scale: 1.05 }],
  },
  highlightedDropZone: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
    borderWidth: 3,
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