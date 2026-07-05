import { showError, showSuccess } from '../../utils/toast';
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, Alert, TextInput, ScrollView, Modal, Linking , RefreshControl } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import { colors, typography, spacing, globalStyles } from '../../theme/theme';
import { useGetApplicantsQuery, useUpdateApplicationStatusMutation } from '../../services/auditionApi';
import { useStartConversationMutation } from '../../services/chatApi';
export default function ApplicantTrackingScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { auditionId, auditionTitle } = route.params;

  const { data: applicantsResponse, isLoading, refetch , isFetching} = useGetApplicantsQuery(auditionId)
  const [updateStatus, { isLoading: isUpdating }] = useUpdateApplicationStatusMutation();
  const [startConversation, { isLoading: isStartingChat }] = useStartConversationMutation();

  const [activeTab, setActiveTab] = useState('pending');
  const [filterGender, setFilterGender] = useState('All');
  const [filterLocation, setFilterLocation] = useState('');
  
  const [selectedApp, setSelectedApp] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const tabs = ['pending', 'shortlisted', 'rejected', 'hired'];
  const genders = ['All', 'Male', 'Female'];

  const applicants = applicantsResponse?.data || [];
  
  const filteredApplicants = applicants.filter(app => {
    if (app.status !== activeTab) return false;
    
    const artist = app.artist_profiles || {};
    if (filterGender !== 'All' && artist.gender !== filterGender) return false;
    if (filterLocation && artist.city) {
      if (!artist.city.toLowerCase().includes(filterLocation.toLowerCase())) return false;
    }
    return true;
  });

  const handleUpdateStatus = async (applicationId, newStatus) => {
    try {
      await updateStatus({ applicationId, status: newStatus }).unwrap();
      showSuccess('', `Applicant moved to ${newStatus}`);
    } catch (error) {
      showError('', error?.data?.error || 'Failed to update status');
    }
  };

  const handleStartChat = async (artistUserId, artistName) => {
    try {
      const response = await startConversation({ 
        targetUserId: artistUserId, 
        auditionId: auditionId 
      }).unwrap();
      
      // Navigate to chat screen
      navigation.navigate('ChatScreen', {
        conversationId: response.data.id,
        otherUserName: artistName,
        auditionId: auditionId
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
                onPress={() => handleStartChat(item.artist_profiles?.user_id || item.artist_id, name)}
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
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textMainLight} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Applicant Tracking</Text>
          <Text style={styles.headerSubtitle}>{auditionTitle}</Text>
        </View>
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {genders.map(gender => (
            <TouchableOpacity 
              key={gender} 
              style={[styles.filterChip, filterGender === gender && styles.filterChipActive]}
              onPress={() => setFilterGender(gender)}
            >
              <Text style={[styles.filterChipText, filterGender === gender && styles.filterChipTextActive]}>
                {gender}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TextInput
          style={styles.locationInput}
          placeholder="Filter by city..."
          placeholderTextColor={colors.textMutedLight}
          value={filterLocation}
          onChangeText={setFilterLocation}
        />
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
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Applied For:</Text>
                <Text style={styles.modalText}>{auditionTitle}</Text>
                <TouchableOpacity 
                  style={styles.viewAuditionBtn}
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate('AuditionDetails', { id: auditionId });
                  }}
                >
                  <Icon name="open-outline" size={16} color={colors.primary} />
                  <Text style={styles.viewAuditionBtnText}> View Full Audition Details</Text>
                </TouchableOpacity>
              </View>

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
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
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
  filterRow: {
    flexDirection: 'row',
    marginBottom: spacing.m,
  },
  filterChip: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    borderRadius: 20,
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginRight: spacing.m,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...typography.caption,
    color: colors.textMutedLight,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  locationInput: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    padding: spacing.m,
    color: colors.textMainLight,
    ...typography.body2,
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
  }
});
