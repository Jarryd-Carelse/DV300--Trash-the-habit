import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { COLORS, SIZES, FONTS, SPACING } from '../constants/theme';
import { setLoginStatus } from '../utils/storage';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Twinning animations
  const formAnim = useRef(new Animated.Value(1)).current;
  const logoAnim = useRef(new Animated.Value(1)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      // Shake animation for validation errors
      Animated.sequence([
        Animated.timing(formAnim, {
          toValue: 0.98,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(formAnim, {
          toValue: 1.02,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(formAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      if (email === 'jarryd@mail.com' && password === '123456') {
        await setLoginStatus(true);
        
        // Success animation
        Animated.sequence([
          Animated.timing(successAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(successAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
        
        setLoading(false);
        navigation.replace('Home');
      } else {
        setLoading(false);
        Alert.alert('Error', 'Invalid credentials. Use jarryd@mail.com / 123456');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Login failed. Please try again.');
    }
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  const logoScale = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const successScale = successAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.header,
              { transform: [{ scale: logoScale }] }
            ]}
          >
            <Image 
              source={require('../../assets/TTH.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Trash the Habit</Text>
            <Text style={styles.subtitle}>Break bad habits, build better ones</Text>
          </Animated.View>

          <Animated.View 
            style={[
              styles.form,
              { transform: [{ scale: formAnim }] }
            ]}
          >
            <CustomInput
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <CustomInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
            />

            <CustomButton
              title="Login"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
            />

            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <CustomButton
                title="Sign Up"
                onPress={handleSignUp}
                variant="outline"
                size="small"
              />
            </View>
          </Animated.View>

          {successAnim > 0 && (
            <Animated.View 
              style={[
                styles.successOverlay,
                { 
                  opacity: successAnim,
                  transform: [{ scale: successScale }]
                }
              ]}
            >
              <Text style={styles.successText}>✓ Login Successful!</Text>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: SPACING.sm,
  },
  title: {
    ...FONTS.bold,
    fontSize: 32,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  loginButton: {
    marginTop: SPACING.lg,
  },
  signUpContainer: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  signUpText: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  createAccountButton: {
    marginTop: SPACING.xs,
  },
  successOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -50 }],
    backgroundColor: COLORS.success,
    padding: SPACING.md,
    borderRadius: SPACING.md,
    zIndex: 1,
  },
  successText: {
    ...FONTS.bold,
    fontSize: SIZES.font,
    color: COLORS.white,
    textAlign: 'center',
  },
});

export default LoginScreen; 