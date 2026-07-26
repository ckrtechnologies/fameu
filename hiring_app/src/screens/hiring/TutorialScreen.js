import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import Video from 'react-native-video';
import Typography from '../../components/core/Typography';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing, typography } from '../../theme/theme';

const { width } = Dimensions.get('window');

export default function TutorialScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();

  // For demonstration, a sample tutorial video URL
  const tutorialVideoUrl = "https://www.w3schools.com/html/mov_bbb.mp4"; 

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.textMainLight} />
        </TouchableOpacity>
        <Typography variant="body" style={styles.title}>How this app works</Typography>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Typography variant="body" style={styles.description}>
          Welcome to Fameu! Watch the short video below to learn how to create your profile, apply to auditions, and get discovered by casting directors.
        </Typography>

        <View style={styles.videoContainer}>
          <Video 
            source={{ uri: tutorialVideoUrl }}
            style={styles.video}
            controls={true}
            resizeMode="contain"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceDark,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    ...typography.h2,
    color: colors.textMainLight,
  },
  content: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  description: {
    ...typography.body,
    color: colors.textMutedLight,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  videoContainer: {
    width: width - (spacing.xl * 2),
    height: (width - (spacing.xl * 2)) * (9 / 16),
    backgroundColor: colors.surfaceDark,
    borderRadius: 12,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  }
});
