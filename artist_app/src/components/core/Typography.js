import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { typography } from '../../theme/theme';

const Typography = ({ 
  variant = 'body', 
  color, 
  align = 'left', 
  style, 
  children, 
  ...props 
}) => {
  const { colors } = useTheme();
  return (
    <Text 
      style={[
        typography[variant], 
        { color: color || colors.textMainLight, textAlign: align, fontFamily: typography.fontFamily }, 
        style
      ]} 
      {...props}
    >
      {children}
    </Text>
  );
};

export default Typography;
