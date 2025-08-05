// Dummy user data
export const dummyUser = {
  id: '1',
  name: 'Jarryd',
  email: 'jarryd@mail.com',
  password: '123456',
  createdAt: new Date().toISOString(),
};

// Dummy habits data
export const dummyHabits = [
  {
    id: '1',
    name: 'Check social media',
    category: 'Digital',
    createdAt: new Date().toISOString(),
    completedCount: 0,
    trashedCount: 0,
    isActive: true,
  },
  {
    id: '2',
    name: 'Bite nails',
    category: 'Health',
    createdAt: new Date().toISOString(),
    completedCount: 0,
    trashedCount: 0,
    isActive: true,
  },
  {
    id: '3',
    name: 'Procrastinate',
    category: 'Productivity',
    createdAt: new Date().toISOString(),
    completedCount: 0,
    trashedCount: 0,
    isActive: true,
  },
  {
    id: '4',
    name: 'Skip breakfast',
    category: 'Health',
    createdAt: new Date().toISOString(),
    completedCount: 0,
    trashedCount: 0,
    isActive: true,
  },
  {
    id: '5',
    name: 'Stay up late',
    category: 'Health',
    createdAt: new Date().toISOString(),
    completedCount: 0,
    trashedCount: 0,
    isActive: true,
  },
];

// Dummy progress data
export const dummyProgress = {
  totalHabits: dummyHabits.length,
  completedThisWeek: 12,
  trashedThisWeek: 8,
  longestStreak: 5,
  currentStreak: 3,
  weeklyData: [
    { day: 'Mon', completed: 2, trashed: 1 },
    { day: 'Tue', completed: 3, trashed: 2 },
    { day: 'Wed', completed: 1, trashed: 0 },
    { day: 'Thu', completed: 2, trashed: 1 },
    { day: 'Fri', completed: 2, trashed: 2 },
    { day: 'Sat', completed: 1, trashed: 1 },
    { day: 'Sun', completed: 1, trashed: 1 },
  ],
  monthlyData: [
    { month: 'Jan', completed: 45, trashed: 32 },
    { month: 'Feb', completed: 52, trashed: 28 },
    { month: 'Mar', completed: 48, trashed: 35 },
    { month: 'Apr', completed: 61, trashed: 22 },
  ],
};

// Dummy settings
export const dummySettings = {
  navbarPosition: 'right', // 'left' or 'right'
  soundEnabled: true,
  hapticsEnabled: true,
  notificationsEnabled: true,
  theme: 'light',
};

// Habit categories for suggestions
export const habitCategories = [
  'Digital',
  'Health',
  'Productivity',
  'Social',
  'Financial',
  'Environmental',
  'Learning',
  'Other',
];

// Common habit suggestions
export const habitSuggestions = [
  'Check phone first thing in morning',
  'Skip breakfast',
  'Bite nails',
  'Procrastinate',
  'Stay up late',
  'Skip exercise',
  'Eat junk food',
  'Spend too much time on social media',
  'Skip reading',
  'Skip meditation',
  'Skip water intake',
  'Skip stretching',
  'Skip walking',
  'Skip healthy meals',
  'Skip sleep schedule',
]; 