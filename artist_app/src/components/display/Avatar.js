import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { colors } from '../../theme/theme';

const Avatar = ({ source, size = 50, status }) => {
  const statusColor = status === 'online' ? colors.success : 
                      status === 'busy' ? colors.danger : 
                      status === 'away' ? colors.warning : 'transparent';
                      
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      {source ? (
        <Image source={source} style={[styles.image, { borderRadius: size / 2 }]} />
      ) : (
        <View style={[styles.placeholder, { borderRadius: size / 2 }]} />
      )}
      {status && (
        <View style={[
          styles.statusBadge, 
          { 
            backgroundColor: statusColor,
            width: size * 0.25,
            height: size * 0.25,
            borderRadius: size * 0.125,
            borderWidth: size > 40 ? 2 : 1,
          }
        ]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.borderDark,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.borderDark,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderColor: colors.card,
  }
});

export default Avatar;
