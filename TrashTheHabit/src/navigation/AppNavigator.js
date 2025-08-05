import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import FloatingNavbar from '../components/FloatingNavbar';
import HabitScreen from '../screens/HabitScreen';
import AddHabitScreen from '../screens/AddHabitScreen';
import ProgressScreen from '../screens/ProgressScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { getUserSettings } from '../utils/storage';

const Stack = createStackNavigator();

const AppNavigator = ({ navigation }) => {
  const [currentRoute, setCurrentRoute] = useState('Home');
  const [navbarPosition, setNavbarPosition] = useState('right');

  useEffect(() => {
    loadNavbarPosition();
  }, []);

  const loadNavbarPosition = async () => {
    try {
      const settings = await getUserSettings();
      if (settings?.navbarPosition) {
        setNavbarPosition(settings.navbarPosition);
      }
    } catch (error) {
      console.error('Error loading navbar position:', error);
    }
  };

  const handleNavigation = (routeName) => {
    setCurrentRoute(routeName);
    // Navigate to the screen
    if (navigation && navigation.navigate) {
      navigation.navigate(routeName);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HabitScreen} />
        <Stack.Screen name="AddHabit" component={AddHabitScreen} />
        <Stack.Screen name="Progress" component={ProgressScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
      
      <FloatingNavbar
        currentRoute={currentRoute}
        onNavigate={handleNavigation}
        position={navbarPosition}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AppNavigator; 