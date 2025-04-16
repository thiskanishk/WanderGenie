import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Text,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const LOGO_SIZE = 100;
const LOGO_SIZE_SMALL = 60;
const ANIMATION_DURATION = 250;

const LoginRegisterScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);

  const { login, register, isLoading, error: authError, user } = useAuth();
  const navigation = useNavigation();

  // Animation refs
  const logoAnim = useRef(new Animated.Value(1)).current;

  // Animate logo shrink/expand on input focus
  useEffect(() => {
    Animated.timing(logoAnim, {
      toValue: inputFocused ? 0 : 1,
      duration: ANIMATION_DURATION,
      useNativeDriver: false,
    }).start();
  }, [inputFocused]);

  // Validation
  const validate = () => {
    if (!email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email';
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!isLogin) {
      if (!fullName.trim()) return 'Full name is required';
      if (password !== confirmPassword) return 'Passwords do not match';
    }
    return null;
  };

  // Handle submit
  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, fullName);
      }
      // Navigation handled by effect
    } catch (e) {
      // error handled in context
    }
  };

  useEffect(() => {
    if (user) {
      navigation.reset({ index: 0, routes: [{ name: 'HomeScreen' }] });
    }
  }, [user]);

  // Social login stubs
  const handleGoogle = () => Alert.alert('Coming soon', 'Google login is not available yet.');
  const handleApple = () => Alert.alert('Coming soon', 'Apple login is not available yet.');

  // Input focus/blur handlers
  const onInputFocus = () => setInputFocused(true);
  const onInputBlur = () => setInputFocused(false);

  // Animated logo size and margin
  const logoSize = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [LOGO_SIZE_SMALL, LOGO_SIZE],
  });
  const logoMargin = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 32],
  });

  return (
    <View style={styles.root}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Animated.View style={[styles.topSection, { paddingTop: logoMargin, paddingBottom: logoMargin }]}> 
            <Animated.Image
              source={require('../assets/logo.png')}
              style={{
                width: logoSize,
                height: logoSize,
                alignSelf: 'center',
                marginBottom: 8,
              }}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>WanderGenie</Text>
            <Text style={styles.tagline}>Your AI Travel Companion</Text>
          </Animated.View>
          <View style={styles.bottomSection}>
            <ScrollView
              contentContainerStyle={styles.formScroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>{isLogin ? 'Sign In' : 'Create Account'}</Text>
                <Text style={styles.formSubtitle}>
                  {isLogin ? 'Sign in to continue your journey' : 'Join us and start exploring the world'}
                </Text>
                {!isLogin && (
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                    onFocus={onInputFocus}
                    onBlur={onInputBlur}
                    returnKeyType="next"
                  />
                )}
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={onInputFocus}
                  onBlur={onInputBlur}
                  returnKeyType="next"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  onFocus={onInputFocus}
                  onBlur={onInputBlur}
                  returnKeyType={isLogin ? 'done' : 'next'}
                />
                {!isLogin && (
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    onFocus={onInputFocus}
                    onBlur={onInputBlur}
                    returnKeyType="done"
                  />
                )}
                {error && <Text style={styles.errorText}>{error}</Text>}
                {authError && <Text style={styles.errorText}>{authError}</Text>}
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
                  )}
                </TouchableOpacity>
                <View style={styles.socialButtonsContainer}>
                  <TouchableOpacity style={styles.socialButton} onPress={handleGoogle}>
                    <Ionicons name="logo-google" size={20} color="#EA4335" style={{ marginRight: 8 }} />
                    <Text style={styles.socialButtonText}>Continue with Google</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialButton} onPress={handleApple}>
                    <Ionicons name="logo-apple" size={20} color="#000" style={{ marginRight: 8 }} />
                    <Text style={styles.socialButtonText}>Continue with Apple</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleText}>
                  {isLogin ? 'New here? ' : 'Already have an account? '}
                </Text>
                <TouchableOpacity onPress={() => { setIsLogin(!isLogin); setError(null); }}>
                  <Text style={styles.toggleLink}>
                    {isLogin ? 'Create an account' : 'Sign in'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  topSection: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 2,
  },
  tagline: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  bottomSection: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  formScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
    color: '#222',
  },
  formSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 18,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
    fontSize: 16,
    color: '#222',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  socialButtonsContainer: {
    marginTop: 8,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 8,
  },
  socialButtonText: {
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  toggleText: {
    fontSize: 15,
    color: '#6B7280',
  },
  toggleLink: {
    fontSize: 15,
    color: '#2563EB',
    fontWeight: 'bold',
    marginLeft: 2,
  },
});

export default LoginRegisterScreen;