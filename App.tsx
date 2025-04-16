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

  // Load fonts function
  const loadFonts = async () => {
    try {
      await Font.loadAsync(FONTS);
      setFontsLoaded(true);
      console.log('Fonts loaded successfully');
    } catch (error) {
      console.warn('Error loading fonts:', error);
      setFontError(true);
      
      // Load fallback system fonts
      try {
        // Create a mapping using only system fonts
        const systemFonts = {};
        setFontsLoaded(true); // We consider fonts loaded even with fallbacks
      } catch (fallbackError) {
        console.error('Critical error loading fonts:', fallbackError);
        // Continue without custom fonts at all
      }
    }
  };

  // Prepare the app (load fonts, etc)
  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts
        await loadFonts();
        
        // Add artificial delay for smoother startup
        await new Promise(resolve => setTimeout(resolve, 500));
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
                {USE_SIMPLE_APP ? (
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