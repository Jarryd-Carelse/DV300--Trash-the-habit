import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeAuth, 
  getReactNativePersistence,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase config - updated with actual project details
const firebaseConfig = {
  apiKey: "AIzaSyCw908MqtDst-hVfvLpjxekkm8r79crBJs",
  authDomain: "trashthehabit.firebaseapp.com",
  projectId: "trashthehabit",
  storageBucket: "trashthehabit.firebasestorage.app",
  messagingSenderId: "883512405124",
  appId: "1:883512405124:web:8546cb1311c2ec24d3e6d1",
  measurementId: "G-01XE5RBPYM"
};

// Initialize Firebase only if no apps exist
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Firebase Authentication with React Native persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Authentication functions
export const signUpUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export default app;
