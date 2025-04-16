import * as Font from 'expo-font';
import { Platform } from 'react-native';

/**
 * Safely loads fonts with error handling and diagnostics
 */
export const loadFonts = async (): Promise<boolean> => {
  try {
    console.log('📱 Loading fonts...');
    
    // Define fonts to load
    const fonts = {
      'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
      'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
      'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    };
    
    // Load fonts
    await Font.loadAsync(fonts);
    console.log('✅ Fonts loaded successfully');
    return true;
  } catch (error) {
    // Get detailed error information
    const errorDetails = error instanceof Error ? error.message : String(error);
    console.error(`❌ Font loading failed: ${errorDetails}`);
    
    // Log extra info for iOS
    if (Platform.OS === 'ios') {
      console.log('⚠️ iOS font errors often occur when font files are missing or corrupted');
      console.log('⚠️ Check that all font files exist in the assets/fonts directory');
    }
    
    // Log diagnostics path for Android
    if (Platform.OS === 'android') {
      console.log('⚠️ For Android, verify fonts are correctly placed in assets/fonts');
    }
    
    return false;
  }
};

/**
 * Checks if a specific font family is loaded
 */
export const isFontLoaded = async (fontFamily: string): Promise<boolean> => {
  try {
    const loadedFonts = await Font.loadedFontsAsync();
    return loadedFonts.some(font => font.fontFamily === fontFamily);
  } catch (error) {
    console.error('Error checking font loaded status:', error);
    return false;
  }
};

/**
 * Get system font family based on platform
 */
export const getSystemFont = (): string => {
  return Platform.OS === 'ios' ? 'System' : 'Roboto';
}; 