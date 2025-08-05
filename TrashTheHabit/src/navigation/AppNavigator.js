import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HabitScreen from '../screens/HabitScreen';
import AddHabitScreen from '../screens/AddHabitScreen';
import ProgressScreen from '../screens/ProgressScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
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
  );
};

export default AppNavigator; 