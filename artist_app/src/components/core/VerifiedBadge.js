import React from 'react';
import { View } from 'react-native';
import { BadgeCheck } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';


export default function VerifiedBadge({ size = 20, style }) {
  const { colors } = useTheme();
  return (
    <View style={[{ justifyContent: 'center', alignItems: 'center' }, style]}>
      <BadgeCheck size={size} color={colors.primary} fill={colors.white} />
    </View>
  );
}
