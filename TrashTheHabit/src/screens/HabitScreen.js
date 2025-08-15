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
import UserInfo from '../components/UserInfo';
import { getUserSettings } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import { getUserHabits, updateHabitStatus, deleteHabit } from '../config/firebase';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const HabitScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  // Real data from Firestore
  const [habits, setHabits] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [trashed, setTrashed] = useState([]);
  const [draggedHabit, setDraggedHabit] = useState(null);
  const [dragPosition] = useState(new Animated.ValueXY());
  const [activeDropZone, setActiveDropZone] = useState(null);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [showTrashOverlay, setShowTrashOverlay] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('Home');
  const [settings, setSettings] = useState({
    navbarPosition: 'right',
    soundEnabled: true,
    hapticsEnabled: true,
    notificationsEnabled: true,
  });

  const successAnim = useRef(new Animated.Value(0)).current;
  const trashAnim = useRef(new Animated.Value(0)).current;
  const dropZoneAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadSettings();
    
    // Set up real-time listener for habits
    if (user) {
      const unsubscribe = getUserHabits((habitsData) => {
        setHabits(habitsData.active || []);
        setCompleted(habitsData.completed || []);
        setTrashed(habitsData.trashed || []);
      });
      
      return () => {
        if (unsubscribe) unsubscribe();
        successAnim.setValue(0);
        trashAnim.setValue(0);
        dropZoneAnim.setValue(0);
      };
    }
  }, [user]);

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
        console.log('PanResponder granted for habit:', habit.name);
        setDraggedHabit(habit);
        setActiveDropZone(null);
        
        dragPosition.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (evt, gestureState) => {
        dragPosition.setValue({ 
          x: gestureState.dx, 
          y: gestureState.dy 
        });
        
        // Check if habit is over a drop zone
        const dropZoneY = screenHeight - 200; // Approximate position of drop zones
        if (gestureState.dy > dropZoneY) {
          if (gestureState.dx < screenWidth / 2) {
            if (activeDropZone !== 'complete') {
              console.log('Hovering over complete zone');
              setActiveDropZone('complete');
            }
          } else {
            if (activeDropZone !== 'trash') {
              console.log('Hovering over trash zone');
              setActiveDropZone('trash');
            }
          }
        } else {
          if (activeDropZone !== null) {
            console.log('Not hovering over any zone');
            setActiveDropZone(null);
          }
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const dropZoneY = screenHeight - 200;
        
        if (gestureState.dy > dropZoneY) {
          if (gestureState.dx < screenWidth / 2) {
            console.log('Dropping habit in complete zone:', habit.name);
            handleHabitDrop(habit, 'complete');
          } else {
            console.log('Dropping habit in trash zone:', habit.name);
            handleHabitDrop(habit, 'trash');
          }
        } else {
          console.log('Habit dropped outside zones, returning to original position');
        }
        
        setDraggedHabit(null);
        setActiveDropZone(null);
        dragPosition.setValue({ x: 0, y: 0 });
      },
    });
  }, [activeDropZone]);

  const handleHabitDrop = async (habit, zoneType) => {
    if (zoneType === 'complete') {
      console.log('Starting success animation');
      setShowSuccessOverlay(true);
      
      const successSequence = Animated.sequence([
        Animated.timing(successAnim, {
          toValue: 1,
          duration: 300,
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

      // Update habit status in Firestore
      const result = await updateHabitStatus(habit.id, 'completed', {
        completedAt: new Date()
      });
      
      if (!result.success) {
        Alert.alert('Error', 'Failed to update habit status');
      }
    } else if (zoneType === 'trash') {
      console.log('Starting trash animation');
      setShowTrashOverlay(true);
      
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

      // Update habit status in Firestore
      const result = await updateHabitStatus(habit.id, 'trashed', {
        trashedAt: new Date()
      });
      
      if (!result.success) {
        Alert.alert('Error', 'Failed to update habit status');
      }
    }
  };

  const handleDeleteHabit = async (habitId) => {
    // Prevent deleting a habit that's currently being dragged
    if (draggedHabit && draggedHabit.id === habitId) {
      Alert.alert('Cannot Delete', 'Please finish dragging the habit before deleting it.');
      return;
    }

    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteHabit(habitId);
              if (result.success) {
                Alert.alert('Success', 'Habit deleted successfully!');
                // The habit will be automatically removed from the list via the Firestore listener
              } else {
                Alert.alert('Error', result.error || 'Failed to delete habit');
              }
            } catch (error) {
              console.error('Error deleting habit:', error);
              Alert.alert('Error', 'Failed to delete habit. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderHabitCard = useCallback((habit) => {
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
            {habit.description && (
              <Text style={styles.habitDescription}>{habit.description}</Text>
            )}
          </View>
          
          <TouchableOpacity
            style={[
              styles.deleteButton,
              draggedHabit?.id === habit.id && styles.deleteButtonDisabled
            ]}
            onPress={() => handleDeleteHabit(habit.id)}
            activeOpacity={0.7}
            disabled={draggedHabit?.id === habit.id}
          >
            <Ionicons 
              name="trash" 
              size={20} 
              color={draggedHabit?.id === habit.id ? COLORS.gray : COLORS.error} 
            />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }, [draggedHabit, dragPosition, createPanResponder]);

  const renderDropZone = (type) => {
    const isComplete = type === 'complete';
    const isHighlighted = activeDropZone === type;
    
    const dropZoneScale = dropZoneAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.95],
    });

    const getHighlightStyle = () => {
      if (activeDropZone === type) {
        if (isComplete) {
          return {
            backgroundColor: COLORS.success + '40',
            borderColor: COLORS.success,
            transform: [{ scale: dropZoneScale }],
          };
        } else {
          return {
            backgroundColor: COLORS.error + '40',
            borderColor: COLORS.error,
            transform: [{ scale: dropZoneScale }],
          };
        }
      }
      return {};
    };

    return (
      <Animated.View
        key={type}
        style={[
          styles.dropZone,
          isComplete ? styles.completeZone : styles.trashZone,
          getHighlightStyle(),
        ]}
      >
        <View style={styles.dropZoneContent}>
          <Ionicons
            name={isComplete ? "checkmark-circle" : "trash"}
            size={40}
            color={isComplete ? COLORS.success : COLORS.error}
          />
          <Text style={styles.dropZoneTitle}>
            {isComplete ? "Complete" : "Trash"}
          </Text>
          <Text style={styles.dropZoneSubtitle}>
            {isComplete ? "Drop here to complete" : "Drop here to trash"}
          </Text>
        </View>
        
        {isHighlighted && (
          <Animated.View style={styles.dropIndicator}>
            <Text style={styles.dropIndicatorText}>Drop here!</Text>
          </Animated.View>
        )}
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.welcomeText}>
            Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'User'}!
          </Text>
          <UserInfo />
        </View>
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
            <Text style={styles.emptyText}>No habits to track today!</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to add your first habit
            </Text>
            <TouchableOpacity 
              style={styles.addFirstHabitButton}
              onPress={() => navigation.navigate('AddHabit')}
            >
              <Ionicons name="add" size={24} color={COLORS.white} />
              <Text style={styles.addFirstHabitText}>Add Habit</Text>
            </TouchableOpacity>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  welcomeText: {
    ...FONTS.bold,
    fontSize: SIZES.extraLarge,
    color: COLORS.text,
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
    paddingBottom: 200, 
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
    borderColor: COLORS.white,
    borderWidth: 2,
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
  habitDescription: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  deleteButton: {
    padding: SPACING.sm,
    marginLeft: SPACING.md,
    backgroundColor: COLORS.error + '20',
    borderRadius: SIZES.radius,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonDisabled: {
    opacity: 0.5,
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
    elevation: 10,
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
    borderWidth: 3,
    borderStyle: 'dashed',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6.27,
    elevation: 8,
  },
  completeZone: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + '10',
  },
  trashZone: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.error + '10',
  },
  dropZoneContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropZoneTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  dropZoneSubtitle: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
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
  addFirstHabitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: SIZES.radius,
    marginTop: SPACING.lg,
  },
  addFirstHabitText: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.white,
    marginLeft: SPACING.sm,
  },
});

export default HabitScreen; 