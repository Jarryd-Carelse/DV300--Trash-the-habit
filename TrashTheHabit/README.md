# Trash the Habit

A React Native habit-breaking app designed for one-handed use, built with Expo.

## 🎯 Features

- **One-Handed Design**: Custom floating navbar that can be positioned on left or right side
- **Habit Management**: Add, complete, and trash habits with intuitive drag-and-drop interface
- **Progress Tracking**: Visual statistics and charts showing your habit-breaking journey
- **Customizable Settings**: Toggle sound, haptics, notifications, and navbar position
- **Clean UI**: Modern, minimalist design with green and red color scheme
- **Local Storage**: All data persists locally using AsyncStorage

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (or physical device with Expo Go)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd TrashTheHabit
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 📱 App Structure

### Screens

- **Login Screen**: Email/password authentication
- **Sign Up Screen**: Create new account
- **Habit Screen**: Main screen with habit cards and drop zones
- **Add Habit Screen**: Create new habits
- **Progress Screen**: Statistics and charts
- **Settings Screen**: App preferences and account management

### Components

- **CustomButton**: Reusable button component with multiple variants
- **CustomInput**: Form input with validation and styling
- **FloatingNavbar**: Custom navigation bar with positioning
- **HabitCard**: Individual habit display with stats
- **DropZone**: Areas for completing or trashing habits

### Navigation

The app uses a custom floating navbar that:
- Positions on bottom-right by default
- Can be moved to bottom-left via settings
- Always visible and accessible
- Uses React Navigation for screen management

## 🎨 Design System

### Colors
- **Primary**: #4CAF50 (Green for success)
- **Accent**: #FF5252 (Red for "trash")
- **Background**: #F5F5F5 (Light gray)
- **White**: #FFFFFF
- **Gray**: #9E9E9E

### Typography
- Uses system fonts for optimal performance
- Consistent font weights and sizes
- Responsive text scaling

### Spacing
- Consistent spacing system (xs, sm, md, lg, xl, xxl)
- Proper padding and margins for touch targets

## 🔧 Technical Stack

- **React Native**: Core framework
- **Expo**: Development platform
- **React Navigation**: Screen navigation
- **AsyncStorage**: Local data persistence
- **Expo Vector Icons**: Icon library
- **React Native Safe Area Context**: Safe area handling

## 📊 Data Structure

### Habit Object
```javascript
{
  id: string,
  name: string,
  category: string,
  createdAt: string,
  completedCount: number,
  trashedCount: number,
  isActive: boolean
}
```

### Progress Object
```javascript
{
  totalHabits: number,
  completedThisWeek: number,
  trashedThisWeek: number,
  longestStreak: number,
  currentStreak: number,
  weeklyData: Array,
  monthlyData: Array
}
```

## 🎮 Usage

1. **Login/Sign Up**: Create an account or log in
2. **Add Habits**: Use the Add Habit screen to create new habits
3. **Manage Habits**: 
   - Tap habits to complete or trash them
   - Long press to delete habits
   - Drag habits to drop zones (visual feedback)
4. **Track Progress**: View statistics and charts in Progress screen
5. **Customize**: Adjust settings in Settings screen

## 🔄 Future Enhancements

- [ ] Real backend integration (Firebase)
- [ ] Push notifications
- [ ] Advanced analytics
- [ ] Social features
- [ ] Habit streaks and rewards
- [ ] Dark mode support
- [ ] Offline sync
- [ ] Export data functionality

## 🐛 Known Issues

- Disk space constraints limited some features during development
- Drag-and-drop is currently visual only (no actual drag implementation)
- Some animations may need optimization for older devices

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support or questions, please open an issue in the repository.

---

**Trash the Habit** - Break bad habits, build better ones! 🚀 