import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ApolloProvider } from '@apollo/client';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import { Alert } from 'react-native';

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
import { ThemeProvider } from './src/contexts/ThemeContext';
import { loadFonts } from './src/utils/fonts';

// Flag to switch between simple and full app
const USE_SIMPLE_APP = true; // Set to true for simpler version during development

// Keep splash screen visible while we initialize
SplashScreen.preventAutoHideAsync();

// Interface for Auth state
interface AuthState {
  token: string | null;
  isLoading: boolean;
  user?: {
    firstName?: string;
  }
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontError, setFontError] = useState(false);

  // Prepare the app (load fonts, etc)
  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts using our utility
        const fontResult = await loadFonts();
        if (!fontResult.success) {
          setFontError(true);
          console.warn('Font loading issue:', fontResult.error);
        }
      } catch (e) {
        setFontError(true);
        console.warn('Error during app preparation:', e);
      } finally {
        // Artificially delay for a smoother startup
        await new Promise(resolve => setTimeout(resolve, 500));
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // Callback when layout is ready to hide splash screen
  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      try {
        await SplashScreen.hideAsync();
        
        // Show an alert if there was a font error but only in development
        if (fontError && __DEV__) {
          Alert.alert(
            'Font Loading Issue',
            'Some custom fonts could not be loaded. The app will use system fonts instead.',
            [{ text: 'OK' }]
          );
        }
      } catch (e) {
        console.warn('Error hiding splash screen:', e);
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
          <ThemeProvider>
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
          </ThemeProvider>
        </ApolloProvider>
      </PersistGate>
    </ReduxProvider>
  );
}

// Network status banner component
function NetworkStatusBanner() {
  const { isConnected } = useNetworkStatus();
  return !isConnected ? <OfflineBanner /> : null;
}

// Navigation root component that checks auth state from AuthContext
function AuthAwareNavigationRoot() {
  const { isLoggedIn, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }

  return isLoggedIn ? <AppNavigator /> : <AuthNavigator />;
}

// Legacy Redux-based navigation root
function NavigationRoot() {
  // Get auth state from Redux store
  const { token, isLoading } = useAppSelector((state: { auth: AuthState }) => state.auth);
  
  if (isLoading) {
    return <LoadingScreen />;
  }

  return token ? <AppNavigator /> : <AuthNavigator />;
}