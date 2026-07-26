import { showError, showSuccess } from '../../utils/toast';
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, Alert, TextInput, ScrollView, Modal, Linking , RefreshControl } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { AnimatedTileGrid } from '../../components/forms/AnimatedTileGrid';

import { colors, typography, spacing, globalStyles } from '../../theme/theme';
import { useGetAllApplicantsQuery, useUpdateApplicationStatusMutation } from '../../services/auditionApi';
import { useStartConversationMutation } from '../../services/chatApi';
import SidebarFilterModal from '../../components/SidebarFilterModal';
export default function AllApplicantsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const { data: applicantsResponse, isLoading, refetch , isFetching} = useGetAllApplicantsQuery()
  const [updateStatus, { isLoading: isUpdating }] = useUpdateApplicationStatusMutation();
  const [startConversation, { isLoading: isStartingChat }] = useStartConversationMutation();

  const route = useRoute();
  const [activeTab, setActiveTab] = useState(route.params?.initialTab || 'pending');

  const [filters, setFilters] = useState({
    gender: 'All',
    location: 'All Locations',
    profession: 'All',
    type: 'Any',
    projectType: 'All',
    date: 'All Time'
  });

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route.params?.initialTab]);

  const tabs = ['all', 'pending', 'shortlisted', 'rejected', 'hired'];
  const genders = ['All', 'Male', 'Female', 'Other'];
  const types = ['Any', 'Walk-in', 'Scheduled', 'Live'];
  const dateRanges = ['All Time', 'Last 7 Days', 'Last 30 Days'];
  const professions = ['All', 'Actor', 'Model', 'Dancer', 'Singer', 'Musician', 'Comedian', 'Other'];
  const projectTypes = ['All', 'Audition', 'Casting call', 'Photo shoot', 'Shoot', 'Freelance project/assignment'];
  const CITIES = ['Mumbai', 'Delhi NCR', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Chandigarh', 'Other'];

  const applicants = applicantsResponse?.data || [];
  
  const filteredApplicants = applicants.filter(app => {
    if (activeTab !== 'all' && app.status !== activeTab) return false;
    
    const artist = app.artist_profiles || {};
    const audition = app.auditions || {};

    if (filters.gender && filters.gender !== 'All' && !(Array.isArray(filters.gender) && filters.gender.includes('All'))) {
      if (Array.isArray(filters.gender) ? !filters.gender.includes(artist.gender) : artist.gender !== filters.gender) return false;
    }
    
    if (filters.location && filters.location !== 'All Locations' && !(Array.isArray(filters.location) && filters.location.includes('All Locations'))) {
      if (!artist.city) return false;
      if (Array.isArray(filters.location)) {
        if (!filters.location.some(loc => artist.city.toLowerCase().includes(loc.toLowerCase()))) return false;
      } else {
        if (!artist.city.toLowerCase().includes(filters.location.toLowerCase())) return false;
      }
    }
    
    if (filters.profession && filters.profession !== 'All' && !(Array.isArray(filters.profession) && filters.profession.includes('All'))) {
      let cats = artist.categories || [];
      if (typeof cats === 'string') {
        try { cats = JSON.parse(cats); } catch(e) { cats = [cats]; }
      }
      if (!Array.isArray(cats)) cats = [cats];
      
      if (Array.isArray(filters.profession)) {
        if (!filters.profession.some(p => cats.includes(p))) return false;
      } else {
        if (!cats.includes(filters.profession)) return false;
      }
    }

    if (filters.type && filters.type !== 'Any' && !(Array.isArray(filters.type) && filters.type.includes('Any'))) {
      const typeMap = { 'Walk-in': 'walkin', 'Scheduled': 'scheduled', 'Live': 'online' };
      if (Array.isArray(filters.type)) {
        if (!filters.type.some(t => audition.audition_type === typeMap[t])) return false;
      } else {
        if (audition.audition_type !== typeMap[filters.type]) return false;
      }
    }
    
    if (filters.projectType && filters.projectType !== 'All' && !(Array.isArray(filters.projectType) && filters.projectType.includes('All'))) {
      if (!audition.project_type) return false;
      let projTypes = audition.project_type;
      if (typeof projTypes === 'string') {
          projTypes = [projTypes];
      }
      
      if (Array.isArray(filters.projectType)) {
        if (!filters.projectType.some(pt => projTypes.includes(pt))) return false;
      } else {
        if (!projTypes.includes(filters.projectType)) return false;
      }
    }
    
    if (filters.date && filters.date !== 'All Time') {
      const appDate = new Date(app.created_at);
      const now = new Date();
      const diffTime = Math.abs(now - appDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      if (filters.date === 'Last 7 Days' && diffDays > 7) return false;
      if (filters.date === 'Last 30 Days' && diffDays > 30) return false;
    }

    return true;
  });

  const filterConfig = [
    { key: 'date', label: 'Date Range', type: 'select', options: dateRanges },
    { key: 'type', label: 'Audition Type', type: 'select', options: types, multiSelect: true },
    { key: 'projectType', label: 'Project Type', type: 'select', options: projectTypes, multiSelect: true },
    { key: 'profession', label: 'Profession', type: 'select', options: professions, multiSelect: true },
    { key: 'gender', label: 'Gender', type: 'select', options: genders, multiSelect: true },
    { key: 'location', label: 'City', type: 'select', options: ['All Locations', ...CITIES], multiSelect: true }
  ];

  const handleUpdateStatus = async (applicationId, newStatus) => {
    try {
      await updateStatus({ applicationId, status: newStatus }).unwrap();
      showSuccess('', `Applicant moved to ${newStatus}`);
    } catch (error) {
      showError('', error?.data?.error || 'Failed to update status');
    }
  };

  const handleStartChat = async (artistUserId, artistName, appAuditionId) => {
    try {
      const response = await startConversation({ 
        targetUserId: artistUserId, 
        auditionId: appAuditionId 
      }).unwrap();
      
      // Navigate to chat screen
      navigation.navigate('ChatScreen', {
        conversationId: response.data.id,
        otherUserName: artistName,
        auditionId: appAuditionId
      });
    } catch (error) {
      showError('', 'Failed to start conversation');
    }
  };

  const renderApplicantCard = ({ item }) => {
    // Assuming backend returns joined profile data
    const artist = item.artist_profiles || {};
    const name = artist.full_name || 'Unknown Artist';
    const avatar = artist.photo_urls && artist.photo_urls[0] ? artist.photo_urls[0] : artist.users?.avatar_url;

    return (
      <View style={styles.card}>
        <TouchableOpacity 
          style={styles.cardHeader} 
          onPress={() => navigation.navigate('ArtistProfileScreen', { id: item.artist_id })}
        >
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Icon name="person" size={24} color={colors.textMutedLight} />
            </View>
          )}
          <View style={styles.artistInfo}>
            <Text style={styles.artistName}>{name}</Text>
            {item.auditions?.title && (
              <TouchableOpacity onPress={() => navigation.navigate('AuditionDetails', { auditionId: item.auditions?.id || item.audition_id })}>
                <Text style={styles.appliedForText} numberOfLines={2}>
                  Applied for: <Text style={styles.appliedForTitle}>{item.auditions.title}</Text>
                </Text>
              </TouchableOpacity>
            )}
            {artist?.city && <Text style={styles.artistMeta}>{artist.city}</Text>}
            <Text style={styles.matchScore}>95% Match</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.viewDetailsBtn} 
          onPress={() => {
            setSelectedApp(item);
            setModalVisible(true);
          }}
        >
          <Icon name="document-text-outline" size={16} color={colors.primary} />
          <Text style={styles.viewDetailsBtnText}> View Application Details</Text>
        </TouchableOpacity>

        <View style={styles.actionButtons}>
          {item.status === 'pending' && (
            <>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.btnReject]} 
                onPress={() => handleUpdateStatus(item.id, 'rejected')}
                disabled={isUpdating}
              >
                <Text style={styles.btnRejectText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.btnShortlist]} 
                onPress={() => handleUpdateStatus(item.id, 'shortlisted')}
                disabled={isUpdating}
              >
                <Text style={styles.btnShortlistText}>Shortlist</Text>
              </TouchableOpacity>
            </>
          )}
          
          {item.status === 'shortlisted' && (
            <>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.btnReject]} 
                onPress={() => handleUpdateStatus(item.id, 'rejected')}
                disabled={isUpdating}
              >
                <Text style={styles.btnRejectText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.btnChat]} 
                onPress={() => handleStartChat(item.artist_profiles?.user_id || item.artist_id, name, item.auditions?.id || item.audition_id)}
                disabled={isStartingChat}
              >
                <Icon name="chatbubble" size={16} color="#FFF" />
                <Text style={styles.btnChatText}> Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.btnHire]} 
                onPress={() => handleUpdateStatus(item.id, 'hired')}
                disabled={isUpdating}
              >
                <Text style={styles.btnHireText}>Hire</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };
  return (
    <View style={globalStyles.container}>
      <View style={[styles.header, { paddingTop: 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textMainLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Applicants</Text>
      </View>
      <View style={styles.tabsContainer}>
        {tabs.map(tab => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.filterSection}>
        <TouchableOpacity 
          style={[styles.filterBtn, {flexDirection: 'row', alignItems: 'center'}]}
          onPress={() => setFilterModalVisible(true)}
        >
          <Icon name="options-outline" size={16} color={colors.textMainLight} style={{marginRight: 4}} />
          <Text style={styles.filterBtnText}>Advanced Filters</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredApplicants}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={isFetching || false} onRefresh={refetch} tintColor={colors.primary} />}
          renderItem={renderApplicantCard}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Icon name="folder-open-outline" size={48} color={colors.borderLight} />
              <Text style={styles.emptyText}>No applicants in this stage.</Text>
            </View>
          )}
        />
      )}

      {/* Filter Modal */}
      <SidebarFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={(newFilters) => setFilters(newFilters)}
        filterConfig={filterConfig}
        initialFilters={filters}
        defaultFilters={{ gender: 'All', location: 'All Locations', profession: 'All', type: 'Any', projectType: 'All', date: 'All Time' }}
      />

      {/* Application Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Application Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color={colors.textMainLight} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {selectedApp?.auditions?.title && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Applied For:</Text>
                  <Text style={styles.modalText}>{selectedApp.auditions.title}</Text>
                  <TouchableOpacity 
                    style={styles.viewAuditionBtn}
                    onPress={() => {
                      setModalVisible(false);
                      navigation.navigate('AuditionDetails', { auditionId: selectedApp?.auditions?.id || selectedApp.audition_id });
                    }}
                  >
                    <Icon name="open-outline" size={16} color={colors.primary} />
                    <Text style={styles.viewAuditionBtnText}> View Full Audition Details</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Cover Note:</Text>
                <Text style={styles.modalText}>
                  {selectedApp?.cover_note || 'No cover note provided.'}
                </Text>
              </View>

              {selectedApp?.selected_video && (
                <View style={styles.videoSection}>
                  <Text style={styles.modalLabel}>Submitted Video:</Text>
                  <TouchableOpacity 
                    style={styles.videoLinkBtn}
                    onPress={() => Linking.openURL(selectedApp.selected_video)}
                  >
                    <Icon name="play-circle-outline" size={20} color="#FFF" />
                    <Text style={styles.videoLinkText}> Watch Video</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.m,
    backgroundColor: colors.backgroundLight,
  },
  backButton: {
    marginRight: spacing.m,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textMainLight,
  },
  headerSubtitle: {
    ...typography.body2,
    color: colors.textMutedLight,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.backgroundLight,
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
    ...typography.caption,
    color: colors.textMutedLight,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.primary,
  },
  listContent: {
    padding: spacing.m,
  },
  card: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: spacing.l,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.backgroundLight,
  },
  backButton: {
    marginRight: spacing.m,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textMainLight,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: spacing.m,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  artistInfo: {
    flex: 1,
  },
  artistName: {
    ...typography.h3,
    color: colors.textMainLight,
  },
  appliedForText: {
    ...typography.caption,
    color: colors.textMutedLight,
    marginTop: 2,
  },
  appliedForTitle: {
    color: colors.primary,
    fontWeight: '600',
  },
  artistMeta: {
    ...typography.caption,
    color: colors.textMutedLight,
    marginTop: 2,
  },
  matchScore: {
    ...typography.caption,
    color: colors.success,
    fontWeight: 'bold',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  btnReject: {
    borderColor: colors.danger,
    marginRight: spacing.s,
  },
  btnRejectText: {
    color: colors.danger,
    fontWeight: '600',
  },
  btnShortlist: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    marginLeft: spacing.s,
  },
  btnShortlistText: {
    color: '#FFF',
    fontWeight: '600',
  },
  btnChat: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
    marginLeft: spacing.s,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  btnChatText: {
    color: '#FFF',
    fontWeight: '600',
  },
  btnHire: {
    backgroundColor: colors.success,
    borderColor: colors.success,
    marginLeft: spacing.s,
  },
  btnHireText: {
    color: '#FFF',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    marginTop: 40,
  },
  emptyText: {
    ...typography.body2,
    color: colors.textMutedLight,
    marginTop: spacing.m,
  },
  filterSection: {
    padding: spacing.m,
    backgroundColor: colors.surfaceLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationInputBtn: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    padding: spacing.m,
    justifyContent: 'center',
    marginRight: spacing.s,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  filterBtnText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  filterSectionTitle: {
    ...typography.h3,
    color: colors.textMainLight,
    marginTop: spacing.l,
    marginBottom: spacing.s,
    fontWeight: 'bold',
  },
  filterOptionsRow: {
    flexDirection: 'row',
    paddingBottom: spacing.s,
  },
  filterOptionChip: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    borderRadius: 20,
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginRight: spacing.m,
  },
  filterOptionChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterOptionText: {
    ...typography.caption,
    color: colors.textMutedLight,
    fontWeight: '600',
  },
  filterOptionTextActive: {
    color: '#FFF',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.l,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginTop: spacing.l,
    marginBottom: spacing.xxl,
  },
  clearFiltersBtn: {
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  clearFiltersText: {
    ...typography.body2,
    color: colors.textMutedLight,
    fontWeight: 'bold',
  },
  applyFiltersBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
  },
  applyFiltersText: {
    ...typography.body2,
    color: '#FFF',
    fontWeight: 'bold',
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.s,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
  },
  viewDetailsBtnText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.backgroundLight,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.textMainLight,
  },
  modalBody: {
    marginBottom: spacing.l,
  },
  modalSection: {
    marginBottom: spacing.m,
  },
  modalLabel: {
    ...typography.h3,
    color: colors.textMainLight,
    marginBottom: spacing.xs,
  },
  modalText: {
    ...typography.body,
    color: colors.textMutedLight,
    lineHeight: 22,
  },
  videoSection: {
    marginTop: spacing.m,
  },
  videoLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: spacing.m,
    borderRadius: 8,
    justifyContent: 'center',
  },
  videoLinkText: {
    color: '#FFF',
    fontWeight: '600',
    ...typography.body,
  },
  viewAuditionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.s,
    padding: spacing.s,
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  viewAuditionBtnText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  searchInput: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: spacing.l,
    paddingVertical: 12,
    ...typography.body1,
    color: colors.textMainLight,
    marginBottom: spacing.l,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalItemText: {
    ...typography.body1,
    color: colors.textMainLight,
  },
  modalItemTextSelected: {
    color: colors.primary,
    fontWeight: 'bold',
  }
});
