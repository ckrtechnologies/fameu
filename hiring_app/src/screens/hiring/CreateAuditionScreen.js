import { showError, showSuccess } from '../../utils/toast';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, Modal, FlatList, Animated, Easing, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import { Camera, Calendar, MonitorPlay, MapPin, Mic2, Clapperboard, Briefcase, Clock, User, Users, Globe, Building2, CheckSquare, Film, Star } from 'lucide-react-native';
import { AnimatedTileGrid } from '../../components/forms/AnimatedTileGrid';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import DocumentPicker from 'react-native-document-picker';

import { colors, typography, spacing, globalStyles } from '../../theme/theme';
import { useCreateAuditionMutation, useUpdateAuditionMutation, useUploadPdfMutation, useUploadThumbnailMutation } from '../../services/auditionApi';
import { useGetProfessionsQuery } from '../../services/profileApi';
export default function CreateAuditionScreen({ route }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const editAudition = route?.params?.audition;
  const isEditMode = !!editAudition;

  const [createAudition, { isLoading: isCreating }] = useCreateAuditionMutation();
  const [updateAudition, { isLoading: isUpdating }] = useUpdateAuditionMutation();
  const [uploadPdf, { isLoading: isUploadingPdf }] = useUploadPdfMutation();
  const [uploadThumbnail, { isLoading: isUploadingThumbnail }] = useUploadThumbnailMutation();
  const { data: professionsResponse } = useGetProfessionsQuery();
  const isLoading = isCreating || isUpdating || isUploadingPdf || isUploadingThumbnail;

  const [form, setForm] = useState({
    title: editAudition?.title || '',
    role_description: editAudition?.role_description || '',
    category: editAudition?.category ? editAudition.category.split(', ') : [],
    project_type: editAudition?.project_type ? editAudition.project_type.split(', ') : ['Audition'],
    city: editAudition?.city || 'Mumbai',
    duration_type: editAudition?.duration_type || 'Full-time',
    specific_start_date: editAudition?.specific_start_date || '',
    specific_end_date: editAudition?.specific_end_date || '',
    gender_req: editAudition?.gender_req || 'Any',
    budget: editAudition?.budget || '',
    age_min: editAudition?.age_min ? String(editAudition.age_min) : '18',
    age_max: editAudition?.age_max ? String(editAudition.age_max) : '35',
    description_pdf_url: editAudition?.description_pdf_url || null,
    thumbnail_url: editAudition?.thumbnail_url || null,
    audition_type: (editAudition?.audition_type === 'walkin' ? 'Walk-in' : 
                   editAudition?.audition_type === 'scheduled' ? 'Scheduled' : 
                   editAudition?.audition_type === 'online' ? 'Online' : 'Walk-in'),
    walk_in_venue: editAudition?.venue_address || '',
    walk_in_date: editAudition?.audition_date || '',
    walk_in_time: editAudition?.audition_time || '',
    latitude: editAudition?.lat ? String(editAudition.lat) : '19.0760',
    longitude: editAudition?.lng ? String(editAudition.lng) : '72.8777',
  });

  const dynamicCategories = (professionsResponse?.data || []).map(p => p.name);
  const CATEGORIES = dynamicCategories.length > 0 ? dynamicCategories : ['Actor', 'Model', 'Dancer', 'Singer', 'Musician', 'Comedian', 'Other'];
  const TYPES = ['Walk-in', 'Scheduled'];
  const PROJECT_TYPES = ['Audition', 'Casting call', 'Photo shoot', 'Shoot', 'Freelance project/assignment'];
  const CITIES = ['Mumbai', 'Delhi NCR', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Chandigarh', 'Other'];
  const DURATION_TYPES = ['Full-time', 'Part-time', 'Date Specific'];
  const GENDERS = ['Male', 'Female', 'Other', 'Any'];

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [showCityModal, setShowCityModal] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [activeDatePicker, setActiveDatePicker] = useState(null); // 'start' or 'end'
  
  const filteredCategories = CATEGORIES.filter(c => c.toLowerCase().includes(categorySearch.toLowerCase()));

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formatted = `${year}-${month}-${day}`;
      if (activeDatePicker === 'walk_in') {
        handleChange('walk_in_date', formatted);
      } else if (activeDatePicker === 'start') {
        handleChange('specific_start_date', formatted);
      } else if (activeDatePicker === 'end') {
        handleChange('specific_end_date', formatted);
      }
      setActiveDatePicker(null);
    }
  };

  const handleTimeChange = (event, selectedDate) => {
    setShowTimePicker(false);
    if (selectedDate) {
      let hours = selectedDate.getHours();
      let minutes = selectedDate.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? '0' + minutes : minutes;
      handleChange('walk_in_time', `${hours}:${minutes} ${ampm}`);
    }
  };

  const handlePdfUpload = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.pdf],
      });
      
      const formData = new FormData();
      formData.append('pdf', {
        uri: res.uri,
        type: res.type,
        name: res.name || 'description.pdf',
      });
      
      const uploadRes = await uploadPdf(formData).unwrap();
      if (uploadRes?.data?.url) {
        handleChange('description_pdf_url', uploadRes.data.url);
        showSuccess('', 'PDF uploaded successfully!');
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        showError('', 'Failed to upload PDF');
        console.error(err);
      }
    }
  };

  const handleThumbnailUpload = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.images],
      });
      
      const formData = new FormData();
      formData.append('thumbnail', {
        uri: res.uri,
        type: res.type,
        name: res.name || 'thumbnail.jpg',
      });
      
      const uploadRes = await uploadThumbnail(formData).unwrap();
      if (uploadRes?.data?.url) {
        handleChange('thumbnail_url', uploadRes.data.url);
        showSuccess('', 'Thumbnail uploaded successfully!');
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        showError('', 'Failed to upload Thumbnail');
        console.error(err);
      }
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.role_description) {
      showError('', 'Please provide a Title and Role Description.');
      return;
    }

    if (form.audition_type === 'Walk-in' || form.audition_type === 'Scheduled') {
      if (!form.walk_in_venue || !form.walk_in_date || !form.walk_in_time) {
        showError('', 'Please provide Venue, Date, and Time for the audition.');
        return;
      }
    }
    if (form.duration_type === 'Date Specific' && (!form.specific_start_date || !form.specific_end_date)) {
      showError('', 'Please provide both Start and End dates.');
      return;
    }

    try {
      const typeMap = {
        'Walk-in': 'walkin',
        'Scheduled': 'scheduled',
        'Online': 'online'
      };

      const today = new Date();
      const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const isLive = form.walk_in_date === todayString;
      
      let finalType = typeMap[form.audition_type] || form.audition_type;

      const payload = {
        title: form.title,
        role_description: form.role_description,
        category: form.category.join(', '),
        project_type: form.project_type.join(', '),
        city: form.city,
        duration_type: form.duration_type,
        specific_start_date: form.duration_type === 'Date Specific' ? form.specific_start_date : null,
        specific_end_date: form.duration_type === 'Date Specific' ? form.specific_end_date : null,
        gender_req: form.gender_req,
        budget: form.budget,
        age_min: parseInt(form.age_min) || 0,
        age_max: parseInt(form.age_max) || 75,
        description_pdf_url: form.description_pdf_url,
        thumbnail_url: form.thumbnail_url,
        audition_type: finalType,
      };

      if (form.audition_type === 'Walk-in' || form.audition_type === 'Scheduled') {
        payload.venue_address = form.walk_in_venue;
        payload.audition_date = form.walk_in_date;
        payload.date = form.walk_in_date;
        payload.audition_time = form.walk_in_time;
        payload.lat = parseFloat(form.latitude);
        payload.lng = parseFloat(form.longitude);
      }

      if (isEditMode) {
        await updateAudition({ id: editAudition.id, ...payload }).unwrap();
        showSuccess('', 'Audition updated successfully!');
        setTimeout(() => {
          navigation.navigate('Drawer', { screen: 'Tabs', params: { screen: 'MyAuditions' } });
        }, 1000);
      } else {
        await createAudition(payload).unwrap();
        showSuccess('', 'Audition created successfully!');
        setTimeout(() => {
          navigation.navigate('Drawer', { screen: 'Tabs', params: { screen: 'MyAuditions' } });
        }, 1000);
      }
    } catch (error) {
      showError('', error?.data?.error || (isEditMode ? 'Failed to update audition.' : 'Failed to post audition.'));
    }
  };



  return (
    <View style={globalStyles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textMainLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditMode ? 'Edit Audition' : 'Post New Audition'}</Text>
      </View>

      <KeyboardAwareScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Audition Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Lead Actor for Feature Film"
            placeholderTextColor={colors.textMutedLight}
            value={form.title}
            onChangeText={(text) => handleChange('title', text)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Category *</Text>
          <TouchableOpacity 
            style={[styles.input, { justifyContent: 'center' }]} 
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={{ color: form.category.length > 0 ? colors.textMainLight : colors.textMutedLight }}>
              {form.category.length > 0 ? form.category.join(', ') : "Select Category"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Project Type *</Text>
          <AnimatedTileGrid 
            options={PROJECT_TYPES} 
            selectedValue={form.project_type} 
            onSelect={(val) => handleChange('project_type', val)} 
            isMulti
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Duration Type *</Text>
          <AnimatedTileGrid 
            options={DURATION_TYPES} 
            selectedValue={form.duration_type} 
            onSelect={(val) => handleChange('duration_type', val)} 
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>City *</Text>
          <TouchableOpacity 
            style={[styles.input, { justifyContent: 'center' }]} 
            onPress={() => setShowCityModal(true)}
          >
            <Text style={{ color: form.city ? colors.textMainLight : colors.textMutedLight }}>
              {form.city || "Select City"}
            </Text>
          </TouchableOpacity>
        </View>

        {form.duration_type === 'Date Specific' && (
          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: spacing.s }]}>
              <Text style={styles.label}>Start Date *</Text>
              <TouchableOpacity style={[styles.input, { justifyContent: 'center' }]} onPress={() => { setActiveDatePicker('start'); setShowDatePicker(true); }}>
                <Text style={{ color: form.specific_start_date ? colors.textMainLight : colors.textMutedLight }}>{form.specific_start_date || 'YYYY-MM-DD'}</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.formGroup, { flex: 1, marginLeft: spacing.s }]}>
              <Text style={styles.label}>End Date *</Text>
              <TouchableOpacity style={[styles.input, { justifyContent: 'center' }]} onPress={() => { setActiveDatePicker('end'); setShowDatePicker(true); }}>
                <Text style={{ color: form.specific_end_date ? colors.textMainLight : colors.textMutedLight }}>{form.specific_end_date || 'YYYY-MM-DD'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Role & Requirements *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the character, look, and skills required..."
            placeholderTextColor={colors.textMutedLight}
            value={form.role_description}
            onChangeText={(text) => handleChange('role_description', text)}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Detailed Description PDF (Optional)</Text>
          <TouchableOpacity style={[styles.input, { justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }]} onPress={handlePdfUpload}>
            <Icon name="document-attach-outline" size={20} color={colors.textMainLight} style={{ marginRight: spacing.s }} />
            <Text style={{ color: form.description_pdf_url ? colors.primary : colors.textMutedLight }}>
              {form.description_pdf_url ? "PDF Uploaded" : "Upload PDF"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Post Thumbnail (Optional)</Text>
          <TouchableOpacity style={[styles.input, { justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }]} onPress={handleThumbnailUpload}>
            <Icon name="image-outline" size={20} color={colors.textMainLight} style={{ marginRight: spacing.s }} />
            <Text style={{ color: form.thumbnail_url ? colors.primary : colors.textMutedLight }}>
              {form.thumbnail_url ? "Thumbnail Uploaded" : "Upload Thumbnail"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Gender Requirement *</Text>
          <AnimatedTileGrid 
            options={GENDERS} 
            selectedValue={form.gender_req} 
            onSelect={(val) => handleChange('gender_req', val)} 
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: spacing.s }]}>
            <Text style={styles.label}>Age Min</Text>
            <TextInput
              style={styles.input}
              placeholder="18"
              placeholderTextColor={colors.textMutedLight}
              value={form.age_min}
              onChangeText={(text) => handleChange('age_min', text)}
              keyboardType="number-pad"
            />
          </View>
          <View style={[styles.formGroup, { flex: 1, marginLeft: spacing.s }]}>
            <Text style={styles.label}>Age Max</Text>
            <TextInput
              style={styles.input}
              placeholder="35"
              placeholderTextColor={colors.textMutedLight}
              value={form.age_max}
              onChangeText={(text) => handleChange('age_max', text)}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Budget/Compensation *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Paid (₹5000/day) or Unpaid"
            placeholderTextColor={colors.textMutedLight}
            value={form.budget}
            onChangeText={(text) => handleChange('budget', text)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Audition Type *</Text>
          <AnimatedTileGrid 
            options={TYPES} 
            selectedValue={form.audition_type} 
            onSelect={(val) => handleChange('audition_type', val)} 
          />
        </View>

        {(form.audition_type === 'Walk-in' || form.audition_type === 'Scheduled') && (
          <View style={styles.walkInCard}>
            <View style={styles.walkInHeader}>
              <Icon name="location" size={20} color={colors.primary} />
              <Text style={styles.walkInTitle}>Walk-in Details</Text>
            </View>

            <Text style={styles.label}>Venue Address</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Studio 5, Andheri West, Mumbai"
              placeholderTextColor={colors.textMutedLight}
              value={form.walk_in_venue}
              onChangeText={(text) => handleChange('walk_in_venue', text)}
            />

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: spacing.s, marginTop: spacing.m }]}>
                <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
                <TouchableOpacity 
                  style={[styles.input, { justifyContent: 'center' }]} 
                  onPress={() => { setActiveDatePicker('walk_in'); setShowDatePicker(true); }}
                >
                  <Text style={{ color: form.walk_in_date ? colors.textMainLight : colors.textMutedLight }}>
                    {form.walk_in_date || "Select Date"}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={form.walk_in_date ? new Date(form.walk_in_date) : new Date()}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                  />
                )}
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: spacing.s, marginTop: spacing.m }]}>
                <Text style={styles.label}>Time</Text>
                <TouchableOpacity 
                  style={[styles.input, { justifyContent: 'center' }]} 
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={{ color: form.walk_in_time ? colors.textMainLight : colors.textMutedLight }}>
                    {form.walk_in_time || "Select Time"}
                  </Text>
                </TouchableOpacity>
                {showTimePicker && (
                  <DateTimePicker
                    value={new Date()}
                    mode="time"
                    display="default"
                    onChange={handleTimeChange}
                  />
                )}
              </View>
            </View>
          </View>
        )}

      </KeyboardAwareScrollView>

      <View style={[styles.footer, { paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom + 24, 40) : Math.max(insets.bottom + 12, spacing.xl) }]}>
        <TouchableOpacity 
          style={globalStyles.primaryButton} 
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={globalStyles.primaryButtonText}>{isEditMode ? 'Save Changes' : 'Post Audition'}</Text>
          )}
        </TouchableOpacity>
      </View>
      <Modal visible={showCategoryModal} animationType="slide" transparent={true} onRequestClose={() => setShowCategoryModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Icon name="close" size={24} color={colors.textMainLight} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search categories..."
              placeholderTextColor={colors.textMutedLight}
              value={categorySearch}
              onChangeText={setCategorySearch}
            />
            <FlatList
              data={filteredCategories}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const isSelected = form.category.includes(item);
                return (
                <TouchableOpacity 
                  style={styles.modalItem} 
                  onPress={() => {
                    if (isSelected) {
                      handleChange('category', form.category.filter(c => c !== item));
                    } else {
                      handleChange('category', [...form.category, item]);
                    }
                  }}
                >
                  <Text style={[styles.modalItemText, isSelected && styles.modalItemTextSelected]}>
                    {item}
                  </Text>
                  {isSelected && <Icon name="checkmark" size={24} color={colors.primary} />}
                </TouchableOpacity>
              )}}
            />
          </View>
        </View>
      </Modal>

      {/* City Modal */}
      <Modal visible={showCityModal} animationType="slide" transparent={true} onRequestClose={() => setShowCityModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select City</Text>
              <TouchableOpacity onPress={() => setShowCityModal(false)}>
                <Icon name="close" size={24} color={colors.textMainLight} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search city..."
              placeholderTextColor={colors.textMutedLight}
              value={citySearch}
              onChangeText={setCitySearch}
            />
            <FlatList
              data={CITIES.filter(c => c.toLowerCase().includes(citySearch.toLowerCase()))}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const isSelected = form.city === item;
                return (
                <TouchableOpacity 
                  style={styles.modalItem} 
                  onPress={() => {
                    handleChange('city', item);
                    setShowCityModal(false);
                  }}
                >
                  <Text style={[styles.modalItemText, isSelected && styles.modalItemTextSelected]}>
                    {item}
                  </Text>
                  {isSelected && <Icon name="checkmark" size={24} color={colors.primary} />}
                </TouchableOpacity>
              )}}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
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
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.body1,
    color: colors.textMainLight,
    fontWeight: '600',
    marginBottom: spacing.s,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: spacing.l,
    paddingVertical: 14,
    ...typography.body1,
    color: colors.textMainLight,
  },
  textArea: {
    minHeight: 120,
  },
  chipsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginRight: spacing.m,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.body2,
    color: colors.textMutedLight,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#FFF',
  },
  tileGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 12,
  },
  tileItem: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 90,
  },
  tileText: {
    ...typography.body2,
    color: colors.textMutedLight,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  tileTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  walkInCard: {
    backgroundColor: colors.primary + '10', // Light primary bg
    padding: spacing.xl,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  walkInHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  walkInTitle: {
    ...typography.h3,
    color: colors.primary,
    marginLeft: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footer: {
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.backgroundLight,
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
    height: '70%',
    padding: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textMainLight,
  },
  searchInput: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    padding: spacing.m,
    marginBottom: spacing.m,
    color: colors.textMainLight,
    ...typography.body,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalItemText: {
    ...typography.body,
    color: colors.textMainLight,
  },
  modalItemTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  }
});
