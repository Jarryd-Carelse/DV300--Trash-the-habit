import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Alert, PanResponder, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

function AppContent() {
  const insets = useSafeAreaInsets();
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [habits, setHabits] = useState([
    { id: '1', name: 'Check social media', category: 'Digital', completedCount: 2, trashedCount: 1 },
    { id: '2', name: 'Bite nails', category: 'Health', completedCount: 0, trashedCount: 3 },
    { id: '3', name: 'Procrastinate', category: 'Productivity', completedCount: 1, trashedCount: 2 },
  ]);
  const [newHabitName, setNewHabitName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Other');
  const [draggedHabit, setDraggedHabit] = useState(null);
  const [dragPosition] = useState(new Animated.ValueXY());
  const [activeDropZone, setActiveDropZone] = useState(null);

  const handleAddHabit = () => {
    if (!newHabitName.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    const newHabit = {
      id: Date.now().toString(),
      name: newHabitName.trim(),
      category: selectedCategory,
      completedCount: 0,
      trashedCount: 0,
    };

    setHabits([...habits, newHabit]);
    setNewHabitName('');
    setSelectedCategory('Other');
    
    Alert.alert('Success', 'Habit added successfully!');
  };

  const handleDeleteHabit = (habitId) => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setHabits(habits.filter(h => h.id !== habitId));
          },
        },
      ]
    );
  };

  const handleHabitAction = (habit, action) => {
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
    
    const message = action === 'complete' 
      ? `Great job! You completed "${habit.name}"` 
      : `You trashed "${habit.name}" - keep it up!`;
    
    Alert.alert('Success', message);
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
        
        // Simple drop zone detection based on Y position
        if (gestureState.dy > 100) {
          // Check X position for left/right drop zones
          if (gestureState.dx < -50) {
            setActiveDropZone('complete');
          } else if (gestureState.dx > 50) {
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
          handleHabitAction(draggedHabit, activeDropZone);
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

  const renderHomeScreen = () => (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome back, Jarryd!</Text>
        <Text style={styles.subtitle}>Drag habits to complete or trash them</Text>
      </View>
      
      <ScrollView style={styles.habitsList}>
        {habits.map((habit) => (
          <Animated.View 
            key={habit.id} 
            style={[
              styles.habitCard,
              draggedHabit?.id === habit.id && {
                transform: dragPosition.getTranslateTransform(),
                zIndex: 1000,
                elevation: 10,
              }
            ]}
            {...createPanResponder(habit).panHandlers}
          >
            <View style={styles.habitInfo}>
              <Text style={styles.habitName}>{habit.name}</Text>
              <Text style={styles.habitCategory}>{habit.category}</Text>
            </View>
            <View style={styles.habitStats}>
              <View style={styles.statItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.statText}>{habit.completedCount}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="trash" size={16} color="#FF5252" />
                <Text style={styles.statText}>{habit.trashedCount}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.dragHandle}
              onPress={() => {
                Alert.alert(
                  'Habit Action',
                  `What would you like to do with "${habit.name}"?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Complete', 
                      onPress: () => handleHabitAction(habit, 'complete') 
                    },
                    { 
                      text: 'Trash', 
                      onPress: () => handleHabitAction(habit, 'trash') 
                    },
                  ]
                );
              }}
            >
              <Ionicons name="menu" size={20} color="#B0B0B0" />
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
      
      <View style={styles.dropZones}>
        <View style={[
          styles.dropZone,
          activeDropZone === 'complete' && styles.dropZoneActive
        ]}>
          <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
          <Text style={styles.dropZoneText}>Complete</Text>
          {activeDropZone === 'complete' && (
            <View style={styles.dropIndicator}>
              <Text style={styles.dropIndicatorText}>Drop here!</Text>
            </View>
          )}
        </View>
        <View style={[
          styles.dropZone,
          activeDropZone === 'trash' && styles.dropZoneActive
        ]}>
          <Ionicons name="trash" size={32} color="#FF5252" />
          <Text style={styles.dropZoneText}>Trash</Text>
          {activeDropZone === 'trash' && (
            <View style={styles.dropIndicator}>
              <Text style={styles.dropIndicatorText}>Drop here!</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderAddHabitScreen = () => (
    <ScrollView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Add New Habit</Text>
        <Text style={styles.subtitle}>What habit do you want to break?</Text>
      </View>
      
      <View style={styles.content}>
        {/* Add New Habit Form */}
        <View style={styles.addForm}>
          <Text style={styles.sectionTitle}>Add New Habit</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Habit Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Check social media first thing"
              placeholderTextColor="#666666"
              value={newHabitName}
              onChangeText={setNewHabitName}
              autoCapitalize="words"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Category</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              {['Digital', 'Health', 'Productivity', 'Social', 'Financial', 'Other'].map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && styles.categoryChipSelected,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[
                    styles.categoryChipText,
                    selectedCategory === category && styles.categoryChipTextSelected,
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <TouchableOpacity
            style={[styles.addButton, !newHabitName.trim() && styles.addButtonDisabled]}
            onPress={handleAddHabit}
            disabled={!newHabitName.trim()}
          >
            <Text style={[styles.addButtonText, !newHabitName.trim() && styles.addButtonTextDisabled]}>
              Add Habit
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Current Habits List */}
        <View style={styles.currentHabits}>
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
                  <Ionicons name="trash" size={20} color="#FF5252" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );

  const renderProgressScreen = () => (
    <ScrollView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Progress</Text>
        <Text style={styles.subtitle}>Track your habit-breaking journey</Text>
      </View>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statTitle}>Completed This Week</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>8</Text>
          <Text style={styles.statTitle}>Trashed This Week</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>5</Text>
          <Text style={styles.statTitle}>Longest Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statTitle}>Current Streak</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderSettingsScreen = () => (
    <ScrollView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your experience</Text>
      </View>
      
      <View style={styles.settingsList}>
        <View style={styles.settingItem}>
          <Text style={styles.settingTitle}>Navbar Position</Text>
          <Text style={styles.settingSubtitle}>Right-handed</Text>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingTitle}>Sound Effects</Text>
          <Text style={styles.settingSubtitle}>Enabled</Text>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingTitle}>Haptic Feedback</Text>
          <Text style={styles.settingSubtitle}>Enabled</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Home':
        return renderHomeScreen();
      case 'AddHabit':
        return renderAddHabitScreen();
      case 'Progress':
        return renderProgressScreen();
      case 'Settings':
        return renderSettingsScreen();
      default:
        return renderHomeScreen();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
        {renderScreen()}
        
        {/* Floating Navigation Bar */}
        <View style={[styles.floatingNavbar, { bottom: insets.bottom + 20 }]}>
          <TouchableOpacity 
            style={[styles.navItem, currentScreen === 'Home' && styles.navItemActive]}
            onPress={() => setCurrentScreen('Home')}
          >
            <Ionicons name="home" size={24} color={currentScreen === 'Home' ? '#FFFFFF' : '#B0B0B0'} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navItem, currentScreen === 'AddHabit' && styles.navItemActive]}
            onPress={() => setCurrentScreen('AddHabit')}
          >
            <Ionicons name="add-circle" size={24} color={currentScreen === 'AddHabit' ? '#FFFFFF' : '#B0B0B0'} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navItem, currentScreen === 'Progress' && styles.navItemActive]}
            onPress={() => setCurrentScreen('Progress')}
          >
            <Ionicons name="trending-up" size={24} color={currentScreen === 'Progress' ? '#FFFFFF' : '#B0B0B0'} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navItem, currentScreen === 'Settings' && styles.navItemActive]}
            onPress={() => setCurrentScreen('Settings')}
          >
            <Ionicons name="settings" size={24} color={currentScreen === 'Settings' ? '#FFFFFF' : '#B0B0B0'} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  screen: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#B0B0B0',
  },
  content: {
    padding: 20,
    paddingBottom: 250, // Add bottom padding to prevent content from being hidden behind floating navbar
  },
  habitsList: {
    padding: 20,
    paddingBottom: 250, // Add bottom padding to prevent content from being hidden behind floating navbar
  },
  habitCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#333333',
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  habitCategory: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  habitStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  statText: {
    fontSize: 14,
    color: '#E0E0E0',
    marginLeft: 4,
  },
  dropZones: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#1E1E1E',
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  dropZone: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    borderWidth: 2,
    borderColor: '#444444',
    borderStyle: 'dashed',
    minHeight: 120,
  },
  dropZoneText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  habitItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '48%',
    marginBottom: 16,
    marginHorizontal: '1%',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
  },
  settingsList: {
    padding: 20,
  },
  settingItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#9E9E9E',
  },
  floatingNavbar: {
    position: 'absolute',
    right: 20,
    backgroundColor: '#1E1E1E',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 8,
    flexDirection: 'column',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8.84,
    elevation: 12,
    minHeight: 200,
    borderWidth: 1,
    borderColor: '#333333',
  },
  navItem: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  navItemActive: {
    backgroundColor: '#4CAF50',
  },
  addForm: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#444444',
    color: '#FFFFFF',
  },
  categoryScroll: {
    marginTop: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#444444',
    marginRight: 12,
  },
  categoryChipSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#E0E0E0',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonDisabled: {
    backgroundColor: '#444444',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButtonTextDisabled: {
    color: '#888888',
    fontSize: 16,
    fontWeight: 'bold',
  },
  currentHabits: {
    marginTop: 20,
  },
  habitInfo: {
    flex: 1,
  },
  deleteButton: {
    padding: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#B0B0B0',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
  dragHandle: {
    padding: 8,
    marginLeft: 8,
  },
  dropZoneActive: {
    backgroundColor: '#2A4A2A',
    borderColor: '#4CAF50',
    borderWidth: 3,
    transform: [{ scale: 1.05 }],
  },
  dropIndicator: {
    position: 'absolute',
    top: -10,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dropIndicatorText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Progress Screen Styles
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#B0B0B0',
    textAlign: 'center',
  },
  // Settings Screen Styles
  settingsList: {
    padding: 20,
  },
  settingItem: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  // Add Habit Screen Additional Styles
  habitItem: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#333333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}
