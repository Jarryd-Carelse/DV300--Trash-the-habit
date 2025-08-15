import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FloatingNavbar from '../components/FloatingNavbar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SPACING } from '../constants/theme';
import { getUserSettings } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import { getUserHabits } from '../config/firebase';
import { PieChart, LineChart, BarChart } from 'react-native-chart-kit';

const ProgressScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const screenWidth = Dimensions.get('window').width;
  
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
          
          const currentStreak = calculateCurrentStreak(completedHabits);
          const longestStreak = calculateLongestStreak(completedHabits);
          
          const weeklyProgress = calculateWeeklyProgress(completedHabits, failedHabits);
          
          setProgress({
            totalHabits,
            completedHabits: completedHabits.length,
            failedHabits: failedHabits.length,
            successRate,
            currentStreak,
            longestStreak,
            weeklyProgress
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

  const calculateCurrentStreak = (completedHabits) => {
    if (!completedHabits || completedHabits.length === 0) return 0;
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let currentStreak = 0;
      let currentDate = new Date(today);
      
      for (let i = 0; i < 365; i++) {
        const dateString = currentDate.toISOString().split('T')[0];
        const habitsForDate = completedHabits.filter(habit => {
          try {
            if (!habit.completedAt) return false;
            const completedDate = new Date(habit.completedAt);
            if (isNaN(completedDate.getTime())) return false;
            const completedDateString = completedDate.toISOString().split('T')[0];
            return completedDateString === dateString;
          } catch (error) {
            console.log('Error processing habit date:', error);
            return false;
          }
        });
        
        if (habitsForDate.length > 0) {
          currentStreak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
      
      return currentStreak;
    } catch (error) {
      console.log('Error calculating current streak:', error);
      return 0;
    }
  };

  const calculateLongestStreak = (completedHabits) => {
    if (!completedHabits || completedHabits.length === 0) return 0;
    
    try {
      const dateMap = new Map();
      
      completedHabits.forEach(habit => {
        try {
          if (habit.completedAt) {
            const completedDate = new Date(habit.completedAt);
            if (!isNaN(completedDate.getTime())) {
              const dateString = completedDate.toISOString().split('T')[0];
              dateMap.set(dateString, (dateMap.get(dateString) || 0) + 1);
            }
          }
        } catch (error) {
          console.log('Error processing habit date in longest streak:', error);
            }
          });
          
          const sortedDates = Array.from(dateMap.keys()).sort();
          let longestStreak = 0;
          let currentStreak = 0;
          let previousDate = null;
          
          for (const dateString of sortedDates) {
            try {
              const currentDate = new Date(dateString);
              if (isNaN(currentDate.getTime())) continue;
              
              if (previousDate === null) {
                currentStreak = 1;
              } else {
                const dayDiff = Math.floor((currentDate - previousDate) / (1000 * 60 * 60 * 24));
                if (dayDiff === 1) {
                  currentStreak++;
                } else {
                  currentStreak = 1;
                }
              }
              
              longestStreak = Math.max(longestStreak, currentStreak);
              previousDate = currentDate;
            } catch (error) {
              console.log('Error processing date in longest streak loop:', error);
              continue;
            }
          }
          
          return longestStreak;
        } catch (error) {
          console.log('Error calculating longest streak:', error);
          return 0;
        }
      };

  const calculateWeeklyProgress = (completedHabits, failedHabits) => {
    try {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      // Generate daily data for the week
      const dailyData = [];
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + i);
        currentDate.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(currentDate);
        nextDate.setDate(currentDate.getDate() + 1);
        
        const dailyCompleted = completedHabits.filter(habit => {
          try {
            if (!habit.completedAt) return false;
            const completedDate = new Date(habit.completedAt);
            if (isNaN(completedDate.getTime())) return false;
            return completedDate >= currentDate && completedDate < nextDate;
          } catch (error) {
            console.log('Error processing completed habit date:', error);
            return false;
          }
        }).length;
        
        const dailyFailed = failedHabits.filter(habit => {
          try {
            if (!habit.failedAt) return false;
            const failedDate = new Date(habit.failedAt);
            if (isNaN(failedDate.getTime())) return false;
            return failedDate >= currentDate && failedDate < nextDate;
          } catch (error) {
            console.log('Error processing failed habit date:', error);
            return false;
          }
        }).length;
        
        dailyData.push({
          day: dayNames[i],
          completed: dailyCompleted,
          failed: dailyFailed
        });
      }
      
      const weeklyCompleted = dailyData.reduce((sum, day) => sum + day.completed, 0);
      const weeklyFailed = dailyData.reduce((sum, day) => sum + day.failed, 0);
      
      return {
        weeklyCompleted,
        weeklyFailed,
        totalWeekly: weeklyCompleted + weeklyFailed,
        dailyData
      };
    } catch (error) {
      console.log('Error calculating weekly progress:', error);
      return {
        weeklyCompleted: 0,
        weeklyFailed: 0,
        totalWeekly: 0,
        dailyData: []
      };
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

        {/* Weekly Horizontal Bar Chart */}
        <View style={styles.barChartSection}>
          <Text style={styles.sectionTitle}>Weekly Progress Summary</Text>
          <View style={styles.horizontalBarContainer}>
            <View style={styles.barRow}>
              <Text style={styles.barLabel}>Completed</Text>
              <View style={styles.barWrapper}>
                <View 
                  style={[
                    styles.horizontalBar, 
                    { 
                      width: `${Math.min((progress.completedHabits || 0) * 15, 100)}%`,
                      backgroundColor: COLORS.success 
                    }
                  ]} 
                />
                <Text style={styles.barValue}>{progress.completedHabits || 0}</Text>
              </View>
            </View>
            
            <View style={styles.barRow}>
              <Text style={styles.barLabel}>Failed</Text>
              <View style={styles.barWrapper}>
                <View 
                  style={[
                    styles.horizontalBar, 
                    { 
                      width: `${Math.min((progress.failedHabits || 0) * 15, 100)}%`,
                      backgroundColor: COLORS.error 
                    }
                  ]} 
                />
                <Text style={styles.barValue}>{progress.failedHabits || 0}</Text>
              </View>
            </View>
          </View>
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
    paddingBottom: 100,
  },

  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 220,
  },
  chartContainer: {
    marginTop: -SPACING.md,
    marginLeft: -SPACING.sm,
  },
  barChartSection: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  horizontalBarContainer: {
    paddingVertical: SPACING.md,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  barLabel: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.text,
    width: 80,
    marginRight: SPACING.md,
  },
  barWrapper: {
    flex: 1,
    height: 30,
    backgroundColor: COLORS.border,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    position: 'relative',
  },
  horizontalBar: {
    height: '100%',
    borderRadius: SIZES.radius,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  barValue: {
    ...FONTS.bold,
    fontSize: SIZES.font,
    color: COLORS.text,
    position: 'absolute',
    right: SPACING.sm,
    top: 5,
  },
  progressSummary: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.primary + '10',
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  progressSummaryText: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.primary,
    textAlign: 'center',
  },
});

export default ProgressScreen; 