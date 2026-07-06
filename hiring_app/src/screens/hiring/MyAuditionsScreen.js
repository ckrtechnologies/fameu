import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView, TextInput, Modal, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { format } from 'date-fns';

import { colors, typography, spacing, globalStyles } from '../../theme/theme';
import { useGetMyAuditionsQuery } from '../../services/auditionApi';
import { useGetCompanyProfileQuery } from '../../services/hiringApi';
import { useGetProfessionsQuery } from '../../services/profileApi';
import CustomButton from '../../components/forms/CustomButton';
import AnimatedTileGrid from '../../components/forms/AnimatedTileGrid';
import { getAuditionLiveStatus } from '../../utils/dateUtils';

import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyAuditionsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { data: auditionsResponse, isLoading, isFetching, refetch } = useGetMyAuditionsQuery();
  const { data: profileResponse } = useGetCompanyProfileQuery();
  const { data: professionsResponse } = useGetProfessionsQuery();
  
  const statuses = ['All', 'Active', 'Closed'];
  const [filterCategory, setFilterCategory] = React.useState('All');
  const [filterStatus, setFilterStatus] = React.useState(statuses.includes(route.params?.initialStatus) ? route.params.initialStatus : 'All');
  const [filterGender, setFilterGender] = React.useState('All');
  const [filterProjectType, setFilterProjectType] = React.useState('All');
  const [filterCity, setFilterCity] = React.useState('All');
  const [filterAuditionType, setFilterAuditionType] = React.useState('All');

  React.useEffect(() => {
    if (route.params?.initialStatus && statuses.includes(route.params.initialStatus)) {
      setFilterStatus(route.params.initialStatus);
    }
  }, [route.params?.initialStatus]);
  const [showFilterModal, setShowFilterModal] = React.useState(false);

  const auditions = auditionsResponse?.data || [];
  
  // Apply filtering
  const filteredAuditions = auditions.filter(item => {
    const matchCategory = filterCategory === 'All' || item.category === filterCategory;
    const matchStatus = filterStatus === 'All' 
      ? true 
      : filterStatus === 'Active' ? item.status === 'active' : item.status !== 'active';
    
    let instructions = {};
    try {
      if (item.instructions) instructions = JSON.parse(item.instructions);
    } catch (e) {}
    
    const matchGender = filterGender === 'All' || (instructions.gender_req === filterGender);
    const matchProject = filterProjectType === 'All' || (instructions.project_type && instructions.project_type.includes(filterProjectType));
    const matchCity = filterCity === 'All' || (instructions.city === filterCity);
    const matchAuditionType = filterAuditionType === 'All' || (item.audition_type === filterAuditionType || (item.audition_type === 'live' && filterAuditionType === 'Walk-in')); // naive map

    return matchCategory && matchStatus && matchGender && matchProject && matchCity && matchAuditionType;
  });

  const dynamicCategories = (professionsResponse?.data || []).map(p => p.name);
  const categories = ['All', ...(dynamicCategories.length > 0 ? dynamicCategories : ['Actor', 'Model', 'Singer', 'Dancer', 'Technician'])];
  const isVerified = profileResponse?.data?.is_verified;

  const renderAuditionCard = ({ item }) => {
    const liveStatus = item.status === 'active' ? getAuditionLiveStatus(item) : null;
    return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {liveStatus ? (
            <View style={[styles.statusBadge, { backgroundColor: liveStatus.color }]}>
              <Text style={[styles.statusText, { color: '#FFF' }]}>{liveStatus.text}</Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, item.status === 'active' ? styles.statusActive : styles.statusClosed]}>
              <Text style={[styles.statusText, item.status === 'active' ? styles.statusActiveText : styles.statusClosedText]}>
                {item.status === 'active' ? 'Active' : 'Closed'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {item.thumbnail_url && (
        <Image source={{ uri: item.thumbnail_url }} style={{ width: '100%', height: 160, borderRadius: 8, marginBottom: 10 }} />
      )}

      <Text style={styles.cardRole}>{item.role_description}</Text>

      <View style={styles.cardFooter}>
        <View style={styles.cardMetaContainer}>
          <View style={styles.cardMeta}>
            <Icon name="people-outline" size={16} color={colors.textMutedLight} />
            <Text style={styles.cardMetaText}>{item.applicant_count || 0} Applicants</Text>
          </View>
          
          <View style={styles.cardMeta}>
            <Icon name="calendar-outline" size={16} color={colors.textMutedLight} />
            <Text style={styles.cardMetaText}>{format(new Date(item.created_at), 'MMM dd, yyyy')}</Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <CustomButton 
            title="View Details" 
            variant="secondary" 
            onPress={() => navigation.navigate('AuditionDetails', { auditionId: item.id })} 
            style={styles.cardButton} 
          />
          <CustomButton 
            title="View Applicants" 
            variant="primary" 
            onPress={() => navigation.navigate('ApplicantTracking', { auditionId: item.id, auditionTitle: item.title })} 
            style={[styles.cardButton, styles.marginLeft]} 
          />
        </View>
      </View>
    </View>
  )};

  if (isLoading) {
    return (
      <View style={[globalStyles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container} edges={['bottom', 'left', 'right']}>
      
      {/* Filter Section */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {statuses.map(status => (
            <TouchableOpacity 
              key={status} 
              style={[styles.filterChip, filterStatus === status && styles.filterChipActive]}
              onPress={() => setFilterStatus(status)}
            >
              <Text style={[styles.filterChipText, filterStatus === status && styles.filterChipTextActive]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity 
          style={[styles.filterChip, {flexDirection: 'row', alignItems: 'center'}]}
          onPress={() => setShowFilterModal(true)}
        >
          <Icon name="options-outline" size={16} color={colors.textMainLight} style={{marginRight: 4}} />
          <Text style={styles.filterChipText}>Advanced Filters</Text>
        </TouchableOpacity>

      {/* Filter Modal */}
      <Modal visible={showFilterModal} animationType="slide" transparent={true} onRequestClose={() => setShowFilterModal(false)}>
        <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end'}}>
          <View style={{backgroundColor: colors.backgroundLight, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%'}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.xl, borderBottomWidth: 1, borderColor: colors.borderLight}}>
              <Text style={{...typography.h2, fontWeight: 'bold', color: colors.textMainLight}}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Icon name="close" size={24} color={colors.textMainLight} />
              </TouchableOpacity>
            </View>
          <ScrollView style={{padding: spacing.xl}} showsVerticalScrollIndicator={false}>
            
            <Text style={styles.filterSectionTitle}>Category</Text>
            <View style={{flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20}}>
              {categories.map(cat => (
                <TouchableOpacity key={cat} style={[styles.filterChip, filterCategory === cat && styles.filterChipActive]} onPress={() => setFilterCategory(cat)}>
                  <Text style={[styles.filterChipText, filterCategory === cat && styles.filterChipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterSectionTitle}>Gender</Text>
            <View style={{flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20}}>
              {['All', ...["Male","Female","Other","Any"]].map(g => (
                <TouchableOpacity key={g} style={[styles.filterChip, filterGender === g && styles.filterChipActive]} onPress={() => setFilterGender(g)}>
                  <Text style={[styles.filterChipText, filterGender === g && styles.filterChipTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterSectionTitle}>Project Type</Text>
            <View style={{flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20}}>
              {['All', ...["Audition","Casting call","Photo shoot","Shoot","Freelance project/assignment"]].map(pt => (
                <TouchableOpacity key={pt} style={[styles.filterChip, filterProjectType === pt && styles.filterChipActive]} onPress={() => setFilterProjectType(pt)}>
                  <Text style={[styles.filterChipText, filterProjectType === pt && styles.filterChipTextActive]}>{pt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterSectionTitle}>City</Text>
            <View style={{flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20}}>
              {['All', ...["Mumbai","Delhi NCR","Bangalore","Hyderabad","Chennai","Kolkata","Pune","Ahmedabad","Chandigarh","Other"]].map(c => (
                <TouchableOpacity key={c} style={[styles.filterChip, filterCity === c && styles.filterChipActive]} onPress={() => setFilterCity(c)}>
                  <Text style={[styles.filterChipText, filterCity === c && styles.filterChipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
            <View style={{padding: spacing.xl, paddingBottom: 40, borderTopWidth: 1, borderColor: colors.borderLight, flexDirection: 'row', justifyContent: 'space-between'}}>
              <CustomButton title="Clear All" variant="outline" onPress={() => { setFilterCategory('All'); setFilterGender('All'); setFilterProjectType('All'); setFilterCity('All'); setFilterAuditionType('All'); }} style={{flex: 1, marginRight: 10}} />
              <CustomButton title="Apply Filters" variant="primary" onPress={() => setShowFilterModal(false)} style={{flex: 1}} />
            </View>
          </View>
        </View>
      </Modal>
      </View>



      <FlatList
        data={filteredAuditions}
        keyExtractor={(item) => item.id}
        renderItem={renderAuditionCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={colors.primary} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="videocam-off-outline" size={48} color={colors.borderLight} />
            <Text style={styles.emptyTitle}>No Auditions Yet</Text>
            <Text style={styles.emptyText}>You haven't posted any auditions. Click the + button to create your first casting call.</Text>
          </View>
        )}
      />

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => isVerified ? navigation.navigate('CreateAudition') : navigation.navigate('VerificationRequired')}
      >
        <Icon name="add" size={32} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.m,
    paddingBottom: 100, // Leave space for FAB
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.s,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.textMainLight,
    flex: 1,
    marginRight: spacing.s,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: colors.success + '20',
  },
  statusClosed: {
    backgroundColor: colors.textMutedLight + '20',
  },
  statusText: {
    ...typography.caption,
    fontWeight: 'bold',
  },
  statusActiveText: {
    color: colors.success,
  },
  statusClosedText: {
    color: colors.textMutedLight,
  },
  cardRole: {
    ...typography.body2,
    color: colors.textMutedLight,
    marginBottom: spacing.l,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.m,
  },
  cardMetaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardMetaText: {
    ...typography.caption,
    color: colors.textMutedLight,
    marginLeft: 4,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cardButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    minHeight: 36,
  },
  marginLeft: {
    marginLeft: spacing.m,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    marginTop: 60,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textMainLight,
    marginTop: spacing.m,
    marginBottom: spacing.s,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMutedLight,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  filterSectionTitle: {
    ...typography.h3,
    fontWeight: 'bold',
    color: colors.textMainLight,
    marginBottom: spacing.m,
  },
  filterSection: {
    padding: spacing.m,
    backgroundColor: colors.surfaceLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: spacing.s,
  },
  filterChip: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginRight: spacing.s,
    marginBottom: spacing.s,
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
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: colors.warning + '15',
    margin: spacing.m,
    padding: spacing.m,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  warningTextContainer: {
    marginLeft: spacing.m,
    flex: 1,
  },
  warningTitle: {
    ...typography.body1,
    color: colors.textMainLight,
    fontWeight: 'bold',
  },
  warningText: {
    ...typography.caption,
    color: colors.textMutedLight,
    marginTop: 2,
    marginBottom: spacing.s,
  },
  warningButton: {
    alignSelf: 'flex-start',
  },
  warningButtonText: {
    ...typography.body2,
    color: colors.warning,
    fontWeight: 'bold',
  }
});
