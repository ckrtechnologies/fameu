import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';

import { colors, typography, spacing } from '../../theme/theme';
import { useGetProfileQuery } from '../../services/profileApi';

const { width } = Dimensions.get('window');

export default function ArtistProfileScreen() {
  const navigation = useNavigation();
  const user = useSelector(state => state.auth.user);
  
  const { data: profileResponse, isLoading, isError, error, refetch } = useGetProfileQuery();
  
  const profile = profileResponse?.data;
  const [activeTab, setActiveTab] = useState('Overview');

  const fullName = profile?.full_name || user?.full_name || 'Artist';
  // Use a display name for the header (like instagram username)
  const username = (user?.full_name || 'artist').toLowerCase().replace(/\s+/g, '_');
  const avatarUrl = profile?.photo_urls?.[0] || user?.avatar_url || 'https://via.placeholder.com/150';
  const bio = profile?.bio || 'Add a bio to let casting directors know more about you.';
  const portfolio = profile?.photo_urls || [];
  
  const stats = profile?.stats || { applications: 0, callbacks: 0, views: 0 };
  const is404 = isError && error?.status === 404;
  const categories = profile?.categories || [];
  const tabs = ['Overview', ...categories];

  const openDrawer = () => {
    navigation.openDrawer();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]} edges={['left', 'right']}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (isError && !is404) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]} edges={['left', 'right']}>
        <Text style={styles.errorText}>Failed to load profile. Please try again.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // 404 State
  if (is404 || !profile) {
    return (
      <SafeAreaView style={[styles.safeArea, { flex: 1 }]} edges={[]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 60 }}>
          <Icon name="person-circle-outline" size={80} color={colors.textMutedLight} />
          <Text style={{ ...typography.h2, color: colors.textMainLight, marginTop: 16 }}>No Profile Yet</Text>
          <TouchableOpacity 
            style={{ backgroundColor: colors.primary, padding: 12, borderRadius: 8, marginTop: 24 }}
            onPress={() => navigation.navigate('ArtistCategory')}
          >
            <Text style={{ color: colors.backgroundLight, fontWeight: 'bold' }}>Create Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Instagram Profile Info Row */}
        <View style={styles.profileRow}>
          <Image source={{ uri: avatarUrl }} style={styles.avatarInsta} />
          <View style={styles.statsContainerInsta}>
            <View style={styles.statBoxInsta}>
              <Text style={styles.statNumberInsta}>{stats.applications}</Text>
              <Text style={styles.statLabelInsta}>Applied</Text>
            </View>
            <View style={styles.statBoxInsta}>
              <Text style={styles.statNumberInsta}>{stats.callbacks}</Text>
              <Text style={styles.statLabelInsta}>Callbacks</Text>
            </View>
            <View style={styles.statBoxInsta}>
              <Text style={styles.statNumberInsta}>{stats.views}</Text>
              <Text style={styles.statLabelInsta}>Views</Text>
            </View>
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.bioSection}>
          <Text style={styles.fullNameInsta}>{fullName}</Text>
          {categories.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4, marginTop: 2 }}>
              {categories.map((cat, i) => (
                <View key={i} style={{ backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.borderLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 8 }}>
                  <Text style={{ color: colors.textMainLight, fontSize: 12, fontWeight: '600' }}>{cat}</Text>
                </View>
              ))}
            </View>
          )}
          <Text style={styles.bioInsta}>{bio}</Text>
          
          <TouchableOpacity 
            style={styles.editProfileBtnInsta}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editProfileTextInsta}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            {tabs.map(tab => (
              <TouchableOpacity 
                key={tab} 
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tab Content */}
        {activeTab === 'Overview' ? (
          <View style={styles.portfolioSection}>
            <View style={{ backgroundColor: colors.surfaceLight, padding: 16, borderRadius: 12, marginBottom: 24, marginHorizontal: spacing.xl }}>
              <Text style={{ ...typography.h3, color: colors.primary, marginBottom: 12 }}>Basic Info</Text>
              {['age', 'gender', 'height', 'weight', 'city', 'languages', 'skills'].map((k) => {
                const v = profile[k];
                if (v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) return null;
                const label = k.charAt(0).toUpperCase() + k.slice(1);
                const value = Array.isArray(v) ? v.join(', ') : String(v);
                return (
                  <View key={k} style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'flex-start' }}>
                    <Text style={{ ...typography.caption, color: colors.textMutedLight, width: 80 }}>{label}</Text>
                    <Text style={{ ...typography.body, color: colors.textMainLight, flex: 1 }}>{value}</Text>
                  </View>
                );
              })}
            </View>

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
                  No photos in portfolio.
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.l }}>
            {(() => {
              const details = profile.category_details?.[activeTab.toLowerCase()];
              if (!details) {
                return (
                  <View style={styles.emptyPortfolio}>
                    <Text style={{ color: colors.textMutedLight }}>No {activeTab} details added.</Text>
                  </View>
                );
              }
              
              const entries = Object.entries(details).filter(([k,v]) => k !== 'id' && k !== 'artist_id' && v !== null && v !== '');
              if (entries.length === 0) {
                return (
                  <View style={styles.emptyPortfolio}>
                    <Text style={{ color: colors.textMutedLight }}>No {activeTab} details added.</Text>
                  </View>
                );
              }

              return (
                <View style={{ backgroundColor: colors.surfaceLight, padding: 16, borderRadius: 12, marginBottom: 12 }}>
                  <Text style={{ ...typography.h3, color: colors.primary, marginBottom: 12 }}>{activeTab} Details</Text>
                  {entries.map(([k,v]) => {
                    const label = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    const value = Array.isArray(v) ? v.join(', ') : String(v);
                    return (
                      <View key={k} style={{ marginBottom: 8 }}>
                        <Text style={{ ...typography.caption, color: colors.textMutedLight }}>{label}</Text>
                        <Text style={{ ...typography.body, color: colors.textMainLight }}>{value}</Text>
                      </View>
                    );
                  })}
                </View>
              );
            })()}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.backgroundLight },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.s,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  headerUsername: {
    ...typography.h2,
    color: colors.textMainLight,
    fontWeight: '700',
  },
  menuButton: {
    padding: 4,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.l,
    justifyContent: 'space-between',
  },
  avatarInsta: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statsContainerInsta: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: spacing.l,
  },
  statBoxInsta: {
    alignItems: 'center',
  },
  statNumberInsta: {
    ...typography.h2,
    color: colors.textMainLight,
    fontWeight: '700',
  },
  statLabelInsta: {
    ...typography.caption,
    color: colors.textMainLight,
  },
  bioSection: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.m,
  },
  fullNameInsta: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textMainLight,
  },
  bioInsta: {
    ...typography.body,
    color: colors.textMainLight,
    marginTop: 2,
    lineHeight: 20,
  },
  editProfileBtnInsta: {
    backgroundColor: '#EFEFEF',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: spacing.m,
    marginBottom: spacing.l,
  },
  editProfileTextInsta: {
    ...typography.body,
    fontWeight: '600',
    color: '#000000',
  },
  tabsContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
    marginBottom: 8,
    paddingTop: 8,
  },
  tabsScroll: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textMutedLight,
  },
  tabTextActive: {
    color: colors.backgroundLight,
  },
  portfolioSection: {
    marginTop: spacing.m,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  galleryItem: {
    width: width / 3 - 2, // 3 columns with 1px gap
    aspectRatio: 1,
    marginBottom: 2,
    marginRight: 2,
    backgroundColor: colors.surfaceLight,
  },
  emptyPortfolio: {
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: 20,
  },
  errorText: {
    color: colors.danger,
    marginBottom: spacing.m,
  },
  retryButton: {
    padding: spacing.s,
    backgroundColor: colors.surfaceDark,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.textMainLight,
  }
});
