import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ApolloProvider } from '@apollo/client';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import { Alert, ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

// Enable screens for better navigation performance
enableScreens();

import { client } from './src/api/apollo';
import { store, persistor } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import OnboardingNavigator from './src/navigation/OnboardingNavigator';
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

const Root = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return user ? <AppNavigator /> : <AuthNavigator />;
};

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontError, setFontError] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  // Prepare the app (load fonts, check onboarding state, etc)
  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts using our utility
        const fontResult = await loadFonts();
        if (!fontResult.success) {
          setFontError(true);
          console.warn('Font loading issue:', fontResult.error);
        }

        // Check if the user has seen onboarding
        const onboardingState = await AsyncStorage.getItem('hasSeenOnboarding');
        setHasSeenOnboarding(onboardingState === 'true');
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

  if (!appIsReady || hasSeenOnboarding === null) {
    return <LoadingScreen />;
  }

  return (
    <ReduxProvider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <ApolloProvider client={client}>
          <ThemeProvider>
            <AuthProvider>
              <SafeAreaProvider onLayout={onLayoutRootView}>
                <>
                  <NavigationContainer>
                    <StatusBar style="auto" />
                    {hasSeenOnboarding === false ? (
                      <OnboardingNavigator />
                    ) : (
                      <Root />
                    )}
                  </NavigationContainer>
                  <Toast />
                </>
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