import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Dimensions,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

// Constants
const { width, height } = Dimensions.get('window');
const TOP_SECTION_HEIGHT = height * 0.4;
const FORM_SECTION_HEIGHT = height * 0.6;

// Background images for different screens
const BACKGROUND_IMAGES = [
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
];

// Custom Input component with icon and validation
const CustomInput = ({ 
  icon, 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error = '',
  toggleVisibility,
  showVisibilityIcon = false,
  isPasswordVisible = false,
}) => {
  return (
    <View style={styles.inputContainer}>
      <Ionicons name={icon} size={22} color="#6B7280" style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
      />
      {showVisibilityIcon && (
        <TouchableOpacity onPress={toggleVisibility} style={styles.visibilityToggle}>
          <Ionicons
            name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color="#6B7280"
          />
        </TouchableOpacity>
      )}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

// Custom Button component
const CustomButton = ({ title, onPress, isLoading = false, style, textStyle }) => {
  return (
    <TouchableOpacity 
      style={[styles.button, style]} 
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

// Password strength component
const PasswordStrengthMeter = ({ password }) => {
  const getStrength = (password) => {
    if (!password) return 0;
    
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    
    // Character variety check
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    return score;
  };
  
  const strength = getStrength(password);
  
  const getColor = () => {
    if (strength === 0) return '#D1D5DB';
    if (strength < 2) return '#EF4444'; // Weak - Red
    if (strength < 4) return '#F59E0B'; // Medium - Amber
    return '#10B981'; // Strong - Green
  };
  
  const getLabel = () => {
    if (!password) return '';
    if (strength < 2) return 'Weak';
    if (strength < 4) return 'Medium';
    return 'Strong';
  };
  
  return (
    <View style={styles.strengthContainer}>
      <View style={styles.strengthBars}>
        <View style={[styles.strengthBar, { backgroundColor: strength >= 1 ? getColor() : '#D1D5DB' }]} />
        <View style={[styles.strengthBar, { backgroundColor: strength >= 2 ? getColor() : '#D1D5DB' }]} />
        <View style={[styles.strengthBar, { backgroundColor: strength >= 3 ? getColor() : '#D1D5DB' }]} />
        <View style={[styles.strengthBar, { backgroundColor: strength >= 4 ? getColor() : '#D1D5DB' }]} />
      </View>
      <Text style={[styles.strengthLabel, { color: getColor() }]}>{getLabel()}</Text>
    </View>
  );
};

// Divider with text
const Divider = ({ text }) => {
  return (
    <View style={styles.divider}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>{text}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
};

// Success Toast component
const SuccessToast = ({ message, visible, onHide }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide && onHide();
      });
    }
  }, [visible]);
  
  if (!visible) return null;
  
  return (
    <Animated.View style={[styles.toast, { opacity: fadeAnim }]}>
      <View style={styles.toastContent}>
        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
        <Text style={styles.toastText}>{message}</Text>
      </View>
    </Animated.View>
  );
};

// Main LoginRegisterScreen component
const LoginRegisterScreen = ({ navigation }) => {
  const { login, register, error: authError, loading: authLoading, clearError } = useAuth();
  const nav = useNavigation();
  
  // States for form fields
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(BACKGROUND_IMAGES[0]);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  // Update background image randomly
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * BACKGROUND_IMAGES.length);
    setBackgroundImage(BACKGROUND_IMAGES[randomIndex]);
  }, []);
  
  // Update errors if authError changes
  useEffect(() => {
    if (authError) {
      // Display auth error in the appropriate field
      if (authError.includes('email') || authError.includes('Email')) {
        setErrors({ ...errors, email: authError });
      } else if (authError.includes('password') || authError.includes('Password')) {
        setErrors({ ...errors, password: authError });
      } else {
        // Show general error as a toast
        setSuccessMessage(authError);
        setShowSuccessToast(true);
      }
      // Clear the auth error
      clearError();
    }
  }, [authError]);
  
  // Toggle between Login and Register forms with animation
  const toggleForm = () => {
    // Start fade out animation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Toggle form type
      setIsLogin(!isLogin);
      // Reset errors
      setErrors({});
      
      // Start fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      
      // Slide animation for form content
      Animated.timing(slideAnim, {
        toValue: isLogin ? 100 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };
  
  // Validate email function
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  
  // Validate form function
  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!isLogin) {
      if (!fullName) {
        newErrors.fullName = 'Full name is required';
      }
      
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      
      if (!acceptTerms) {
        newErrors.terms = 'You must accept the terms to continue';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle login function
  const handleLogin = async () => {
    if (validateForm()) {
      setIsLoading(true);
      
      try {
        await login(email, password);
        
        // Show success toast
        setSuccessMessage(`Welcome back, ${email.split('@')[0]} 👋 Your next adventure awaits.`);
        setShowSuccessToast(true);
        
        // Trigger haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Navigate to home screen after a short delay
        setTimeout(() => {
          nav.navigate('Home');
        }, 1000);
      } catch (error) {
        console.error('Login error:', error);
        // Error handling is done through the authError effect
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Handle register function
  const handleRegister = async () => {
    if (validateForm()) {
      setIsLoading(true);
      
      try {
        await register(fullName, email, password);
        
        // Show confetti animation
        setShowConfetti(true);
        
        // Show success toast
        setSuccessMessage('Account created successfully! Welcome aboard! 🚀');
        setShowSuccessToast(true);
        
        // Trigger haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Navigate to home screen after a short delay
        setTimeout(() => {
          nav.navigate('Home');
        }, 1500);
      } catch (error) {
        console.error('Registration error:', error);
        // Error handling is done through the authError effect
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Handle Google sign-in
  const handleGoogleSignIn = () => {
    setIsLoading(true);
    
    // Simulate Google sign-in
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage("Signed in securely with Google ✔️");
      setShowSuccessToast(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1500);
  };
  
  // Handle Apple sign-in
  const handleAppleSignIn = () => {
    setIsLoading(true);
    
    // Simulate Apple sign-in
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage("Signed in securely with Apple ✔️");
      setShowSuccessToast(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1500);
  };
  
  // Handle forgot password
  const handleForgotPassword = () => {
    Alert.alert(
      "Reset Password",
      "A password reset link will be sent to your email address.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Send Link", 
          onPress: () => {
            if (email && validateEmail(email)) {
              setSuccessMessage("Password reset link sent to your email ✉️");
              setShowSuccessToast(true);
            } else {
              setErrors({...errors, email: 'Please enter a valid email'});
            }
          } 
        }
      ]
    );
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      {/* Background Image Section */}
      <View style={styles.backgroundSection}>
        <ImageBackground
          source={{ uri: backgroundImage }}
          style={styles.backgroundImage}
        >
          <BlurView intensity={20} style={styles.blurOverlay}>
            <LinearGradient
              colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)']}
              style={styles.gradientOverlay}
            >
              <View style={styles.logoContainer}>
                <Image
                  source={require('../assets/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text style={styles.logoText}>WanderGenie</Text>
                <Text style={styles.tagline}>Your AI Travel Companion</Text>
              </View>
            </LinearGradient>
          </BlurView>
        </ImageBackground>
      </View>
      
      {/* Form Section */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.formSection}>
          <View style={styles.formCard}>
            <Animated.View
              style={[
                styles.formContent,
                {
                  opacity: fadeAnim,
                  transform: [{ translateX: slideAnim }]
                }
              ]}
            >
              <Text style={styles.formTitle}>
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </Text>
              <Text style={styles.formSubtitle}>
                {isLogin 
                  ? 'Sign in to continue your journey' 
                  : 'Join us and start exploring the world'}
              </Text>
              
              {/* Registration Form Fields */}
              {!isLogin && (
                <CustomInput
                  icon="person-outline"
                  placeholder="Full Name"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  error={errors.fullName}
                />
              )}
              
              {/* Common Form Fields */}
              <CustomInput
                icon="mail-outline"
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                error={errors.email}
              />
              
              <CustomInput
                icon="lock-closed-outline"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                error={errors.password}
                showVisibilityIcon={true}
                toggleVisibility={() => setShowPassword(!showPassword)}
                isPasswordVisible={showPassword}
              />
              
              {password.length > 0 && (
                <PasswordStrengthMeter password={password} />
              )}
              
              {/* Registration-specific Fields */}
              {!isLogin && (
                <>
                  <CustomInput
                    icon="lock-closed-outline"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    error={errors.confirmPassword}
                    showVisibilityIcon={true}
                    toggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
                    isPasswordVisible={showConfirmPassword}
                  />
                  
                  <View style={styles.termsContainer}>
                    <TouchableOpacity
                      style={styles.checkbox}
                      onPress={() => setAcceptTerms(!acceptTerms)}
                    >
                      <Ionicons
                        name={acceptTerms ? 'checkbox' : 'square-outline'}
                        size={22}
                        color={acceptTerms ? '#F97316' : '#6B7280'}
                      />
                    </TouchableOpacity>
                    <View style={styles.termsTextContainer}>
                      <Text style={styles.termsText}>
                        I accept the{' '}
                        <Text style={styles.termsLink}>Terms of Service</Text>
                        {' '}and{' '}
                        <Text style={styles.termsLink}>Privacy Policy</Text>
                      </Text>
                      {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}
                    </View>
                  </View>
                </>
              )}
              
              {/* Login-specific Fields */}
              {isLogin && (
                <TouchableOpacity 
                  style={styles.forgotPasswordContainer}
                  onPress={handleForgotPassword}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              )}
              
              {/* Submit Button */}
              <CustomButton
                title={isLogin ? 'Log In' : 'Sign Up'}
                onPress={isLogin ? handleLogin : handleRegister}
                isLoading={isLoading}
                style={styles.submitButton}
              />
              
              {/* Social Login Options */}
              <Divider text="or continue with" />
              
              <View style={styles.socialButtonsContainer}>
                <TouchableOpacity 
                  style={styles.socialButton}
                  onPress={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <Ionicons name="logo-google" size={24} color="#EA4335" />
                  <Text style={styles.socialButtonText}>Google</Text>
                </TouchableOpacity>
                
                {Platform.OS === 'ios' && (
                  <TouchableOpacity 
                    style={styles.socialButton}
                    onPress={handleAppleSignIn}
                    disabled={isLoading}
                  >
                    <Ionicons name="logo-apple" size={24} color="#000000" />
                    <Text style={styles.socialButtonText}>Apple</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {/* Toggle between Login and Register */}
              <View style={styles.toggleFormContainer}>
                <Text style={styles.toggleFormText}>
                  {isLogin ? "New here? " : "Already have an account? "}
                </Text>
                <TouchableOpacity onPress={toggleForm}>
                  <Text style={styles.toggleFormLink}>
                    {isLogin ? "Create an account" : "Log in"}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </View>
      </TouchableWithoutFeedback>
      
      {/* Success Toast */}
      <SuccessToast
        message={successMessage}
        visible={showSuccessToast}
        onHide={() => setShowSuccessToast(false)}
      />
      
      {/* Confetti Cannon */}
      {showConfetti && (
        <ConfettiCannon
          count={200}
          origin={{ x: width / 2, y: 0 }}
          autoStart={true}
          fadeOut={true}
          onAnimationEnd={() => setShowConfetti(false)}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  backgroundSection: {
    height: TOP_SECTION_HEIGHT,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  blurOverlay: {
    flex: 1,
  },
  gradientOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  formSection: {
    height: FORM_SECTION_HEIGHT,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingTop: 32,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  formContent: {
    flex: 1,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingLeft: 48,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: 14,
  },
  visibilityToggle: {
    position: 'absolute',
    right: 16,
    top: 14,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#F97316',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#F97316',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    color: '#6B7280',
    marginHorizontal: 16,
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    marginHorizontal: 8,
  },
  socialButtonText: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  toggleFormContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingBottom: Platform.OS === 'ios' ? 16 : 0,
  },
  toggleFormText: {
    color: '#6B7280',
    fontSize: 14,
  },
  toggleFormLink: {
    color: '#F97316',
    fontSize: 14,
    fontWeight: '600',
  },
  termsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  checkbox: {
    marginRight: 8,
    paddingTop: 2,
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    color: '#F97316',
    fontWeight: '600',
  },
  strengthContainer: {
    marginBottom: 16,
    marginTop: -8,
  },
  strengthBars: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 2,
    backgroundColor: '#D1D5DB',
  },
  strengthLabel: {
    fontSize: 12,
    textAlign: 'right',
  },
  button: {
    padding: 15,
    backgroundColor: '#F97316',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toast: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toastText: {
    marginLeft: 12,
    color: '#1F2937',
    fontSize: 14,
    flex: 1,
  },
});

export default LoginRegisterScreen; 