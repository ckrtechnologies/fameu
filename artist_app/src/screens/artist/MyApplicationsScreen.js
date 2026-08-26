import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Layers, Clock, Sparkles, CheckCircle2, XCircle } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { typography, spacing } from '../../theme/theme';
import AuditionCard from '../../components/artist/AuditionCard';
import ShrinkableHeader from '../../components/core/ShrinkableHeader';
import useShrinkableHeader from '../../hooks/useShrinkableHeader';
import { useGetMyApplicationsQuery } from '../../services/discoverApi';
import { useRefetchOnFocus } from '../../hooks/useRefetchOnFocus';

const TABS = [
  { key: 'All', label: 'All', Icon: Layers },
  { key: 'Pending', label: 'In Review', Icon: Clock },
  { key: 'Shortlisted', label: 'Shortlisted', Icon: Sparkles },
  { key: 'Hired', label: 'Hired', Icon: CheckCircle2 },
  { key: 'Rejected', label: 'Not Selected', Icon: XCircle },
];

export default function MyApplicationsScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const route = useRoute();
  const [activeTab, setActiveTab] = useState(route.params?.initialTab || 'All');

  const {
    scrollY,
    onScroll,
    headerPaddingVertical,
    headerTitleSize,
    subtitleHeight,
    subtitleOpacity,
    headerElevation,
  } = useShrinkableHeader();

  React.useEffect(() => {
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route.params?.initialTab]);

  const { data: applications = [], isLoading, isError, refetch } = useGetMyApplicationsQuery();
  useRefetchOnFocus(refetch);

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleAuditionPress = (item) => {
    navigation.navigate('ApplicationDetail', { application: item });
  };

  const renderEmptyState = () => {
    const currentTabObj = TABS.find(t => t.key === activeTab);
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>📋</Text>
        <Text style={styles.emptyText}>No {currentTabObj?.label.toLowerCase() || 'matching'} applications</Text>
      </View>
    );
  };

  // Filter applications based on active tab
  const appsList = applications?.data || applications || [];
  const filteredApps = Array.isArray(appsList) 
    ? appsList.filter(app => {
        const rawStatus = String(app.status || 'pending').toLowerCase().trim();
        if (activeTab === 'All') return true;
        if (activeTab === 'Pending') return rawStatus === 'pending';
        if (activeTab === 'Shortlisted') return rawStatus === 'shortlisted' || rawStatus === 'accepted' || rawStatus === 'interview_scheduled';
        if (activeTab === 'Hired') return rawStatus === 'hired';
        if (activeTab === 'Rejected') return rawStatus === 'rejected';
        return false;
      })
    : [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <ShrinkableHeader 
        title="Applications"
        subtitle={`${filteredApps.length} tracked submissions`}
        onAvatarPress={() => navigation.openDrawer()}
        headerPaddingVertical={headerPaddingVertical}
        headerTitleSize={headerTitleSize}
        subtitleHeight={subtitleHeight}
        subtitleOpacity={subtitleOpacity}
        headerElevation={headerElevation}
        bottomComponent={
          <View style={styles.tabWrapper}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabScrollContainer}
            >
              {TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                const IconComp = tab.Icon;
                return (
                  <TouchableOpacity 
                    key={tab.key} 
                    style={[styles.tabChip, isActive && styles.activeTabChip]}
                    onPress={() => setActiveTab(tab.key)}
                    activeOpacity={0.8}
                  >
                    <IconComp 
                      size={13} 
                      color={isActive ? '#FFFFFF' : colors.textMutedLight} 
                      strokeWidth={2.4}
                      style={{ marginRight: 6 }} 
                    />
                    <Text style={[styles.tabChipText, isActive && styles.activeTabChipText]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        }
      />

      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : isError ? (
          <View style={styles.centerContent}>
            <Text style={{ color: colors.danger }}>Failed to load applications.</Text>
            <TouchableOpacity onPress={refetch}>
              <Text style={{ color: colors.primary, marginTop: spacing.s }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredApps}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            onScroll={onScroll}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
            }
            ListEmptyComponent={renderEmptyState}
            renderItem={({ item }) => (
              <View style={styles.cardWrapper}>
                <AuditionCard 
                  // Pass the nested audition data along with application status
                  audition={{
                    ...(item.auditions || item.audition || item),
                    status: item.status || 'pending'
                  }} 
                  onPress={() => handleAuditionPress(item)} 
                  style={styles.fullWidthCard}
                />
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.xl,
    paddingTop: spacing.l,
    paddingBottom: spacing.m,
  },
  title: {
    ...typography.h1,
    color: colors.textMainLight,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMutedLight,
  },
  tabWrapper: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight || '#E2E8F0',
  },
  tabScrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight || '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.borderLight || '#E2E8F0',
  },
  activeTabChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.textMutedLight || '#64748B',
  },
  activeTabChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  cardWrapper: {
    marginBottom: 14,
    alignItems: 'center',
  },
  fullWidthCard: {
    width: '100%',
    marginRight: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.m,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMutedLight,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
