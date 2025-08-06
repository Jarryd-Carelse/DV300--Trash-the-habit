import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FloatingNavbar from '../components/FloatingNavbar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SPACING } from '../constants/theme';
import { getProgressData, getUserSettings } from '../utils/storage';

const ProgressScreen = ({ navigation }) => {
  const [progress, setProgress] = useState(null);
  const [currentRoute, setCurrentRoute] = useState('Progress');
  const [settings, setSettings] = useState({
    navbarPosition: 'right',
    soundEnabled: true,
    hapticsEnabled: true,
    notificationsEnabled: true,
  });

  useEffect(() => {
    loadProgress();
    loadSettings();
  }, []);

  const loadProgress = async () => {
    try {
      const progressData = await getProgressData();
      if (progressData) {
        setProgress(progressData);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
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

  const StatCard = ({ title, value, icon, color }) => (
    <View style={styles.statCard}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  if (!progress) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading progress...</Text>
        
    
        <FloatingNavbar
          currentRoute={currentRoute}
          onNavigate={handleNavigation}
          position={settings.navbarPosition}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Progress</Text>
        <Text style={styles.subtitle}>Track your habit-breaking journey</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <StatCard
            title="Completed This Week"
            value={progress.completedThisWeek}
            icon="checkmark-circle"
            color={COLORS.success}
          />
          <StatCard
            title="Trashed This Week"
            value={progress.trashedThisWeek}
            icon="trash"
            color={COLORS.accent}
          />
          <StatCard
            title="Longest Streak"
            value={progress.longestStreak}
            icon="flame"
            color={COLORS.warning}
          />
          <StatCard
            title="Current Streak"
            value={progress.currentStreak}
            icon="trending-up"
            color={COLORS.primary}
          />
        </View>

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
                      styles.trashedBar, 
                      { height: day.trashed * 10 }
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
              <View style={[styles.legendColor, { backgroundColor: COLORS.accent }]} />
              <Text style={styles.legendText}>Trashed</Text>
            </View>
          </View>
        </View>
      </ScrollView>

     
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
  trashedBar: {
    width: 8,
    backgroundColor: COLORS.accent,
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
});

export default ProgressScreen; 