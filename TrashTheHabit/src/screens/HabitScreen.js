import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
import CustomAlert from '../components/CustomAlert';
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
  const [failed, setFailed] = useState([]);
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
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
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
        setFailed(habitsData.failed || []);
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
          setDraggedHabit(habit);
          setActiveDropZone(null);
        },
              onPanResponderMove: (evt, gestureState) => {
          const offsetX = gestureState.dx;
          const offsetY = gestureState.dy;
          
          dragPosition.setValue({ x: offsetX, y: offsetY });
          
          if (gestureState.moveY > screenHeight - 200) {
            const leftBuffer = screenWidth * 0.4;
            const rightBuffer = screenWidth * 0.6;
          
                      if (gestureState.moveX < leftBuffer) {
              if (activeDropZone !== 'complete') {
                setActiveDropZone('complete');
              }
            } else if (gestureState.moveX > rightBuffer) {
              if (activeDropZone !== 'failed') {
                setActiveDropZone('failed');
              }
            }
          } else {
            if (activeDropZone !== null) {
              setActiveDropZone(null);
            }
          }
      },
              onPanResponderRelease: (evt, gestureState) => {
          if (gestureState.moveY > screenHeight - 200) {
            const leftBuffer = screenWidth * 0.4;
            const rightBuffer = screenWidth * 0.6;
          
                      if (gestureState.moveX < leftBuffer) {
              handleHabitDrop(habit, 'complete');
            } else if (gestureState.moveX > rightBuffer) {
              handleHabitDrop(habit, 'failed');
            }
          }
          
          dragPosition.setValue({ x: 0, y: 0 });
          setDraggedHabit(null);
          setActiveDropZone(null);
      },
    });
  }, [activeDropZone]);

  const handleHabitDrop = async (habit, zoneType) => {
    if (zoneType === 'complete') {
      const result = await updateHabitStatus(habit.id, 'completed', { completedAt: new Date() });
      
      if (result.success) {
        setShowSuccessOverlay(true);
        Animated.sequence([
          Animated.timing(successAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(2000),
          Animated.timing(successAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setShowSuccessOverlay(false);
        });
      } else {
        setAlertConfig({
          visible: true,
          title: 'Error',
          message: 'Failed to update habit status',
          type: 'error',
        });
      }
    } else if (zoneType === 'failed') {
      const result = await updateHabitStatus(habit.id, 'failed', { failedAt: new Date() });
      
      if (result.success) {
        setShowTrashOverlay(true);
        Animated.sequence([
          Animated.timing(trashAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(2000),
          Animated.timing(trashAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setShowTrashOverlay(false);
        });
      } else {
        setAlertConfig({
          visible: true,
          title: 'Error',
          message: 'Failed to update habit status',
          type: 'error',
        });
      }
    }
  };

  const handleDeleteHabit = async (habitId) => {
    // Prevent deleting a habit that's currently being dragged
    if (draggedHabit && draggedHabit.id === habitId) {
      setAlertConfig({
        visible: true,
        title: 'Cannot Delete',
        message: 'Please finish dragging the habit before deleting it.',
        type: 'warning',
      });
      return;
    }

    setAlertConfig({
      visible: true,
      title: 'Delete Habit',
      message: 'Are you sure you want to delete this habit? This action cannot be undone.',
      type: 'warning',
      showCancel: true,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const result = await deleteHabit(habitId);
          if (result.success) {
            setAlertConfig({
              visible: true,
              title: 'Success',
              message: 'Habit deleted successfully!',
              type: 'success',
              autoClose: true,
              autoCloseDelay: 2000,
            });
            // The habit will be automatically removed from the list via the Firestore listener
          } else {
            setAlertConfig({
              visible: true,
              title: 'Error',
              message: result.error || 'Failed to delete habit',
              type: 'error',
            });
          }
        } catch (error) {
          console.error('Error deleting habit:', error);
          setAlertConfig({
            visible: true,
            title: 'Error',
            message: 'Failed to delete habit. Please try again.',
            type: 'error',
          });
        }
      },
    });
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
              { translateX: dragPosition.x },
              { translateY: dragPosition.y },
              { 
                rotate: dragPosition.y.interpolate({
                  inputRange: [-100, 0, 100],
                  outputRange: ['-5deg', '0deg', '5deg']
                })
              }
            ],
            zIndex: 1000,
            elevation: 10,
            shadowColor: COLORS.white,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
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

  const renderDropZone = (zoneType) => {
    const isHighlighted = activeDropZone === zoneType;
    const isCompleteZone = zoneType === 'complete';
    const isFailedZone = zoneType === 'failed';

    const zoneConfig = {
      complete: {
        title: 'Beat Habit Today!',
        subtitle: 'Drop here to mark as beaten',
        color: COLORS.success,
        icon: 'checkmark-circle',
        message: 'Well done! You beat a habit today!'
      },
      failed: {
        title: 'Failed to Break Habit',
        subtitle: 'Drop here if you failed today',
        color: COLORS.error,
        icon: 'close-circle',
        message: 'Keep trying! Tomorrow is another day!'
      }
    };

    const config = zoneConfig[zoneType];

    const dropZoneScale = dropZoneAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.95],
    });

    const getHighlightStyle = () => {
      if (activeDropZone === zoneType) {
        if (isCompleteZone) {
          return {
            backgroundColor: COLORS.success + '40',
            borderColor: COLORS.success,
            transform: [{ scale: dropZoneScale }],
          };
        } else if (isFailedZone) {
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
        key={zoneType}
        style={[
          styles.dropZone,
          isCompleteZone ? styles.completeZone : styles.failedZone,
          getHighlightStyle(),
        ]}
      >
        <View style={styles.dropZoneContent}>
          <Ionicons
            name={config.icon}
            size={40}
            color={config.color}
          />
          <Text style={[styles.dropZoneTitle, { color: config.color }]}>
            {config.title}
          </Text>
          <Text style={styles.dropZoneSubtitle}>
            {config.subtitle}
          </Text>
          {isHighlighted && (
            <View style={styles.dropIndicator}>
              <Text style={styles.dropIndicatorText}>Drop here!</Text>
            </View>
          )}
        </View>
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
        {renderDropZone('failed')}
      </View>

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

      {showTrashOverlay && (
        <Animated.View 
          style={[
            styles.animationOverlay,
            styles.failedOverlay,
            {
              opacity: trashAnim,
            }
          ]}
        >
          <Animated.View style={[
            styles.failedContent,
            {
              transform: [{
                scale: trashAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.8, 1.1, 1],
                })
              }]
            }]
          }>
            <View style={styles.failedIconContainer}>
              <Ionicons name="close-circle" size={100} color={COLORS.white} />
            </View>
            <Text style={styles.animationText}>Keep trying! Tomorrow is another day!</Text>
            <Text style={styles.failedSubtext}>Don't give up, you've got this!</Text>
          </Animated.View>
        </Animated.View>
      )}

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        showCancel={alertConfig.showCancel}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        onConfirm={alertConfig.onConfirm}
        onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
        autoClose={alertConfig.autoClose}
        autoCloseDelay={alertConfig.autoCloseDelay}
      />

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
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'center',
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
    shadowColor: COLORS.white,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
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
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  failedZone: {
    borderColor: COLORS.error,
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
  failedOverlay: {
    backgroundColor: COLORS.error + '90',
  },
  failedContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  failedIconContainer: {
    marginBottom: SPACING.lg,
  },
  failedSubtext: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.white,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});

export default HabitScreen; 