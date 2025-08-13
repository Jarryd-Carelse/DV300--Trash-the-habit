import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
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

  // Twinning animations
  const successAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(1)).current;
  const deleteAnim = useRef(new Animated.Value(1)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadHabits();
    loadSettings();
    
   
    Animated.parallel([
      Animated.spring(headerAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
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
      // Shake animation for validation error
      Animated.sequence([
        Animated.timing(formAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(formAnim, {
          toValue: 1.05,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(formAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      
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
      
      // Success animation
      Animated.sequence([
        Animated.timing(successAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.delay(1500), 
        Animated.timing(successAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
      
    
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
            try {
              const updatedHabits = habits.filter(h => h.id !== habitId);
              setHabits(updatedHabits);
              await saveHabitsData(updatedHabits);
              
              // Delete animation
              Animated.sequence([
                Animated.timing(deleteAnim, {
                  toValue: 0.8,
                  duration: 200,
                  useNativeDriver: true,
                }),
                Animated.timing(deleteAnim, {
                  toValue: 1,
                  duration: 200,
                  useNativeDriver: true,
                }),
              ]).start();
            } catch (error) {
              console.error('Error deleting habit:', error);
              Alert.alert('Error', 'Failed to delete habit');
            }
          }
        },
      ]
    );
  };

  const renderHabitItem = (habit) => {
    return (
      <Animated.View
        key={habit.id}
        style={[
          styles.habitItem,
          { transform: [{ scale: deleteAnim }] }
        ]}
      >
        <View style={styles.habitInfo}>
          <Text style={styles.habitName}>{habit.name}</Text>
          <Text style={styles.habitCategory}>{habit.category}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteHabit(habit.id)}
          activeOpacity={0.7}
        >
          <Ionicons name="trash" size={20} color={COLORS.accent} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          { transform: [{ translateY: headerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0],
          })}] }
        ]}
      >
        <Text style={styles.title}>Add New Habit</Text>
        <Text style={styles.subtitle}>What would you like to change?</Text>
      </Animated.View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.formContainer,
            { transform: [{ scale: formAnim }] }
          ]}
        >
          {/* Progress Indicator */}
          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>Your Habit Journey</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min((habits.length / 5) * 100, 100)}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {habits.length} of 5 habits • {habits.length >= 5 ? 'Amazing progress!' : 'Keep building!'}
            </Text>
          </View>

          <CustomInput
            label="Habit Name"
            placeholder="Enter your habit..."
            value={habitName}
            onChangeText={setHabitName}
            style={styles.input}
          />
          
          <CustomButton
            title="Add Habit"
            onPress={handleAddHabit}
            loading={loading}
            style={styles.addButton}
          />
        </Animated.View>

        {habits.length > 0 && (
          <View style={styles.habitsList}>
            <Text style={styles.sectionTitle}>Your Current Habits</Text>
            {habits.map(renderHabitItem)}
          </View>
        )}
      </ScrollView>

     
      {successAnim > 0 && (
        <Animated.View 
          style={[
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
              <Ionicons name="checkmark-circle" size={80} color={COLORS.white} />
            </View>
            <Text style={styles.successTitle}>Habit Added!</Text>
            <Text style={styles.successMessage}>You're one step closer to your goals!</Text>
            <Text style={styles.successSubtext}>Keep building those positive habits!</Text>
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
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  formContainer: {
    marginBottom: SPACING.xs,
    paddingVertical: SPACING.lg,
  },
  input: {
    marginBottom: SPACING.lg,
  },
  addButton: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  habitsList: {
    marginTop: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  emptySubtext: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    textAlign: 'center',
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
  progressSection: {
    marginBottom: SPACING.xxl,
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  progressTitle: {
    ...FONTS.bold,
    fontSize: SIZES.extraLarge,
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  progressBar: {
    width: '80%',
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  progressText: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary + '80', // Semi-transparent overlay
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successContent: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  successTitle: {
    ...FONTS.bold,
    fontSize: SIZES.extraLarge,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  successMessage: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  successSubtext: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
});

export default AddHabitScreen; 