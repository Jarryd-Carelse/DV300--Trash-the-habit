import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FloatingNavbar from '../components/FloatingNavbar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SPACING } from '../constants/theme';
import { getUserSettings } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import { getUserHabits } from '../config/firebase';

const ProgressScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [progress, setProgress] = useState({
    totalHabits: 0,
    completedHabits: 0,
    failedHabits: 0,
    successRate: 0,
    currentStreak: 0,
    longestStreak: 0
  });
  const [currentRoute, setCurrentRoute] = useState('Progress');
  const [settings, setSettings] = useState({
    navbarPosition: 'right',
    soundEnabled: true,
    hapticsEnabled: true,
    notificationsEnabled: true,
  });
  const [hasLoaded, setHasLoaded] = useState(false);

  // Twinning animations
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadProgress();
    loadSettings();
    
    // Start entrance animations immediately
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (progress && progress.totalHabits > 0) {
      // Animate progress bars
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false,
      }).start();
    }
  }, [progress]);

  const loadProgress = async () => {
    try {
      if (user) {
        const unsubscribe = getUserHabits((habitsData) => {
          const activeHabits = habitsData.active || [];
          const completedHabits = habitsData.completed || [];
          const failedHabits = habitsData.failed || [];
          
          const totalHabits = activeHabits.length + completedHabits.length + failedHabits.length;
          const successRate = totalHabits > 0 ? Math.round((completedHabits.length / totalHabits) * 100) : 0;
          
          // Calculate streaks (simplified - you can enhance this logic)
          const currentStreak = completedHabits.length > 0 ? 1 : 0;
          const longestStreak = Math.max(currentStreak, completedHabits.length);
          
          setProgress({
            totalHabits,
            completedHabits: completedHabits.length,
            failedHabits: failedHabits.length,
            successRate,
            currentStreak,
            longestStreak
          });
          
          setHasLoaded(true);
        });
        
        return () => {
          if (unsubscribe) unsubscribe();
        };
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      setHasLoaded(true);
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

  const StatCard = ({ title, value, icon, color, index }) => {
    const cardAnim = useRef(new Animated.Value(0)).current;
    const iconAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      // Staggered animation for stat cards
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(cardAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(iconAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
      }, index * 200);
    }, []);

    const iconScale = iconAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1],
    });

    return (
      <Animated.View 
        style={[
          styles.statCard,
          {
            opacity: cardAnim,
            transform: [
              { scale: cardAnim },
              { translateY: cardAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              })}
            ]
          }
        ]}
      >
        <Animated.View 
          style={[
            styles.iconContainer, 
            { 
              backgroundColor: color + '20',
              transform: [{ scale: iconScale }]
            }
          ]}
        >
          <Ionicons name={icon} size={24} color={color} />
        </Animated.View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </Animated.View>
    );
  };

  const ProgressBar = ({ value, maxValue, color, label }) => {
    const progressWidth = progressAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, Math.min((value / maxValue) * 100, 100)],
    });

    return (
      <View style={styles.progressItem}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>{label}</Text>
          <Text style={styles.progressValue}>{value}/{maxValue}</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <Animated.View 
            style={[
              styles.progressBar,
              { 
                width: progressWidth + '%',
                backgroundColor: color 
              }
            ]} 
          />
        </View>
      </View>
    );
  };

  if (!progress) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.Text 
          style={[
            styles.loadingText,
            { opacity: fadeAnim }
          ]}
        >
          Loading progress...
        </Animated.Text>
        
        <FloatingNavbar
          currentRoute={currentRoute}
          onNavigate={handleNavigation}
          position={settings.navbarPosition}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <Text style={styles.title}>Progress Dashboard</Text>
        <Text style={styles.subtitle}>Track your habit-breaking success</Text>
      </Animated.View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsGrid}>
          <StatCard
            title="Completed This Week"
            value={progress.completedHabits || 0}
            icon="checkmark-circle"
            color={COLORS.success}
            index={0}
          />
          <StatCard
            title="Failed This Week"
            value={progress.failedHabits || 0}
            icon="close-circle"
            color={COLORS.error}
            index={1}
          />
          <StatCard
            title="Current Streak"
            value={progress.currentStreak || 0}
            icon="flame"
            color={COLORS.warning}
            index={2}
          />
          <StatCard
            title="Total Habits"
            value={progress.totalHabits || 0}
            icon="list"
            color={COLORS.primary}
            index={3}
          />
        </View>

        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Weekly Progress</Text>
          <ProgressBar
            label="Completed"
            value={progress.completedHabits || 0}
            maxValue={progress.totalHabits || 1}
            color={COLORS.success}
          />
          <ProgressBar
            label="Failed"
            value={progress.failedHabits || 0}
            maxValue={progress.totalHabits || 1}
            color={COLORS.error}
          />
        </View>

        {progress.weeklyData && progress.weeklyData.length > 0 && (
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Weekly Activity</Text>
            <View style={styles.chartContainer}>
              {progress.weeklyData.map((day, index) => (
                <View key={index} style={styles.chartBar}>
                  <View style={styles.barContainer}>
                    <View 
                      style={[
                        styles.completedBar, 
                        { height: day.completed * 10 }
                      ]} 
                    />
                    <View 
                      style={[
                        styles.failedBar, 
                        { height: day.failed * 10 }
                      ]} 
                    />
                  </View>
                  <Text style={styles.dayLabel}>{day.day}</Text>
                </View>
              ))}
            </View>
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: COLORS.success }]} />
                <Text style={styles.legendText}>Completed</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: COLORS.error }]} />
                <Text style={styles.legendText}>Failed</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <FloatingNavbar
        currentRoute={currentRoute}
        onNavigate={handleNavigation}
        position={settings.navbarPosition}
        style={{ marginBottom: insets.bottom }}
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
  loadingText: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xxl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  statCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SPACING.md,
    alignItems: 'center',
    width: '48%',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    ...FONTS.bold,
    fontSize: SIZES.extraLarge,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  statTitle: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  chartSection: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginBottom: SPACING.md,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    marginBottom: SPACING.sm,
  },
  completedBar: {
    width: 8,
    backgroundColor: COLORS.success,
    marginRight: 2,
    borderRadius: 4,
  },
  failedBar: {
    width: 8,
    backgroundColor: COLORS.error,
    borderRadius: 4,
  },
  dayLabel: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.xs,
  },
  legendText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  progressSection: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.lg,
  },
  progressItem: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  progressLabel: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  progressValue: {
    ...FONTS.bold,
    fontSize: SIZES.small,
    color: COLORS.text,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: COLORS.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  scrollContent: {
    paddingBottom: 100, // Adjust as needed for the FloatingNavbar
  },
});

export default ProgressScreen; 