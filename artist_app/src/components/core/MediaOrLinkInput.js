import React from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import ValidatedURLInput from './ValidatedURLInput';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { useTheme } from '../../theme/ThemeProvider';

import { PermissionsAndroid, Platform } from 'react-native';

export default function MediaOrLinkInput({ value, onChangeText, placeholder, platform = 'any', onFileSelect, isUploading }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const handlePickMedia = async (fromCamera = false) => {
    const options = {
      mediaType: 'mixed', // allows photo or video
      quality: 0.8,
    };
    
    try {
      if (fromCamera && Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.error("Camera permission denied");
          Alert.alert('Permission Denied', 'Camera permission is required to take photos or videos.');
          return;
        }
      }

      const res = fromCamera  
        ? await launchCamera(options) 
        : await launchImageLibrary(options);
        
      if (res.didCancel) return;
      
      if (res.errorMessage) {
        console.error('ImagePicker Error: ', res.errorMessage);
        Alert.alert('Error', res.errorMessage);
        return;
      }
      
      if (!res.assets?.length) return;
      
      onFileSelect(res.assets[0]);
    } catch (error) {
      console.error('Pick Media Error:', error);
      Alert.alert('Error', 'Failed to pick media. Please try again.');
    }
  };

  const getThumbnailUrl = (url) => {
    if (!url) return null;
    const ytMatch = url.match(/(?:v=|youtu\.be\/)([^&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) {
      return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
    }
    if (url.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null) {
      return url;
    }
    return null;
  };

  const thumbnailUrl = getThumbnailUrl(value);

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <View style={styles.inputWrapper}>
          <ValidatedURLInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            platform={platform}
          />
        </View>
        
        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, isUploading && { opacity: 0.5 }]} 
            onPress={() => handlePickMedia(true)}
            disabled={isUploading}
          >
            <Icon name="camera" size={22} color={colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionBtn, isUploading && { opacity: 0.5 }]} 
            onPress={() => handlePickMedia(false)}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Icon name="image" size={22} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {thumbnailUrl ? (
        <View style={styles.thumbnailContainer}>
          <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} />
        </View>
      ) : null}
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  outerContainer: {
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  inputWrapper: {
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    marginLeft: 8,
    height: 50,
    width: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailContainer: {
    marginTop: 10,
    borderRadius: 8,
    overflow: 'hidden',
    height: 140,
    width: '100%',
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  }
});
