import React from 'react';
import { Text } from 'react-native';
import { typography, colors } from '../../theme/theme';

const Typography = ({ 
  variant = 'body', 
  color = colors.textMain, 
  align = 'left', 
  style, 
  children, 
  ...props 
}) => {
  return (
    <Text 
      style={[
        typography[variant], 
        { color, textAlign: align, fontFamily: typography.fontFamily }, 
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
