# Trash the Habit

A React Native + Expo Go app designed to help users break bad habits through an intuitive drag-and-drop interface.

## 🎯 Features

### Home Screen (Main Dashboard)
- **Welcome Header**: Personalized greeting with user name
- **Habit Cards**: Display current habits with emojis and drag handles
- **Drag & Drop**: Long press to drag habits to completion or trash zones
- **Drop Zones**: 
  - ✅ Complete Zone (Green) - for successfully avoided habits
  - 🗑️ Trash Zone (Red) - for habits that were indulged in
- **Empty State**: Motivational message when all habits are processed
- **Floating Navigation**: One-handed navigation bar

### Navigation
- **Home**: Main habit management screen
- **Add Habit**: Create new habits to track
- **Progress**: View habit-breaking statistics
- **Settings**: Customize app preferences

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   cd TrashTheHabit
   npm install
   ```

2. **Start the App**
   ```bash
   npm start
   ```

3. **Run on Device**
   - Scan QR code with Expo Go app
   - Or press 'i' for iOS simulator
   - Or press 'a' for Android emulator

## 📱 Usage

### Managing Habits
1. **View Habits**: See your current habits on the home screen
2. **Drag to Complete**: Long press and drag a habit to the green "Complete" zone when you successfully avoid it
3. **Drag to Trash**: Long press and drag a habit to the red "Trash" zone when you indulge in it
4. **Track Progress**: View your completion and trash counts in the empty state

### Navigation
- Use the floating navigation bar on the right side
- Tap icons to switch between screens
- Navigation is optimized for one-handed use

## 🛠️ Technical Details

### Built With
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **React Navigation**: Screen navigation
- **React Native Gesture Handler**: Touch interactions
- **React Native Reanimated**: Smooth animations

### Key Components
- `HabitScreen.js`: Main dashboard with drag-and-drop functionality
- `FloatingNavbar.js`: Navigation component
- `AppNavigator.js`: Screen routing
- `theme.js`: Design system and styling constants

### State Management
- Local state with React hooks
- Dummy data for demonstration
- Separate arrays for active, completed, and trashed habits

## 🎨 Design System

### Colors
- Primary: Green (#4CAF50) for success/completion
- Accent: Red (#FF5252) for trash/indulgence
- Background: Light gray (#F5F5F5)
- White: (#FFFFFF) for cards and content

### Typography
- Bold: System font, weight 700
- Medium: System font, weight 500
- Regular: System font, weight 400

### Spacing
- Consistent spacing system (xs: 4px to xxl: 48px)
- Proper padding and margins for mobile optimization

## 📋 Current Habits (Dummy Data)
- 💨 Vaping
- 🍕 Overeating
- 📱 Doomscrolling
- ⏰ Procrastinating
- 😴 Sleeping Late

## 🔮 Future Enhancements
- Persistent data storage
- Habit categories and filtering
- Progress charts and analytics
- Push notifications and reminders
- Social features and sharing
- Custom habit creation
- Achievement system

## 📄 License
This project is for educational and demonstration purposes. 