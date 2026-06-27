import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing } from '../../theme/theme';
import CustomButton from '../../components/CustomButton';
import { useGetProfileQuery } from '../../services/profileApi';
import { useSelector } from 'react-redux';

export default function ArtistProfileScreen() {
  const navigation = useNavigation();
  const user = useSelector(state => state.auth.user);
  
  const { data: profile, isLoading, isError, refetch } = useGetProfileQuery();

  // We combine the authenticated user's base details with the artist profile details
  const fullName = profile?.full_name || user?.full_name || 'Artist';
  const avatarUrl = profile?.avatar_url || 'https://via.placeholder.com/150';
  const bio = profile?.bio || 'Add a bio to let casting directors know more about you.';
  const portfolio = profile?.portfolio_urls || [];
  
  // Use backend stats if available, otherwise default
  const stats = profile?.stats || { applications: 0, callbacks: 0, views: 0 };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.danger }}>Failed to load profile.</Text>
        <TouchableOpacity onPress={refetch}>
          <Text style={{ color: colors.primary, marginTop: spacing.s }}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header Actions */}
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => navigation.navigate('ArtistSettings')}>
            <Text style={styles.actionText}>⚙️ Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <Image 
            source={{ uri: avatarUrl }} 
            style={styles.avatar} 
          />
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.bio}>{bio}</Text>
          
          <CustomButton 
            title="Edit Profile" 
            variant="secondary"
            onPress={() => navigation.navigate('EditProfile')}
            style={styles.editBtn}
          />
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.applications}</Text>
            <Text style={styles.statLabel}>Applied</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.callbacks}</Text>
            <Text style={styles.statLabel}>Callbacks</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.views}</Text>
            <Text style={styles.statLabel}>Views</Text>
          </View>
        </View>

        {/* Portfolio Gallery */}
        <View style={styles.portfolioSection}>
          <Text style={styles.sectionTitle}>Portfolio</Text>
          {portfolio.length > 0 ? (
            <View style={styles.galleryGrid}>
              {portfolio.map((imgUrl, index) => (
                <Image 
                  key={index} 
                  source={{ uri: imgUrl }} 
                  style={styles.galleryItem} 
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyPortfolio}>
              <Text style={{ color: colors.textMutedLight, textAlign: 'center' }}>
                You haven't uploaded any photos yet.
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  container: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.m,
  },
  actionText: {
    ...typography.body,
    color: colors.textMainLight,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.l,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: spacing.m,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  name: {
    ...typography.h1,
    color: colors.textMainLight,
    marginBottom: spacing.xs,
  },
  bio: {
    ...typography.body,
    color: colors.textMutedLight,
    textAlign: 'center',
    marginBottom: spacing.l,
    lineHeight: 24,
  },
  editBtn: {
    width: 160,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    marginTop: spacing.xxl,
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    paddingVertical: spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.textMutedLight + '30',
  },
  statNumber: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMutedLight,
  },
  portfolioSection: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xxl,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textMainLight,
    marginBottom: spacing.m,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  galleryItem: {
    width: '31%', // roughly a third with spacing
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: spacing.m,
    backgroundColor: colors.surfaceLight,
  },
  emptyPortfolio: {
    padding: spacing.xl,
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    alignItems: 'center',
  }
});
