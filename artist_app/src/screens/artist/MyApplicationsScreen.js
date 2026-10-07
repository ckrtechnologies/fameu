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
  { key: 'All', label: 'All', fullLabel: 'All' },
  { key: 'Pending', label: 'Review', fullLabel: 'In Review' },
  { key: 'Shortlisted', label: 'Shortlist', fullLabel: 'Shortlisted' },
  { key: 'Hired', label: 'Hired', fullLabel: 'Hired' },
  { key: 'Rejected', label: 'Closed', fullLabel: 'Not Selected' },
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
        <Text style={styles.emptyText}>No {currentTabObj?.fullLabel.toLowerCase() || 'matching'} applications</Text>
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

  const counts = React.useMemo(() => {
    const list = Array.isArray(appsList) ? appsList : [];
    const countMap = {
      All: list.length,
      Pending: 0,
      Shortlisted: 0,
      Hired: 0,
      Rejected: 0,
    };
    list.forEach(app => {
      const s = String(app.status || 'pending').toLowerCase().trim();
      if (s === 'pending') countMap.Pending++;
      else if (s === 'shortlisted' || s === 'accepted' || s === 'interview_scheduled') countMap.Shortlisted++;
      else if (s === 'hired') countMap.Hired++;
      else if (s === 'rejected') countMap.Rejected++;
    });
    return countMap;
  }, [appsList]);

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
            <View style={styles.segmentedContainer}>
              {TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                const count = counts[tab.key] || 0;
                return (
                  <TouchableOpacity 
                    key={tab.key} 
                    style={[styles.segmentBtn, isActive && styles.activeSegmentBtn]}
                    onPress={() => setActiveTab(tab.key)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.segmentText, isActive && styles.activeSegmentText]} numberOfLines={1}>
                      {tab.label}
                    </Text>
                    <View style={[styles.segmentBadge, isActive && styles.activeSegmentBadge]}>
                      <Text style={[styles.segmentBadgeText, isActive && styles.activeSegmentBadgeText]}>
                        {count}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
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
                  showStatus
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
    paddingHorizontal: 12,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(227, 176, 75, 0.25)',
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 2,
    borderRadius: 11,
  },
  activeSegmentBtn: {
    backgroundColor: '#E3B04B',
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  activeSegmentText: {
    color: '#1A1200',
    fontWeight: '800',
  },
  segmentBadge: {
    marginLeft: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeSegmentBadge: {
    backgroundColor: 'rgba(26, 18, 0, 0.18)',
  },
  segmentBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#E3B04B',
  },
  activeSegmentBadgeText: {
    color: '#1A1200',
    fontWeight: '900',
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
