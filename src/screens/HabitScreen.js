import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HabitCard from '../components/HabitCard';
import DropZone from '../components/DropZone';
import { COLORS, SIZES, FONTS, SPACING } from '../constants/theme';
import { getHabitsData, saveHabitsData, getUserData } from '../utils/storage';

const HabitScreen = () => {
  const [habits, setHabits] = useState([]);
  const [user, setUser] = useState(null);
  const [draggedHabit, setDraggedHabit] = useState(null);
  const [dragAnimation] = useState(new Animated.Value(1));
  const [activeDropZone, setActiveDropZone] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const habitsData = await getHabitsData();
      const userData = await getUserData();
      
      if (habitsData) {
        setHabits(habitsData.filter(habit => habit.isActive));
      }
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleHabitPress = (habit) => {
    Alert.alert(
      'Habit Options',
      `What would you like to do with "${habit.name}"?`,
      [
        {
          text: 'Complete',
          onPress: () => handleHabitAction(habit, 'complete'),
        },
        {
          text: 'Trash',
          onPress: () => handleHabitAction(habit, 'trash'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleHabitLongPress = (habit) => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteHabit(habit.id),
        },
      ]
    );
  };

  const handleHabitAction = async (habit, action) => {
    const updatedHabits = habits.map(h => {
      if (h.id === habit.id) {
        if (action === 'complete') {
          return { ...h, completedCount: h.completedCount + 1 };
        } else if (action === 'trash') {
          return { ...h, trashedCount: h.trashedCount + 1 };
        }
      }
      return h;
    });

    setHabits(updatedHabits);
    await saveHabitsData(updatedHabits);

    // Show success message
    const message = action === 'complete' 
      ? `Great job! You completed "${habit.name}"` 
      : `You trashed "${habit.name}" - keep it up!`;
    
    Alert.alert('Success', message);
  };

  const deleteHabit = async (habitId) => {
    const updatedHabits = habits.filter(h => h.id !== habitId);
    setHabits(updatedHabits);
    await saveHabitsData(updatedHabits);
  };

  const startDrag = (habit) => {
    setDraggedHabit(habit);
    Animated.spring(dragAnimation, {
      toValue: 0.8,
      useNativeDriver: true,
    }).start();
  };

  const endDrag = () => {
    setDraggedHabit(null);
    setActiveDropZone(null);
    Animated.spring(dragAnimation, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleDropZoneEnter = (zoneType) => {
    setActiveDropZone(zoneType);
  };

  const handleDropZoneLeave = () => {
    setActiveDropZone(null);
  };

  const handleDrop = async (zoneType) => {
    if (!draggedHabit) return;

    const action = zoneType === 'complete' ? 'complete' : 'trash';
    await handleHabitAction(draggedHabit, action);
    endDrag();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome back, {user?.name || 'User'}!
        </Text>
        <Text style={styles.subtitle}>
          Drag habits to complete or trash them
        </Text>
      </View>

      <ScrollView 
        style={styles.habitsList}
        contentContainerStyle={styles.habitsContent}
        showsVerticalScrollIndicator={false}
      >
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No habits yet!</Text>
            <Text style={styles.emptySubtext}>
              Add some habits to get started
            </Text>
          </View>
        ) : (
          habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onPress={() => handleHabitPress(habit)}
              onLongPress={() => handleHabitLongPress(habit)}
              isDragging={draggedHabit?.id === habit.id}
              dragOpacity={draggedHabit?.id === habit.id ? dragAnimation : 1}
            />
          ))
        )}
      </ScrollView>

      <View style={styles.dropZonesContainer}>
        <DropZone
          type="complete"
          isActive={activeDropZone === 'complete'}
          isHighlighted={draggedHabit && activeDropZone === 'complete'}
          onPress={() => handleDrop('complete')}
        />
        <DropZone
          type="trash"
          isActive={activeDropZone === 'trash'}
          isHighlighted={draggedHabit && activeDropZone === 'trash'}
          onPress={() => handleDrop('trash')}
        />
      </View>
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
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  welcomeText: {
    ...FONTS.bold,
    fontSize: SIZES.extraLarge,
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.gray,
  },
  habitsList: {
    flex: 1,
  },
  habitsContent: {
    padding: SPACING.lg,
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
    color: COLORS.gray,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.gray,
    textAlign: 'center',
  },
  dropZonesContainer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
});

export default HabitScreen; 