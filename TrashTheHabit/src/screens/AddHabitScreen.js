import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import FloatingNavbar from '../components/FloatingNavbar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SPACING } from '../constants/theme';
import { getHabitsData, saveHabitsData, getUserSettings } from '../utils/storage';

const AddHabitScreen = ({ navigation }) => {
  const [habitName, setHabitName] = useState('');
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('AddHabit');
  const [settings, setSettings] = useState({
    navbarPosition: 'right',
    soundEnabled: true,
    hapticsEnabled: true,
    notificationsEnabled: true,
  });

  useEffect(() => {
    loadHabits();
    loadSettings();
  }, []);

  const loadHabits = async () => {
    try {
      const habitsData = await getHabitsData();
      if (habitsData) {
        setHabits(habitsData.filter(habit => habit.isActive));
      }
    } catch (error) {
      console.error('Error loading habits:', error);
    }
  };

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

  const handleAddHabit = async () => {
    if (!habitName.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    setLoading(true);

    try {
      const newHabit = {
        id: Date.now().toString(),
        name: habitName.trim(),
        category: 'Other',
        createdAt: new Date().toISOString(),
        completedCount: 0,
        trashedCount: 0,
        isActive: true,
      };

      const updatedHabits = [...habits, newHabit];
      setHabits(updatedHabits);
      await saveHabitsData(updatedHabits);

      setHabitName('');
      Alert.alert('Success', 'Habit added successfully!');
    } catch (error) {
      console.error('Error adding habit:', error);
      Alert.alert('Error', 'Failed to add habit');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHabit = async (habitId) => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedHabits = habits.filter(h => h.id !== habitId);
            setHabits(updatedHabits);
            await saveHabitsData(updatedHabits);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add New Habit</Text>
        <Text style={styles.subtitle}>What habit do you want to break?</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inputSection}>
          <CustomInput
            label="Habit Name"
            placeholder="e.g., Check social media first thing"
            value={habitName}
            onChangeText={setHabitName}
            autoCapitalize="words"
          />

          <CustomButton
            title="Add Habit"
            onPress={handleAddHabit}
            loading={loading}
            disabled={!habitName.trim()}
            style={styles.addButton}
          />
        </View>

        <View style={styles.currentHabitsSection}>
          <Text style={styles.sectionTitle}>Current Habits</Text>
          {habits.length === 0 ? (
            <Text style={styles.emptyText}>No habits yet. Add your first one above!</Text>
          ) : (
            habits.map((habit) => (
              <View key={habit.id} style={styles.habitItem}>
                <View style={styles.habitInfo}>
                  <Text style={styles.habitName}>{habit.name}</Text>
                  <Text style={styles.habitCategory}>{habit.category}</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteHabit(habit.id)}
                >
                  <Ionicons name="trash" size={20} color={COLORS.accent} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

    
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
  title: {
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
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  inputSection: {
    marginBottom: SPACING.xl,
  },
  addButton: {
    marginTop: SPACING.md,
  },
  sectionTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  emptyText: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: SIZES.radius,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  habitCategory: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  deleteButton: {
    padding: SPACING.sm,
  },
});

export default AddHabitScreen; 