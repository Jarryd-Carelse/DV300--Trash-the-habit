import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';

const HabitCard = ({
  habit,
  onPress,
  onLongPress,
  isDragging = false,
  dragOpacity = 1,
  style,
}) => {
  return (
    <Animated.View
      style={[
        styles.container,
        isDragging && styles.dragging,
        { opacity: dragOpacity },
        style,
      ]}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.8}
      >
        <View style={styles.content}>
          <View style={styles.habitInfo}>
            <Text style={styles.habitName} numberOfLines={2}>
              {habit.name}
            </Text>
            <Text style={styles.habitCategory}>
              {habit.category}
            </Text>
          </View>
          
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.statText}>{habit.completedCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="trash" size={16} color={COLORS.accent} />
              <Text style={styles.statText}>{habit.trashedCount}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.dragHandle}>
          <Ionicons name="menu" size={20} color={COLORS.gray} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.md,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  dragging: {
    transform: [{ scale: 1.05 }],
    ...SHADOWS.dark,
  },
  content: {
    flex: 1,
  },
  habitInfo: {
    marginBottom: SIZES.sm,
  },
  habitName: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.black,
    marginBottom: SIZES.xs,
  },
  habitCategory: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.gray,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  statText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.darkGray,
    marginLeft: SIZES.xs,
  },
  dragHandle: {
    padding: SIZES.sm,
    marginLeft: SIZES.sm,
  },
});

export default HabitCard; 