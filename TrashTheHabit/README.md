# Trash the Habit

> **Break bad habits the fun way!** A mobile app that turns habit tracking into an engaging game with drag-and-drop simplicity.

## What's This App About?

Trash the Habit is a mobile app that helps people break negative habits through an interactive, game-like experience. Instead of boring checkboxes, you drag your habits into success or failure zones - making the process actually enjoyable!

## What Makes It Special?

- **Gamified Experience**: Drag habits around like you're playing a game
- **Beautiful Design**: Clean, modern interface that's easy to use
- **Real-time Updates**: See your progress instantly across all devices
- **Secure**: Your data stays private and safe
- **Smart Analytics**: Track your progress with beautiful charts
- **Customizable**: Make the app work the way you want

## How Does It Work?

Think of it like this: you create habits you want to break (like "stop smoking" or "reduce screen time"), and then each day you drag those habits into either a "Success" zone (green) or "Failure" zone (red). It's that simple!

The app keeps track of everything and shows you beautiful charts of your progress over time. You can customize almost everything - from where the navigation bar sits on your screen to what sounds you hear when you complete a habit.

## Key Features

### **Main Dashboard**
- **Habit Cards**: Create habits with emojis and descriptions
- **Drag & Drop**: Simply drag habits to success (green) or failure (red) zones
- **Live Updates**: See your progress change in real-time
- **Motivational Messages**: Get encouragement when you need it most

### **User Accounts**
- **Easy Signup**: Create an account with just email and password
- **Stay Logged In**: No need to log in every time you open the app
- **Profile Pictures**: Generate fun, unique avatars for your profile

### **Progress Tracking**
- **Beautiful Charts**: See your progress with easy-to-understand graphs
- **Weekly Stats**: Track how you're doing week by week
- **Success Rates**: Know exactly how well you're breaking those habits

### **Customization**
- **Move Navigation**: Put the menu wherever feels most comfortable
- **Sound & Vibration**: Turn on/off audio and haptic feedback
- **Personal Settings**: Make the app work exactly how you want

## Screenshots & Demo

*[Screenshots would be added here showing the main interface, drag-and-drop functionality, and various screens]*

### Live Demo Walkthrough
 **[Watch the Live Demo Walkthrough](https://drive.google.com/file/d/1fd1znmccBQrwpr9xL-koa69gRp3yZIjh/view?usp=sharing)**

The Demo showcases:
- User authentication and signup flows
- Interactive drag-and-drop habit management
- Real-time progress tracking and analytics
- Customizable settings and navigation
- Profile management and avatar customization

## Built With

This app is built using modern mobile development tools:

- **React Native** - For creating the mobile app
- **Firebase** - To store your data safely in the cloud
- **Expo** - To make development and testing easier
- **Charts & Animations** - To make everything look beautiful and smooth

## Design Philosophy

We believe breaking habits should be:
- **Simple** - No complicated interfaces or confusing menus
- **Fun** - Turn a challenging task into an enjoyable experience
- **Personal** - Customize everything to match your style
- **Motivating** - See your progress and celebrate your wins

## Getting Started

Want to try the app? Here's how:

### **Quick Setup**
```bash
# Get the code
git clone https://github.com/yourusername/TrashTheHabit.git
cd TrashTheHabit

# Install everything you need
npm install

# Start the app
npm start
```

### **What You'll Need**
- A computer with Node.js installed
- The Expo Go app on your phone (free!)
- A Firebase account (also free!)

The app will work on both iPhone and Android - just scan the QR code that appears when you run `npm start`!

## For Developers

### **Development Commands**
```bash
# Start with fresh cache
expo start -c

# Run on specific platform
expo start --ios
expo start --android
```

### **Code Quality**
- ESLint for clean code
- Prettier for consistent formatting
- TypeScript support coming soon!

## Project Structure

The app is organized into clear sections:
- **`src/screens/`** - All the main screens (login, habits, progress, etc.)
- **`src/components/`** - Reusable pieces like buttons, cards, and alerts
- **`src/config/`** - Firebase setup and configuration
- **`assets/`** - Images, sounds, and other media files

Everything is designed to be easy to find and modify!

## Key Components

### **Main Dashboard** - Where the magic happens!
- **Habit Cards**: Beautiful cards you can drag around
- **Drop Zones**: Green for success, red for failure
- **Real-time Updates**: See changes instantly

### **Floating Navigation** - Easy one-handed use
- **Smart Positioning**: Moves to wherever you want it
- **Smooth Transitions**: Beautiful animations between screens
- **Context Aware**: Knows what screen you're on

### **Habit Management** - Simple and intuitive
- **Easy Creation**: Add habits with emojis and descriptions
- **Drag & Drop**: The core feature that makes it fun
- **Instant Feedback**: Haptics and sounds for engagement

## How Data Flows

The app keeps track of everything using:
- **React Context** - Manages user login state across the entire app
- **Local Storage** - Remembers your preferences and settings
- **Firebase** - Stores your habits and progress in the cloud
- **Real-time Updates** - Changes appear instantly on all your devices

Think of it like having a smart assistant that remembers everything and keeps everything in sync!

## Cloud Storage

Your data is safely stored in the cloud using Firebase:
- **User Accounts** - Secure login with email and password
- **Habit Storage** - All your habits are saved and synced
- **Progress Tracking** - Your success and failure data
- **Real-time Sync** - Changes appear instantly everywhere

Everything is private and secure - only you can see your data!

## Keeping You Safe

The app includes several security features:
- **Strong Passwords** - Ensures your account is secure
- **Private Data** - Only you can see your habits and progress
- **Secure Login** - Your information stays safe
- **Stay Logged In** - No need to enter your password every time

## What Gets Stored

The app keeps track of:
- **Your Profile** - Name, email, and avatar preferences
- **Your Habits** - What you're trying to break, with emojis and descriptions
- **Your Progress** - Every success and failure, with timestamps
- **Your Settings** - How you like the app to look and feel

All organized and easy to access!

## Performance Optimizations

### **React Native Optimizations**
- **useCallback & useMemo**: Prevent unnecessary re-renders
- **React.memo**: Component memoization for expensive renders
- **Lazy Loading**: Screen and component lazy loading
- **Image Optimization**: Compressed assets and lazy loading

### **Animation Performance**
- **React Native Reanimated**: 60fps animations on UI thread
- **Gesture Handler**: Efficient touch event processing
- **Optimized Transitions**: Smooth screen transitions

### **Firebase Optimizations**
- **Real-time Listeners**: Efficient data synchronization
- **Query Optimization**: Indexed queries for fast retrieval
- **Offline Support**: Local caching and offline functionality


### **Testing Tools**
- **Jest**: Unit and integration testing
- **React Native Testing Library**: Component testing
- **Detox**: End-to-end testing
- **Firebase Emulator**: Local testing environment

### **Test Coverage Goals**
- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Critical user flows
- **E2E Tests**: Core user journeys

## Deployment

### **Build Process**
```bash
# Build for production
expo build:android
expo build:ios

# Build for specific platforms
expo build:android --release-channel production
expo build:ios --release-channel production
```

### **Release Channels**
- **Development**: Latest development builds
- **Staging**: Pre-production testing
- **Production**: Live app store versions

### **App Store Deployment**
1. **iOS App Store**: Submit through App Store Connect
2. **Google Play Store**: Upload APK/AAB through Play Console
3. **Expo Updates**: Over-the-air updates for minor changes

## Contributing

We welcome contributions from the community! Here's how you can help:

### **Development Workflow**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Code Standards**
- **ESLint**: Follow the project's linting rules
- **Prettier**: Use consistent code formatting
- **TypeScript**: Add types for new features
- **Testing**: Include tests for new functionality

### **Commit Message Convention**
```
feat: add new feature
fix: resolve bug
docs: update documentation
style: code formatting changes
refactor: code restructuring
test: add or update tests
chore: maintenance tasks
```

## Roadmap

### **Version 1.1** - Enhanced Analytics
- [ ] Advanced progress charts
- [ ] Habit streak tracking
- [ ] Goal setting and achievement system
- [ ] Export data functionality

### **Version 1.2** - Social Features**
- [ ] Friend connections
- [ ] Habit sharing and challenges
- [ ] Community support groups
- [ ] Leaderboards and competitions

### **Version 1.3** - AI Integration**
- [ ] Smart habit suggestions
- [ ] Personalized insights
- [ ] Predictive analytics
- [ ] Chatbot support

### **Version 2.0** - Advanced Features**
- [ ] Habit categories and filtering
- [ ] Custom reminder system
- [ ] Integration with health apps
- [ ] Wearable device support

## Troubleshooting

### **Common Issues**

#### **Metro Bundler Issues**
```bash
# Clear Metro cache
expo start -c

# Reset Metro cache
npx react-native start --reset-cache
```

#### **Firebase Connection Issues**
```bash
# Check Firebase configuration
# Verify API keys and project settings
# Ensure proper security rules
```

#### **Performance Issues**
```bash
# Enable performance monitoring
# Check for memory leaks
# Optimize image sizes
```

#### **Build Failures**
```bash
# Clear build cache
expo build:clean

# Update dependencies
npm update

# Check Expo SDK compatibility
```

### **Debug Mode**
```bash
# Enable debug logging
expo start --dev-client

# Use React Native Debugger
# Enable performance profiling
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


