import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { MapPin, Calendar, MonitorPlay, Mic2, Camera, Clapperboard, Briefcase, Clock, User, Users, Globe, Star } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
;

export const AnimatedTileGrid = ({ options, selectedValue, onSelect, isMulti }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <View style={styles.tileGridContainer}>
      {options.map((option, index) => {
        const isSelected = isMulti ? selectedValue.includes(option) : selectedValue === option;
        return (
          <AnimatedTile 
            key={option} 
            option={option} 
            isSelected={isSelected} 
            index={index}
            onSelect={() => {
              if (isMulti) {
                if (isSelected) onSelect(selectedValue.filter(v => v !== option));
                else onSelect([...selectedValue, option]);
              } else {
                onSelect(option);
              }
            }}
          />
        );
      })}
    </View>
  );
};

const AnimatedTile = ({ option, isSelected, onSelect, index }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fillAnim = useRef(new Animated.Value(isSelected ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: isSelected ? 1.05 : 1,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(fillAnim, {
        toValue: isSelected ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      })
    ]).start();
  }, [isSelected]);

  const getIconForOption = (name) => {
    const n = name.toLowerCase();
    const iconColor = isSelected ? colors.primary : colors.textMutedLight;
    if (n.includes('walk-in')) return <MapPin size={24} color={iconColor} />;
    if (n.includes('schedule')) return <Calendar size={24} color={iconColor} />;
    if (n.includes('online')) return <MonitorPlay size={24} color={iconColor} />;
    if (n.includes('audition')) return <Mic2 size={24} color={iconColor} />;
    if (n.includes('photo')) return <Camera size={24} color={iconColor} />;
    if (n.includes('shoot') || n.includes('film')) return <Clapperboard size={24} color={iconColor} />;
    if (n.includes('full')) return <Briefcase size={24} color={iconColor} />;
    if (n.includes('part') || n.includes('date')) return <Clock size={24} color={iconColor} />;
    if (n === 'male' || n === 'female') return <User size={24} color={iconColor} />;
    if (n === 'other') return <Users size={24} color={iconColor} />;
    if (n === 'any') return <Globe size={24} color={iconColor} />;
    return <Star size={24} color={iconColor} />;
  };

  const borderColor = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.borderLight, colors.primary]
  });
  const bgColor = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surfaceLight, '#FFF']
  });

  return (
    <TouchableOpacity onPress={onSelect} activeOpacity={0.8} style={{ width: '31%', marginBottom: 12, marginLeft: index % 3 !== 0 ? '3.5%' : 0 }}>
      <Animated.View style={[styles.tileItem, { 
        transform: [{ scale: scaleAnim }],
        borderColor: borderColor,
        backgroundColor: bgColor
      }]}>
        {getIconForOption(option)}
        <Text style={[styles.tileText, isSelected && styles.tileTextSelected]}>
          {option}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const getStyles = (colors) => StyleSheet.create({
  tileGridContainer: {
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'flex-start'
  },
  tileItem: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 90
  },
  tileText: {
    fontFamily: 'Comic Sans MS',
    fontSize: 12,
    color: colors.textMutedLight,
    marginTop: 8,
    textAlign: 'center'
  },
  tileTextSelected: {
    color: colors.primary,
    fontWeight: '700'
  }
});
