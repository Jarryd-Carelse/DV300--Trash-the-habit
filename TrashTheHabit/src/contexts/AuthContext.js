import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  onAuthStateChange, 
  signInUser, 
  signUpUser, 
  signOutUser 
} from '../config/firebase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChange(async (user) => {
      if (user) {
        // User is signed in
        setUser(user);
        setIsAuthenticated(true);
        // Store user data in AsyncStorage for persistence
        await AsyncStorage.setItem('user', JSON.stringify({
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified
        }));
      } else {
        // User is signed out
        setUser(null);
        setIsAuthenticated(false);
        // Clear user data from AsyncStorage
        await AsyncStorage.removeItem('user');
      }
      setLoading(false);
    });

    // Check for stored user data on app start
    const checkStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          // Note: This doesn't restore the full Firebase user object,
          // but it helps with initial state while Firebase initializes
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.log('Error reading stored user data:', error);
      }
    };

    checkStoredUser();

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const result = await signInUser(email, password);
      if (result.success) {
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (email, password) => {
    try {
      const result = await signUpUser(email, password);
      if (result.success) {
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      const result = await signOutUser();
      if (result.success) {
        setUser(null);
        setIsAuthenticated(false);
        await AsyncStorage.removeItem('user');
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
