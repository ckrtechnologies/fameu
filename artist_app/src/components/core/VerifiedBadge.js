import React from 'react';
import { View } from 'react-native';
import { BadgeCheck } from 'lucide-react-native';
import { colors } from '../../theme/theme';

export default function VerifiedBadge({ size = 20, style }) {
  return (
    <View style={[{ justifyContent: 'center', alignItems: 'center' }, style]}>
      <BadgeCheck size={size} color={colors.primary} fill={colors.white} />
    </View>
  );
}
