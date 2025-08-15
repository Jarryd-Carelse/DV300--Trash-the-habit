import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeAuth, 
  getReactNativePersistence,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  onSnapshot,
  serverTimestamp,
  setDoc,
  getDoc,
  writeBatch
} from 'firebase/firestore';
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
let authInstance;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  
  // Initialize Firebase Authentication with React Native persistence
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  if (error.code === 'auth/already-initialized') {
    // If auth is already initialized, get the existing instance
    authInstance = getAuth(app);
  } else {
    throw error;
  }
}

export const auth = authInstance;

// Initialize Firestore
export const db = getFirestore(app);

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

// Firestore functions for habits
export const createHabit = async (habitData) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    const habitDoc = await addDoc(collection(db, 'habits'), {
      ...habitData,
      userId: user.uid,
      status: 'active', // active, completed, failed
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { success: true, habitId: habitDoc.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateHabitStatus = async (habitId, status, additionalData = {}) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    const habitRef = doc(db, 'habits', habitId);
    await updateDoc(habitRef, {
      status,
      updatedAt: serverTimestamp(),
      ...additionalData
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteHabit = async (habitId) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    await deleteDoc(doc(db, 'habits', habitId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// User profile functions
export const getUserProfile = async () => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      return userData;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    const userRef = doc(db, 'users', user.uid);
    
    // Use setDoc with merge to create or update the user document
    await setDoc(userRef, {
      ...profileData,
      email: user.email,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserHabits = (callback) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      callback({
        active: [],
        completed: [],
        trashed: [],
        all: []
      });
      return null;
    }
    
    // Use the absolute simplest query possible - just get all habits for the user
    const habitsRef = collection(db, 'habits');
    const simpleQuery = query(habitsRef, where('userId', '==', user.uid));
    
    const unsubscribe = onSnapshot(simpleQuery, 
      (snapshot) => {
        const habits = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          habits.push({
            id: doc.id,
            ...data
          });
        });
        
        // Sort locally to avoid database ordering
        habits.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            const aTime = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
            const bTime = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
            return bTime - aTime;
          }
          return 0;
        });
        
        // Separate habits by status
        const activeHabits = habits.filter(h => h.status === 'active');
        const completedHabits = habits.filter(h => h.status === 'completed');
        const failedHabits = habits.filter(h => h.status === 'failed');
        
        callback({
          active: activeHabits,
          completed: completedHabits,
          failed: failedHabits,
          all: habits
        });
      },
      (error) => {
        console.error('Firestore snapshot listener error:', error);
        
        // On error, return empty data and don't crash the app
        callback({
          active: [],
          completed: [],
          trashed: [],
          all: []
        });
      }
    );
    
    return unsubscribe;
    
  } catch (error) {
    console.error('Error in getUserHabits setup:', error);
    
    // Return empty data on any error
    callback({
      active: [],
      completed: [],
      trashed: [],
      all: []
    });
    return null;
  }
};

// Delete user account and all associated data
// Refresh user session to handle expired tokens
export const refreshUserSession = async (email, password) => {
  try {
    // Sign in again to refresh the token
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Delete user account and all associated data
export const deleteUser = async (password) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    // 1. Re-authenticate user before deletion (required by Firebase)
    if (password) {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
    }
    
    // 2. Delete all user's habits from Firestore
    const habitsRef = collection(db, 'habits');
    const habitsQuery = query(habitsRef, where('userId', '==', user.uid));
    const habitsSnapshot = await getDocs(habitsQuery);
    
    // Delete all habits in batches
    const batch = writeBatch(db);
    habitsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    // 3. Delete user profile from Firestore
    const userRef = doc(db, 'users', user.uid);
    batch.delete(userRef);
    
    // 4. Commit all deletions
    await batch.commit();
    
    // 5. Delete the user authentication account (email/password)
    await user.delete();
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    if (error.code === 'auth/requires-recent-login') {
      return { success: false, error: 'Please provide your password to confirm account deletion' };
    } else if (error.code === 'auth/user-token-expired') {
      return { success: false, error: 'Your session has expired. Please sign in again to delete your account.' };
    } else if (error.code === 'auth/network-request-failed') {
      return { success: false, error: 'Network error. Please check your internet connection and try again.' };
    }
    return { success: false, error: error.message };
  }
};

export default app;
