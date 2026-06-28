import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing } from '../../theme/theme';
import AuditionCard from '../../components/artist/AuditionCard';
import { useGetMyApplicationsQuery } from '../../services/discoverApi';

const TABS = ['Pending', 'Accepted', 'Rejected'];

export default function MyApplicationsScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('Pending');

  const { data: applications = [], isLoading, isError, refetch } = useGetMyApplicationsQuery();

  const handleAuditionPress = (item) => {
    navigation.navigate('ApplicationDetail', { application: item });
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📋</Text>
      <Text style={styles.emptyText}>No {activeTab.toLowerCase()} applications</Text>
    </View>
  );

  // Filter applications based on active tab
  const filteredApps = Array.isArray(applications) 
    ? applications.filter(app => (app.status || 'Pending').toLowerCase() === activeTab.toLowerCase())
    : [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Applications</Text>
          <Text style={styles.subtitle}>Track your submissions.</Text>
        </View>

        {/* Custom Tab Selector */}
        <View style={styles.tabContainer}>
          {TABS.map((tab) => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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
            ListEmptyComponent={renderEmptyState}
            renderItem={({ item }) => (
              <View style={styles.cardWrapper}>
                <AuditionCard 
                  // Pass the nested audition data if present, else fallback to item
                  audition={item.audition || item} 
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

const styles = StyleSheet.create({
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: colors.textMutedLight + '30',
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.m,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.body,
    color: colors.textMutedLight,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  cardWrapper: {
    marginBottom: spacing.l,
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
