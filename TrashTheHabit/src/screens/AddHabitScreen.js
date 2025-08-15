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
import { getUserSettings } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import { createHabit, getUserHabits, deleteHabit } from '../config/firebase';

const AddHabitScreen = ({ navigation }) => {
  const [habitName, setHabitName] = useState('');
  const [habitDescription, setHabitDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('AddHabit');
  const [settings, setSettings] = useState({
    navbarPosition: 'right',
    soundEnabled: true,
    hapticsEnabled: true,
    notificationsEnabled: true,
  });
  const { user } = useAuth();

  // Predefined habit categories for breaking bad habits
  const habitCategories = [
    'Smoking & Vaping',
    'Unhealthy Eating',
    'Procrastination',
    'Social Media',
    'Gaming',
    'Overspending',
    'Negative Thinking',
    'Other Bad Habit'
  ];

  // Twinning animations
  const successAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(1)).current;
  const deleteAnim = useRef(new Animated.Value(1)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const categoryAnim = useRef(new Animated.Value(0)).current;

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
      Animated.spring(categoryAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadHabits = async () => {
    try {
      if (user) {
        const unsubscribe = getUserHabits((habitsData) => {
          setHabits(habitsData.active || []);
        });
        
        return () => {
          if (unsubscribe) unsubscribe();
        };
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

    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    setLoading(true);

    try {
      const habitData = {
        name: habitName.trim(),
        description: habitDescription.trim(),
        category: selectedCategory,
        isActive: true
      };

      const result = await createHabit(habitData);
      
      if (result.success) {
        // Success animation
        Animated.sequence([
          Animated.timing(successAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(1000),
          Animated.timing(successAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();

        // Reset form
        setHabitName('');
        setHabitDescription('');
        setSelectedCategory('');
        
        // Navigate back to home
        setTimeout(() => {
          navigation.navigate('Home');
        }, 1500);
      } else {
        Alert.alert('Error', result.error || 'Failed to create habit');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create habit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    
    // Category selection animation
    Animated.sequence([
      Animated.timing(categoryAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(categoryAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleDeleteHabit = async (habitId) => {
    Alert.alert(
      'Remove Bad Habit',
      'Are you sure you want to remove this habit from your list? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              // First delete from Firestore database
              const result = await deleteHabit(habitId);
              
              if (result.success) {
                // Animate deletion after successful database deletion
                Animated.timing(deleteAnim, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }).start(() => {
                  // Remove from local state
                  setHabits(prev => prev.filter(h => h.id !== habitId));
                  deleteAnim.setValue(1);
                });
                
                Alert.alert('Success', 'Bad habit removed successfully');
              } else {
                Alert.alert('Error', result.error || 'Failed to delete habit from database');
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
          <Ionicons name="close-circle" size={20} color={COLORS.error} />
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
        <Text style={styles.title}>Break Bad Habits</Text>
        <Text style={styles.subtitle}>Choose a habit you want to break and start your journey</Text>
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
          {/* Category Selection */}
          <Animated.View 
            style={[
              styles.categorySection,
              { 
                opacity: categoryAnim,
                transform: [{ 
                  translateY: categoryAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  })
                }] 
              }
            ]}
          >
            <Text style={styles.categoryTitle}>Choose a Bad Habit Category</Text>
            <View style={styles.categoryGrid}>
              {habitCategories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category && styles.selectedCategoryButton
                  ]}
                  onPress={() => handleCategorySelect(category)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    selectedCategory === category && styles.selectedCategoryButtonText
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          <CustomInput
            label="Bad Habit Name"
            placeholder={selectedCategory ? `Enter your ${selectedCategory.toLowerCase()} habit...` : "Select a category first..."}
            value={habitName}
            onChangeText={setHabitName}
            style={styles.input}
            editable={!!selectedCategory}
          />

          <CustomInput
            label="Why You Want to Break It (Optional)"
            placeholder="Add a reason to help motivate you..."
            value={habitDescription}
            onChangeText={setHabitDescription}
            style={styles.input}
            editable={!!selectedCategory}
            multiline
            numberOfLines={3}
          />
          
          <CustomButton
            title={selectedCategory ? "Add Bad Habit to Break" : "Select Category First"}
            onPress={handleAddHabit}
            loading={loading}
            style={[styles.addButton, !selectedCategory && styles.disabledButton]}
            disabled={!selectedCategory}
          />
        </Animated.View>

        {habits.length > 0 && (
          <View style={styles.habitsList}>
            <Text style={styles.sectionTitle}>Your Bad Habits to Break</Text>
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
            <Text style={styles.successTitle}>Bad Habit Added!</Text>
            <Text style={styles.successMessage}>You're one step closer to breaking free!</Text>
            <Text style={styles.successSubtext}>Stay strong, you can beat this habit!</Text>
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
  categorySection: {
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  categoryTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  categoryButton: {
    width: '48%',
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedCategoryButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  categoryButtonText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 18,
  },
  selectedCategoryButtonText: {
    color: COLORS.white,
    ...FONTS.bold,
  },
  disabledButton: {
    opacity: 0.7,
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