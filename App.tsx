import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ApolloProvider } from '@apollo/client';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import { Alert, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Onboarding from './src/screens/Onboarding'; // Import the new Onboarding component

// Enable screens for better navigation performance
enableScreens();

import { client } from './src/api/apollo';
import { store, persistor } from './src/store';
import AppNavigator, { SimpleAppNavigator } from './src/navigation/AppNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import { useAppSelector } from './src/hooks/reduxHooks';
import { useNetworkStatus } from './src/hooks/useNetworkStatus';
import OfflineBanner from './src/components/OfflineBanner';
import LoadingScreen from './src/components/LoadingScreen';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Flag to switch between simple and full app
const USE_SIMPLE_APP = true; // Set to true for simpler version during development

// Keep splash screen visible while we initialize
SplashScreen.preventAutoHideAsync();

// Define fonts to load with fallbacks
const FONTS = {
  'Poppins-Regular': require('./src/assets/fonts/Poppins-Regular.ttf'),
  'Poppins-Medium': require('./src/assets/fonts/Poppins-Medium.ttf'),
  'Poppins-Bold': require('./src/assets/fonts/Poppins-Bold.ttf'),
};

// Default system fonts to use as fallbacks
const FALLBACK_FONTS = {
  'Poppins-Regular': 'System',
  'Poppins-Medium': 'System',
  'Poppins-Bold': 'System',
};

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [fontError, setFontError] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false); // State to track onboarding visibility

  // Load fonts function
  const loadFonts = async () => {
    try {
      await Font.loadAsync(FONTS);
      setFontsLoaded(true);
      console.log('Fonts loaded successfully');
    } catch (error) {
      console.warn('Error loading fonts:', error);
      setFontError(true);
      setFontsLoaded(true); // Consider fonts loaded even with errors
    }
  };

  // Check if onboarding should be shown
  const checkOnboardingStatus = async () => {
    const tourShown = await AsyncStorage.getItem('tour_shown');
    setShowOnboarding(!tourShown); // Show onboarding if tour_shown is not set
  };

  // Prepare the app (load fonts, check onboarding status, etc)
  useEffect(() => {
    async function prepare() {
      try {
        await loadFonts();
        await checkOnboardingStatus();
        await new Promise(resolve => setTimeout(resolve, 500)); // Artificial delay for smoother startup
      } catch (e) {
        console.warn('Error preparing app:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // Callback when layout is ready to hide splash screen
  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // Hide splash screen
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn('Error hiding splash screen:', e);
      }
      
      // Show an alert if there was a font error
      if (fontError) {
        Alert.alert(
          'Font Loading Issue',
          'Some custom fonts could not be loaded. The app will use system fonts instead.',
          [{ text: 'OK' }]
        );
      }
    }
  }, [appIsReady, fontError]);

  if (!appIsReady) {
    return <LoadingScreen />;
  }

  return (
    <ReduxProvider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <ApolloProvider client={client}>
          <AuthProvider>
            <SafeAreaProvider onLayout={onLayoutRootView}>
              <NavigationContainer>
                <StatusBar style="auto" />
                {showOnboarding ? (
                  <Onboarding onComplete={() => {
                    AsyncStorage.setItem('tour_shown', 'true');
                    setShowOnboarding(false);
                  }} />
                ) : USE_SIMPLE_APP ? (
                  <SimpleAppNavigator />
                ) : (
                  <AuthAwareNavigationRoot />
                )}
              </NavigationContainer>
              {!USE_SIMPLE_APP && <NetworkStatusBanner />}
            </SafeAreaProvider>
          </AuthProvider>
        </ApolloProvider>
      </PersistGate>
    </ReduxProvider>
  );
}