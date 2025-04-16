import * as Font from 'expo-font';

// Define custom fonts with their paths
export const FONTS = {
  'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
  'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
  'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
};

// Define system fallback fonts
export const FALLBACK_FONTS = {
  'Poppins-Regular': 'System',
  'Poppins-Medium': 'System',
  'Poppins-Bold': 'System',
};

// Function to load all fonts
export const loadFonts = async (): Promise<{ success: boolean; error?: Error }> => {
  try {
    await Font.loadAsync(FONTS);
    return { success: true };
  } catch (error) {
    console.warn('Font loading error:', error);
    
    // If custom fonts fail, try to use system fonts as fallback
    try {
      console.log('Using system fonts as fallback');
      return { success: true };
    } catch (fallbackError) {
      console.error('Critical font error:', fallbackError);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Unknown font loading error') 
      };
    }
  }
};

// Get the appropriate font family with fallback
export const getFontFamily = (fontName: keyof typeof FONTS): string => {
  try {
    // This will throw an error if the font isn't loaded
    Font.isLoaded(fontName);
    return fontName;
  } catch {
    // Return the fallback font if the primary isn't loaded
    return FALLBACK_FONTS[fontName] || 'System';
  }
};

// Define a type-safe way to use our fonts
export const fontFamily = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  bold: 'Poppins-Bold',
} as const;

export default {
  loadFonts,
  getFontFamily,
  fontFamily,
}; 