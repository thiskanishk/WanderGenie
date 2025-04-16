import React from 'react';
import StyledText from './text/StyledText';
import { TextProps } from 'react-native';

/**
 * AppText: Use this everywhere for default app font (Poppins or fallback)
 */
const AppText: React.FC<TextProps & { bold?: boolean; medium?: boolean }> = ({
  children,
  bold,
  medium,
  style,
  ...props
}) => {
  return (
    <StyledText bold={bold} medium={medium} style={style} {...props}>
      {children}
    </StyledText>
  );
};

export default AppText;
