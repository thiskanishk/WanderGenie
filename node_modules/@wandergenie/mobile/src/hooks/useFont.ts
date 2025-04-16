import { useState, useEffect } from 'react';
import * as Font from 'expo-font';
import { fontFamily, getFontFamily } from '../utils/fonts';

/**
 * Hook that provides access to font families with fallbacks
 * 
 * @returns Object with font family mappings
 */
export function useFont() {
  const [loaded, setLoaded] = useState(false);
  const [fonts, setFonts] = useState({
    regular: 'System',
    medium: 'System',
    bold: 'System',
  });

  useEffect(() => {
    // Determine which fonts are loaded and set accordingly
    const checkFonts = async () => {
      const isRegularLoaded = await Font.isLoadedAsync(fontFamily.regular).catch(() => false);
      const isMediumLoaded = await Font.isLoadedAsync(fontFamily.medium).catch(() => false);
      const isBoldLoaded = await Font.isLoadedAsync(fontFamily.bold).catch(() => false);

      setFonts({
        regular: isRegularLoaded ? fontFamily.regular : 'System',
        medium: isMediumLoaded ? fontFamily.medium : 'System',
        bold: isBoldLoaded ? fontFamily.bold : 'System',
      });
      
      setLoaded(true);
    };

    checkFonts();
  }, []);

  return { 
    fonts, 
    loaded,
    // Helper for getting fontFamily style
    fontStyle: (type: keyof typeof fontFamily = 'regular') => ({
      fontFamily: fonts[type] || 'System',
    })
  };
}

export default useFont; 