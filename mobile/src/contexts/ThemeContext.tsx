import React, { createContext, useContext, ReactNode } from 'react';
import { useFont } from '../hooks/useFont';

// Define theme colors and typography
const colors = {
  primary: '#F97316',
  secondary: '#6200ee',
  background: '#FFFFFF',
  card: '#F3F4F6',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  notification: '#EF4444',
};

// Context type definition
interface ThemeContextType {
  colors: typeof colors;
  fonts: {
    regular: string;
    medium: string;
    bold: string;
  };
  fontStyle: (type?: 'regular' | 'medium' | 'bold') => { fontFamily: string };
  fontLoaded: boolean;
}

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  colors,
  fonts: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontStyle: () => ({ fontFamily: 'System' }),
  fontLoaded: false,
});

// Props for the ThemeProvider component
interface ThemeProviderProps {
  children: ReactNode;
}

// Theme Provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Use our custom font hook to get font families
  const { fonts, fontStyle, loaded: fontLoaded } = useFont();

  // Create the theme object
  const theme: ThemeContextType = {
    colors,
    fonts,
    fontStyle,
    fontLoaded,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext; 