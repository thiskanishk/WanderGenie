import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface StyledTextProps extends TextProps {
  bold?: boolean;
  medium?: boolean;
  style?: any;
  children: React.ReactNode;
}

/**
 * StyledText component that automatically uses the theme fonts
 * with proper fallbacks if fonts fail to load
 */
const StyledText: React.FC<StyledTextProps> = ({
  bold,
  medium,
  style,
  children,
  ...props
}) => {
  const { fontStyle } = useTheme();
  
  // Determine which font style to use
  let fontType: 'regular' | 'medium' | 'bold' = 'regular';
  if (bold) fontType = 'bold';
  else if (medium) fontType = 'medium';
  
  return (
    <Text
      style={[fontStyle(fontType), style]}
      {...props}
    >
      {children}
    </Text>
  );
};

export default StyledText; 