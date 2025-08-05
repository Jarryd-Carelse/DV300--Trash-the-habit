import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER_SETTINGS: 'user_settings',
  USER_DATA: 'user_data',
  HABITS_DATA: 'habits_data',
  PROGRESS_DATA: 'progress_data',
  IS_LOGGED_IN: 'is_logged_in',
};

// Save user settings
export const saveUserSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving user settings:', error);
    return false;
  }
};

// Get user settings
export const getUserSettings = async () => {
  try {
    const settings = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    return settings ? JSON.parse(settings) : null;
  } catch (error) {
    console.error('Error getting user settings:', error);
    return null;
  }
};

// Save user data
export const saveUserData = async (userData) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error('Error saving user data:', error);
    return false;
  }
};

// Get user data
export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Save habits data
export const saveHabitsData = async (habits) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.HABITS_DATA, JSON.stringify(habits));
    return true;
  } catch (error) {
    console.error('Error saving habits data:', error);
    return false;
  }
};

// Get habits data
export const getHabitsData = async () => {
  try {
    const habits = await AsyncStorage.getItem(STORAGE_KEYS.HABITS_DATA);
    return habits ? JSON.parse(habits) : null;
  } catch (error) {
    console.error('Error getting habits data:', error);
    return null;
  }
};

// Save progress data
export const saveProgressData = async (progress) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS_DATA, JSON.stringify(progress));
    return true;
  } catch (error) {
    console.error('Error saving progress data:', error);
    return false;
  }
};

// Get progress data
export const getProgressData = async () => {
  try {
    const progress = await AsyncStorage.getItem(STORAGE_KEYS.PROGRESS_DATA);
    return progress ? JSON.parse(progress) : null;
  } catch (error) {
    console.error('Error getting progress data:', error);
    return null;
  }
};

// Set login status
export const setLoginStatus = async (isLoggedIn) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, JSON.stringify(isLoggedIn));
    return true;
  } catch (error) {
    console.error('Error setting login status:', error);
    return false;
  }
};

// Get login status
export const getLoginStatus = async () => {
  try {
    const status = await AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
    return status ? JSON.parse(status) : false;
  } catch (error) {
    console.error('Error getting login status:', error);
    return false;
  }
};

// Clear all data (for logout or reset)
export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_SETTINGS,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.HABITS_DATA,
      STORAGE_KEYS.PROGRESS_DATA,
      STORAGE_KEYS.IS_LOGGED_IN,
    ]);
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

// Initialize app with dummy data if no data exists
export const initializeAppData = async () => {
  try {
    const settings = await getUserSettings();
    const userData = await getUserData();
    const habitsData = await getHabitsData();
    const progressData = await getProgressData();

    if (!settings) {
      const { dummySettings } = require('./dummyData');
      await saveUserSettings(dummySettings);
    }

    if (!userData) {
      const { dummyUser } = require('./dummyData');
      await saveUserData(dummyUser);
    }

    if (!habitsData) {
      const { dummyHabits } = require('./dummyData');
      await saveHabitsData(dummyHabits);
    }

    if (!progressData) {
      const { dummyProgress } = require('./dummyData');
      await saveProgressData(dummyProgress);
    }

    return true;
  } catch (error) {
    console.error('Error initializing app data:', error);
    return false;
  }
}; 