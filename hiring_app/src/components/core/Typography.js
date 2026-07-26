import React from 'react';
import { Text } from 'react-native';
import { typography } from '../../theme/theme';
import { useTheme } from '../../theme/ThemeProvider';

const Typography = ({ 
  variant = 'body', 
  color, 
  align = 'left', 
  style, 
  children, 
  ...props 
}) => {
  const { colors } = useTheme();
  const textColor = color || colors.textMain;
  return (
    <Text 
      style={[
        typography[variant], 
        { color: textColor, textAlign: align, fontFamily: typography.fontFamily }, 
        style,
        { fontFamily: 'Comic Sans MS', fontWeight: 'normal' }
      ]} 
      {...props}
    >
      {children}
    </Text>
  );
};

export default Typography;
