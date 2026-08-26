import { GlobalAlert } from '../../components/core/GlobalAlert';
import { showError, showSuccess } from '../../utils/toast';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, PermissionsAndroid, Platform, RefreshControl, Modal, ScrollView, Switch, Dimensions } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import DocumentPicker from '@react-native-documents/picker';
import Video from 'react-native-video';
import { useTheme } from '../../theme/ThemeProvider';
import { typography } from '../../theme/theme';
import { useGetProfileQuery, useUpsertProfileMutation, useUpdateCategoryMutation, useUploadMediaMutation, useLazyCheckUsernameQuery, useGetProfessionsQuery, useUploadGenericFileMutation } from '../../services/profileApi';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import TagInput from '../../components/core/TagInput';
import BottomSheetSelect from '../../components/core/BottomSheetSelect';
import ValidatedURLInput from '../../components/core/ValidatedURLInput';
import MediaOrLinkInput from '../../components/core/MediaOrLinkInput';
import DateRangePicker from '../../components/core/DateRangePicker';
import { parseArray } from '../../utils/dataUtils';
import CustomButton from '../../components/forms/CustomButton';
import { INDIAN_CITIES } from '../../constants/cities';
import { useSelector } from 'react-redux';
import { uploadFileWithProgress } from '../../utils/uploadUtils';
import ProgressBar from '../../components/core/ProgressBar';
import { ProfessionCategoryIcon } from '../../components/icons';
import ShrinkableHeader from '../../components/core/ShrinkableHeader';
import useShrinkableHeader from '../../hooks/useShrinkableHeader';

const AVAILABLE_LANGUAGES = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Bengali', 'Punjabi', 'Gujarati', 'Odia', 'Bhojpuri', 'Urdu', 'Assamese'];

const HEIGHT_OPTIONS = Array.from({ length: 37 }, (_, i) => {
  const totalInches = 48 + i; // Start from 4' 0"
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  const cm = Math.round(totalInches * 2.54);
  return `${feet}' ${inches}" (${cm} cm)`;
});

export default function EditProfileScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const route = useRoute();
  const { data: profileResponse, isLoading: isFetching, refetch } = useGetProfileQuery()
  const [upsertProfile, { isLoading: isSaving }] = useUpsertProfileMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [checkUsername, { isFetching: isCheckingUsername }] = useLazyCheckUsernameQuery();
  
  const token = useSelector(state => state.auth.token);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { data: professionsResponse, isLoading: isLoadingProfessions } = useGetProfessionsQuery();
  const professionsList = professionsResponse?.data || [];

  const [activeTab, setActiveTab] = useState('Basic Info');

  const [showTalentModal, setShowTalentModal] = useState(false);

  const handleImageUpload = async (res) => {

    if (res.didCancel) return;
    if (res.errorMessage) {
      GlobalAlert.show('Camera Error', res.errorMessage);
      return;
    }
    if (!res.assets?.length) return;

    const formData = new FormData();
    formData.append('replaceAvatar', 'true');
    formData.append('photos', {
      uri: res.assets[0].uri,
      type: res.assets[0].type || 'image/jpeg',
      name: res.assets[0].fileName || `avatar_${Date.now()}.jpg`,
    });

    setIsUploadingMedia(true);
    setUploadProgress(0);
    try {
      await uploadFileWithProgress('/artist_app/profile/upload', formData, (progress) => {
        setUploadProgress(progress);
      }, token);
      showSuccess('', 'Profile photo updated!');
      refetch();
    } catch (error) {
      console.error('Upload photo error:', error);
      const errMsg = error?.message || 'Failed to upload photo';
      showError('', typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    city: '',
    bio: '',
    experience: '',
    languages: [],
    username: '',
    is_cintaa_member: false,
    cintaa_reg_number: '',
    preferred_cities: [],
    availability_type: '',
    work_preference: [],
    available_dates: '',
    look_alike: [],
    hashtags: [],
    intro_video_url: '',
    left_profile_url: '',
    right_profile_url: '',
    alt_number: '',
    recent_assignments: [],
    social_links: {
      facebook: '',
      instagram: '',
      youtube: '',
      snapchat: ''
    }
  });

  const [uploadingField, setUploadingField] = useState(null);

  const handleMediaFieldSelect = async (fieldKey, asset) => {
    setUploadingField(fieldKey);
    const mFormData = new FormData();
    mFormData.append('file', {
      uri: asset.uri,
      type: asset.type || 'video/mp4',
      name: asset.fileName || `media_${Date.now()}`
    });

    setUploadProgress(0);
    try {
      const res = await uploadFileWithProgress('/artist_app/profile/upload-file', mFormData, (progress) => {
        setUploadProgress(progress);
      }, token);
      
      const fileUrl = res.data?.url || res.url;
      if (fileUrl) {
        setFormData(p => ({ ...p, [fieldKey]: fileUrl }));
        showSuccess('', 'File uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload media error:', error);
      showError('', 'Failed to upload media file');
    } finally {
      setUploadingField(null);
    }
  };


  const [categoryFormData, setCategoryFormData] = useState({});
  const [genderModalVisible, setGenderModalVisible] = useState(false);

  const categoriesFromApi = profileResponse?.data?.categories || [];
  const [categories, setCategories] = useState([]);
  const tabs = ['Basic Info', 'Advanced Info', ...categories];

  const isInitialized = React.useRef(false);

  useEffect(() => {
    const passedCategories = route.params?.categories || route.params?.updatedCategories;
    if (passedCategories) {
      setCategories(passedCategories);

      setCategoryFormData(prev => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach(cat => {
          if (!passedCategories.includes(cat)) {
            delete next[cat];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }
  }, [route.params?.categories, route.params?.updatedCategories]);

  useEffect(() => {
    if (profileResponse?.data && !isInitialized.current) {
      const passedCategories = route.params?.categories || route.params?.updatedCategories;
      if (passedCategories) {
        setCategories(passedCategories);
      } else {
        setCategories(profileResponse.data.categories || []);
      }
      isInitialized.current = true;

      const p = profileResponse.data;
      setFormData({
        full_name: p.full_name || '',
        age: p.age ? String(p.age) : '',
        gender: p.gender || '',
        height: p.height || '',
        weight: p.weight || '',
        city: p.city || '',
        bio: p.bio || '',
        experience: p.experience || '',
        languages: parseArray(p.languages).filter(l => AVAILABLE_LANGUAGES.includes(l)),
        username: p.users?.username || '',
        is_cintaa_member: p.is_cintaa_member || false,
        cintaa_reg_number: p.cintaa_reg_number || '',
        preferred_cities: parseArray(p.preferred_cities),
        availability_type: p.availability_type || '',
        work_preference: (() => {
          const wp = parseArray(p.work_preference);
          const cities = parseArray(p.preferred_cities);
          if (cities.length > 0 && !wp.includes('Specific Cities')) {
            return [...wp, 'Specific Cities'];
          }
          return wp;
        })(),
        available_dates: p.available_dates || '',
        look_alike: parseArray(p.look_alike),
        hashtags: parseArray(p.hashtags),
        intro_video_url: p.intro_video_url || '',
        left_profile_url: p.left_profile_url || '',
        right_profile_url: p.right_profile_url || '',
        alt_number: p.alt_number || p.alternate_phone || '',
        recent_assignments: p.recent_assignments || [],
        social_links: (typeof p.social_links === 'string' ? JSON.parse(p.social_links || '{}') : p.social_links) || {
          facebook: '',
          instagram: '',
          youtube: '',
          snapchat: ''
        },
      });

      if (p.category_details) {
        const catData = {};
        (p.categories || []).forEach(cat => {
          const details = p.category_details[cat] || p.category_details[cat.toLowerCase()];
          if (details) {
            catData[cat] = { ...details };
          }
        });
        setCategoryFormData(catData);
      }
    }
  }, [profileResponse, route.params?.categories, route.params?.updatedCategories]);

  const handleVerifyUsername = async () => {
    if (!formData.username) return showError('', 'Please enter a username to verify.');
    try {
      const response = await checkUsername(formData.username).unwrap();
      if (response.data.available) {
        showSuccess('', 'This username is available!');
      } else {
        showError('', 'This username is already taken. Please choose another one.');
      }
    } catch (err) {
      showError('', err?.data?.error || 'Failed to check username.');
    }
  };

  const handleTextChange = (category, key, text) => {
    setCategoryFormData(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] || {}),
        [key]: text
      }
    }));
  };

  const handleSelectToggle = (category, key, option, isMulti) => {
    setCategoryFormData(prev => {
      const currentVal = prev[category]?.[key] || [];
      let newVal = [];
      if (isMulti) {
        if (currentVal.includes(option)) newVal = currentVal.filter(item => item !== option);
        else newVal = [...currentVal, option];
      } else {
        newVal = [option];
      }
      return {
        ...prev,
        [category]: {
          ...(prev[category] || {}),
          [key]: newVal
        }
      };
    });
  };

  const handleDeleteFile = (category, key, fileUrlToRemove) => {
    setCategoryFormData(prev => {
      const currentVal = prev[category]?.[key];
      if (Array.isArray(currentVal)) {
        return {
          ...prev,
          [category]: {
            ...(prev[category] || {}),
            [key]: currentVal.filter(url => url !== fileUrlToRemove)
          }
        };
      }
      return {
        ...prev,
        [category]: {
          ...(prev[category] || {}),
          [key]: null
        }
      };
    });
  };

  const handleFileUpload = async (category, key) => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
      });

      const formData = new FormData();
      formData.append('file', {
        uri: res.uri,
        type: res.type,
        name: res.name || `file_${Date.now()}`,
      });

      setIsUploadingFile(true);
      setUploadProgress(0);
      try {
        const response = await uploadFileWithProgress('/artist_app/profile/upload-file', formData, (progress) => {
          setUploadProgress(progress);
        }, token);

        const fileUrl = response.data?.url || response.url;
        if (fileUrl) {
          setCategoryFormData(prev => {
            const existing = prev[category]?.[key];
            let newVal;
            if (Array.isArray(existing)) {
              newVal = [...existing, fileUrl];
            } else if (typeof existing === 'string' && existing !== '') {
              newVal = [existing, fileUrl];
            } else {
              newVal = [fileUrl];
            }
            return {
              ...prev,
              [category]: {
                ...(prev[category] || {}),
                [key]: newVal
              }
            };
          });
          showSuccess('', 'File uploaded successfully!');
        }
      } catch (uploadErr) {
        showError('', uploadErr?.message || 'Upload failed');
      } finally {
        setIsUploadingFile(false);
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        return;
      }
      showError('', err?.message || 'Failed to pick file');
    }
  };

  const addAssignment = () => {
    setFormData(p => ({ ...p, recent_assignments: [...(p.recent_assignments || []), { title: '', role: '', year: '' }] }));
  };

  const updateAssignment = (index, key, value) => {
    setFormData(p => {
      const newAssignments = [...(p.recent_assignments || [])];
      newAssignments[index] = { ...newAssignments[index], [key]: value };
      return { ...p, recent_assignments: newAssignments };
    });
  };

  const removeAssignment = (index) => {
    setFormData(p => ({
      ...p,
      recent_assignments: p.recent_assignments.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      if (!formData.full_name || !formData.full_name.trim()) {
        GlobalAlert.show('Validation Error', 'Full Name is required.');
        return;
      }
      if (!formData.username || !formData.username.trim()) {
        GlobalAlert.show('Validation Error', 'Username (Handle) is required.');
        return;
      }
      if (!formData.age || !String(formData.age).trim()) {
        GlobalAlert.show('Validation Error', 'Age is required.');
        return;
      }
      if (!formData.gender || !formData.gender.trim()) {
        GlobalAlert.show('Validation Error', 'Gender is required.');
        return;
      }


      let hasInvalidUrls = false;
      categories.forEach(cat => {
        const currentProf = professionsList.find(p => p.name === cat);
        if (currentProf && currentProf.profession_fields) {
          currentProf.profession_fields.forEach(field => {
            if (field.field_type === 'url') {
              const val = categoryFormData[cat]?.[field.field_name];
              if (val && val.trim().length > 0) {
                const isYoutube = val.match(/(?:youtube\.com|youtu\.be)/i);
                const isInstagram = val.match(/instagram\.com/i);
                if (!isYoutube && !isInstagram) {
                  hasInvalidUrls = true;
                }
              }
            }
          });
        }
      });

      if (hasInvalidUrls) {
        GlobalAlert.show('Invalid Link', 'Please only use Instagram or YouTube links.');
        return;
      }

      // 1. Save Basic Info
      const payload = {
        ...formData,
        categories, // Save the currently active categories
        age: formData.age ? parseInt(formData.age, 10) : null,
        is_cintaa_member: !!formData.is_cintaa_member,
        cintaa_reg_number: formData.is_cintaa_member ? formData.cintaa_reg_number : null,
        languages: parseArray(formData.languages),
        preferred_cities: (Array.isArray(formData.work_preference) ? formData.work_preference.includes('Specific Cities') : formData.work_preference === 'Specific Cities')
          ? parseArray(formData.preferred_cities)
          : [],
        look_alike: parseArray(formData.look_alike),
        hashtags: parseArray(formData.hashtags),
        work_preference: parseArray(formData.work_preference),
      };

      const savedProfile = await upsertProfile(payload).unwrap();

      // 2. Save all Category Data
      const artistId = profileResponse?.data?.id || savedProfile?.data?.id || savedProfile?.id;
      if (!artistId) {
        showError('', 'Profile ID missing after save.');
        return;
      }

      const originalCategories = profileResponse?.data?.categories || [];
      const removedCategories = originalCategories.filter(c => !categories.includes(c));

      const categoryPromises = categories.map(cat => {
        const currentData = categoryFormData[cat] || {};
        return updateCategory({ artistId, category: cat, detailsData: currentData }).unwrap();
      });

      const removePromises = removedCategories.map(cat => {
        return updateCategory({ artistId, category: cat, detailsData: {} }).unwrap();
      });

      // Run all requests concurrently
      await Promise.all([...categoryPromises, ...removePromises]);

      showSuccess('', 'Profile saved successfully!');
      navigation.reset({
        index: 0,
        routes: [{
          name: 'MainTabs',
          params: {
            screen: 'Tabs',
            params: { screen: 'Profile' }
          }
        }],
      });
    } catch (error) {
      console.error('Save profile error:', error);
      const errMsg = error?.data?.error || error?.message || 'Failed to save profile';
      showError('', typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    }
  };

  const {
    scrollY,
    onScroll,
    headerPaddingVertical,
    headerTitleSize,
    subtitleHeight,
    subtitleOpacity,
    headerElevation,
  } = useShrinkableHeader();

  const isLoading = isSaving || isUpdating;

  if (isFetching) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]} edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <ShrinkableHeader 
        title={route.params?.isOnboarding ? 'Complete Profile' : 'Edit Profile'}
        subtitle="Personal Details & Specialties"
        showBack={true}
        onBack={() => navigation.goBack()}
        headerPaddingVertical={headerPaddingVertical}
        headerTitleSize={headerTitleSize}
        subtitleHeight={subtitleHeight}
        subtitleOpacity={subtitleOpacity}
        headerElevation={headerElevation}
        bottomComponent={
          <View style={[styles.tabsContainer, { marginHorizontal: 0, marginTop: 4, marginBottom: 0 }]}>
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
        }
      />

      <Modal
        visible={genderModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setGenderModalVisible(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
          activeOpacity={1}
          onPress={() => setGenderModalVisible(false)}
        >
          <View style={{ backgroundColor: colors.surfaceLight, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: colors.textMainLight }}>Select Gender</Text>
            {['Male', 'Female', 'Other'].map(opt => (
              <TouchableOpacity
                key={opt}
                style={{ paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: colors.borderLight }}
                onPress={() => {
                  setFormData(p => ({ ...p, gender: opt }));
                  setGenderModalVisible(false);
                }}
              >
                <Text style={{ fontSize: 16, color: formData.gender === opt ? colors.primary : colors.textMainLight }}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <KeyboardAwareScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content} 
        enableOnAndroid={true}
        extraScrollHeight={100}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={isFetching || false} onRefresh={refetch} tintColor={colors.primary} />}
      >

        {activeTab === 'Basic Info' ? (
          <>
            <View style={{ marginBottom: 24 }}>
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary + '15', padding: 16, borderRadius: 12 }}
                onPress={() => navigation.navigate('ArtistCategory', {
                  isEditing: true,
                  currentCategories: categories,
                  onCategoriesUpdated: (newCategories) => {
                    setCategories(newCategories);
                    // Also wipe local form data for removed categories
                    setCategoryFormData(prev => {
                      const next = { ...prev };
                      let changed = false;
                      Object.keys(next).forEach(cat => {
                        if (!newCategories.includes(cat)) {
                          delete next[cat];
                          changed = true;
                        }
                      });
                      return changed ? next : prev;
                    });
                  }
                })}
              >
                <Icon name="color-palette-outline" size={24} color={colors.primary} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ ...typography.h3, color: colors.primary }}>Manage Talents</Text>
                  <Text style={{ ...typography.caption, color: colors.textMainLight, marginTop: 4 }}>
                    {categories.join(', ') || 'Select your talent categories'}
                  </Text>
                </View>
                <Icon name="chevron-forward" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={{ alignItems: 'center', marginVertical: 24 }}>
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={() => {
                  GlobalAlert.show(
                    'Update Profile Photo',
                    'Choose an option to upload your photo',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Take Photo',
                        onPress: async () => {
                          if (Platform.OS === 'android') {
                            try {
                              const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
                              if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                                launchCamera({ mediaType: 'photo', cameraType: 'front', quality: 0.8 }, handleImageUpload);
                              } else {
                                showError('Permission Denied', "Camera permission is required to update your profile photo.");
                              }
                            } catch (err) {
                              console.error(err);
                              showError('Error', err?.message || 'Failed to request camera permission');
                            }
                          } else {
                            launchCamera({ mediaType: 'photo', cameraType: 'front', quality: 0.8, maxWidth: 1080, maxHeight: 1080 }, handleImageUpload);
                          }
                        }
                      },
                      {
                        text: 'Choose from Gallery',
                        onPress: () => {
                          launchImageLibrary({ mediaType: 'photo', selectionLimit: 1, quality: 0.8, maxWidth: 1080, maxHeight: 1080 }, handleImageUpload);
                        }
                      }
                    ]
                  );
                }}
              >
                {(profileResponse?.data?.users?.avatar_url || profileResponse?.data?.avatar_url) ? (
                  <Image source={{ uri: (profileResponse?.data?.users?.avatar_url || profileResponse?.data?.avatar_url) }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Icon name="person" size={60} color={colors.borderLight} />
                  </View>
                )}
                <View style={styles.avatarEditIcon}>
                  {isUploadingMedia ? (
                    <ActivityIndicator size="small" color={colors.backgroundLight} />
                  ) : (
                    <Icon name="camera" size={16} color={colors.backgroundLight} />
                  )}
                </View>
              </TouchableOpacity>
              {isUploadingMedia && (
                <View style={{ width: '50%', marginTop: 8 }}>
                  <ProgressBar progress={uploadProgress} />
                </View>
              )}
              <Text style={{ ...typography.caption, color: colors.textMutedLight, marginTop: 12 }}>
                Tap to change profile photo
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Are you a CINTAA Member?</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Switch
                  value={formData.is_cintaa_member}
                  onValueChange={(val) => setFormData(p => ({ ...p, is_cintaa_member: val }))}
                  trackColor={{ false: colors.borderLight, true: colors.primary + '80' }}
                  thumbColor={formData.is_cintaa_member ? colors.primary : '#f4f3f4'}
                />
                <Text style={{ ...typography.body, marginLeft: 10, color: colors.textMainLight }}>
                  {formData.is_cintaa_member ? 'Yes' : 'No'}
                </Text>
              </View>
            </View>
            
            {formData.is_cintaa_member && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>CINTAA Registration Number</Text>
                <View style={styles.inputContainer}>
                  <Icon name="card-outline" size={20} color={colors.textMutedLight} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={formData.cintaa_reg_number}
                    onChangeText={(text) => setFormData(p => ({ ...p, cintaa_reg_number: text }))}
                    placeholder="Enter Reg Number"
                    placeholderTextColor={colors.textMutedLight}
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. John Doe"
                placeholderTextColor={colors.textMutedLight}
                value={formData.full_name}
                onChangeText={(t) => setFormData(p => ({ ...p, full_name: t }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Alternate Number</Text>
              <TextInput
                style={styles.input}
                placeholder="+91 XXXXXXXXXX"
                placeholderTextColor={colors.textMutedLight}
                value={formData.alt_number}
                onChangeText={(t) => setFormData(p => ({ ...p, alt_number: t }))}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username (Handle) *</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="e.g. johndoe (must be unique)"
                  placeholderTextColor={colors.textMutedLight}
                  value={formData.username}
                  onChangeText={(t) => setFormData(p => ({ ...p, username: t.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={{ marginLeft: 8, backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, justifyContent: 'center' }}
                  onPress={handleVerifyUsername}
                  disabled={isCheckingUsername}
                >
                  {isCheckingUsername ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Verify</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Age *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 24"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textMutedLight}
                  value={formData.age}
                  onChangeText={(t) => setFormData(p => ({ ...p, age: t }))}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Gender *</Text>
                <TouchableOpacity
                  style={[styles.input, { justifyContent: 'center' }]}
                  onPress={() => setGenderModalVisible(true)}
                >
                  <Text style={{ color: formData.gender ? colors.textMainLight : colors.textMutedLight }}>
                    {formData.gender || 'Select Gender'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Height</Text>
                <BottomSheetSelect
                  placeholder="Select Height"
                  options={HEIGHT_OPTIONS}
                  value={formData.height}
                  onSelect={(t) => setFormData(p => ({ ...p, height: t }))}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 75"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textMutedLight}
                  value={formData.weight}
                  onChangeText={(t) => setFormData(p => ({ ...p, weight: t }))}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Tell us about yourself..."
                placeholderTextColor={colors.textMutedLight}
                multiline
                value={formData.bio}
                onChangeText={(t) => setFormData(p => ({ ...p, bio: t }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Languages</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {AVAILABLE_LANGUAGES.map(lang => {
                  const isSelected = formData.languages.includes(lang);
                  return (
                    <TouchableOpacity
                      key={lang}
                      style={[
                        { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: colors.borderLight },
                        isSelected && { backgroundColor: colors.primary, borderColor: colors.primary }
                      ]}
                      onPress={() => {
                        setFormData(p => ({
                          ...p,
                          languages: isSelected 
                            ? p.languages.filter(l => l !== lang)
                            : [...p.languages, lang]
                        }));
                      }}
                    >
                      <Text style={{ color: isSelected ? '#fff' : colors.textMainLight, fontSize: 13 }}>{lang}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

          </>
        ) : activeTab === 'Advanced Info' ? (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Availability Type</Text>
              <BottomSheetSelect
                value={formData.availability_type}
                options={['Full Time', 'Part Time', 'Weekends', 'Short Term', 'Long Term', 'Freelance']}
                onSelect={(t) => setFormData(p => ({ ...p, availability_type: t }))}
                placeholder="Select Availability"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Available Dates</Text>
              <DateRangePicker
                value={formData.available_dates}
                onSelect={(t) => setFormData(p => ({ ...p, available_dates: t }))}
                placeholder="Select Dates"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Work Preference</Text>
              <BottomSheetSelect
                placeholder="Select Preference"
                options={['Available in India', 'Outside India', 'Specific Cities']}
                value={formData.work_preference}
                onSelect={(val) => {
                  const hasSpecific = Array.isArray(val) ? val.includes('Specific Cities') : val === 'Specific Cities';
                  setFormData(p => ({
                    ...p,
                    work_preference: val,
                    preferred_cities: hasSpecific ? p.preferred_cities : [],
                  }));
                }}
                style={styles.selectInput}
                multiSelect={true}
              />
            </View>

            {(Array.isArray(formData.work_preference) ? formData.work_preference.includes('Specific Cities') : formData.work_preference === 'Specific Cities') && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Select Specific Cities</Text>
                <BottomSheetSelect
                  placeholder="Select Cities"
                  options={INDIAN_CITIES}
                  value={formData.preferred_cities}
                  onSelect={(val) => setFormData(p => ({ ...p, preferred_cities: val }))}
                  multiSelect={true}
                  searchable={true}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Look Alike</Text>
              <TagInput
                tags={formData.look_alike}
                onTagsChange={(t) => setFormData(p => ({ ...p, look_alike: t }))}
                placeholder="e.g. Shahrukh Khan"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Hashtags</Text>
              <TagInput
                tags={formData.hashtags}
                onTagsChange={(t) => setFormData(p => ({ ...p, hashtags: t }))}
                placeholder="e.g. actor, model"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Intro Video (30 sec)</Text>
              <TextInput
                style={styles.input}
                placeholder="Paste YouTube or Instagram URL"
                placeholderTextColor={colors?.textMuted || '#888'}
                value={formData.intro_video_url}
                onChangeText={(t) => setFormData(p => ({ ...p, intro_video_url: t }))}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Left Profile Video & Right Profile Video removed per request */}
            {/*
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Left Profile Video</Text>
              <MediaOrLinkInput
                placeholder="YouTube, Insta or Upload (30 sec)"
                value={formData.left_profile_url}
                onChangeText={(t) => setFormData(p => ({ ...p, left_profile_url: t }))}
                platform="any"
                onFileSelect={(file) => handleMediaFieldSelect('left_profile_url', file)}
                isUploading={uploadingField === 'left_profile_url'}
              />
              {uploadingField === 'left_profile_url' && (
                <View style={{ marginTop: 8 }}><ProgressBar progress={uploadProgress} /></View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Right Profile Video</Text>
              <MediaOrLinkInput
                placeholder="YouTube, Insta or Upload (30 sec)"
                value={formData.right_profile_url}
                onChangeText={(t) => setFormData(p => ({ ...p, right_profile_url: t }))}
                platform="any"
                onFileSelect={(file) => handleMediaFieldSelect('right_profile_url', file)}
                isUploading={uploadingField === 'right_profile_url'}
              />
              {uploadingField === 'right_profile_url' && (
                <View style={{ marginTop: 8 }}><ProgressBar progress={uploadProgress} /></View>
              )}
            </View>
            */}

            {/* Social Media Links Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Social Media Links</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Instagram Profile URL</Text>
              <TextInput
                style={styles.input}
                value={formData.social_links?.instagram || ''}
                onChangeText={(text) => setFormData(p => ({ ...p, social_links: { ...p.social_links, instagram: text } }))}
                placeholder="https://instagram.com/yourhandle"
                placeholderTextColor={colors.textMutedLight}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>YouTube Channel URL</Text>
              <TextInput
                style={styles.input}
                value={formData.social_links?.youtube || ''}
                onChangeText={(text) => setFormData(p => ({ ...p, social_links: { ...p.social_links, youtube: text } }))}
                placeholder="https://youtube.com/@yourchannel"
                placeholderTextColor={colors.textMutedLight}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Facebook Profile URL</Text>
              <TextInput
                style={styles.input}
                value={formData.social_links?.facebook || ''}
                onChangeText={(text) => setFormData(p => ({ ...p, social_links: { ...p.social_links, facebook: text } }))}
                placeholder="https://facebook.com/yourprofile"
                placeholderTextColor={colors.textMutedLight}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Snapchat Profile URL</Text>
              <TextInput
                style={styles.input}
                value={formData.social_links?.snapchat || ''}
                onChangeText={(text) => setFormData(p => ({ ...p, social_links: { ...p.social_links, snapchat: text } }))}
                placeholder="https://snapchat.com/add/yourhandle"
                placeholderTextColor={colors.textMutedLight}
                autoCapitalize="none"
              />
            </View>


            <View style={styles.inputGroup}>
              <Text style={styles.label}>Recent Assignments</Text>
              {(formData.recent_assignments || []).map((assignment, index) => (
                <View key={index} style={{ marginBottom: 15, padding: 15, backgroundColor: colors.backgroundLight, borderRadius: 8, borderWidth: 1, borderColor: colors.borderLight }}>
                  <TextInput
                    style={[styles.input, { marginBottom: 10 }]}
                    placeholder="Project Title (e.g. Fameu Ad)"
                    placeholderTextColor={colors.textMutedLight}
                    value={assignment.title}
                    onChangeText={(text) => updateAssignment(index, 'title', text)}
                  />
                  <TextInput
                    style={[styles.input, { marginBottom: 10 }]}
                    placeholder="Role (e.g. Lead Actor)"
                    placeholderTextColor={colors.textMutedLight}
                    value={assignment.role}
                    onChangeText={(text) => updateAssignment(index, 'role', text)}
                  />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <TextInput
                      style={[styles.input, { flex: 1, marginBottom: 0, marginRight: 10 }]}
                      placeholder="Year (e.g. 2023)"
                      placeholderTextColor={colors.textMutedLight}
                      value={assignment.year}
                      onChangeText={(text) => updateAssignment(index, 'year', text)}
                      keyboardType="numeric"
                    />
                    <TouchableOpacity onPress={() => removeAssignment(index)} style={{ padding: 10, backgroundColor: '#FFEAEA', borderRadius: 8 }}>
                      <Icon name="trash-outline" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={[styles.input, { marginTop: 10, marginBottom: 0 }]}
                    placeholder="Link (e.g. YouTube/IMDb)"
                    placeholderTextColor={colors.textMutedLight}
                    value={assignment.link}
                    onChangeText={(text) => updateAssignment(index, 'link', text)}
                    autoCapitalize="none"
                  />
                </View>
              ))}
              <TouchableOpacity onPress={addAssignment} style={{ padding: 15, alignItems: 'center', backgroundColor: colors.primary + '15', borderRadius: 8 }}>
                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>+ Add Assignment</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, padding: 14, borderRadius: 16, marginBottom: 18, borderWidth: 1, borderColor: colors.borderLight }}>
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: '#DBEAFE' }}>
                <ProfessionCategoryIcon categoryName={activeTab} size={26} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textMainLight, textTransform: 'capitalize' }}>
                  {activeTab} Specialization
                </Text>
                <Text style={{ fontSize: 12, color: colors.textMutedLight, marginTop: 2 }}>
                  Fill in your verified attributes & skills for {activeTab.toLowerCase()}
                </Text>
              </View>
            </View>
            {isLoadingProfessions ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            ) : (() => {
              const currentProfession = professionsList.find(p => 
                (p.name && p.name.toLowerCase().trim() === activeTab.toLowerCase().trim()) ||
                (p.slug && p.slug.toLowerCase().trim() === activeTab.toLowerCase().trim()) ||
                (p.name && p.name.toLowerCase().replace(/[^a-z0-9]/g, '') === activeTab.toLowerCase().replace(/[^a-z0-9]/g, ''))
              );
              const fields = currentProfession?.profession_fields || currentProfession?.fields || currentProfession?.custom_fields || [];
              if (fields.length === 0) {
                return (
                  <View style={{ backgroundColor: colors.surfaceLight, padding: 18, borderRadius: 14, borderWidth: 1, borderColor: colors.borderLight, marginTop: 12, alignItems: 'center' }}>
                    <Icon name="information-circle-outline" size={24} color={colors.textMutedLight} style={{ marginBottom: 6 }} />
                    <Text style={{ color: colors.textMutedLight, fontSize: 13 }}>No custom fields required for {activeTab}.</Text>
                  </View>
                );
              }
              return fields.map((field) => {
                const fieldName = field.field_name || field.name;
                const fieldLabel = field.field_label || field.label || fieldName;
                const fieldType = (field.field_type || field.type || 'text').toLowerCase();
                const isRequired = !!field.is_required;

                let parsedOptions = [];
                if (field.options) {
                  if (Array.isArray(field.options)) {
                    parsedOptions = field.options;
                  } else if (typeof field.options === 'string') {
                    if (field.options.startsWith('[')) {
                      try { parsedOptions = JSON.parse(field.options); } catch (e) { parsedOptions = field.options.split(',').map(s => s.trim()); }
                    } else {
                      parsedOptions = field.options.split(',').map(s => s.trim()).filter(Boolean);
                    }
                  }
                }

                const currentVal = categoryFormData[activeTab]?.[fieldName] ?? 
                                   categoryFormData[activeTab.toLowerCase()]?.[fieldName] ?? '';

                return (
                  <View key={fieldName} style={styles.inputGroup}>
                    <Text style={styles.label}>{fieldLabel} {isRequired ? '*' : ''}</Text>

                    {(fieldType === 'text' || fieldType === 'number' || fieldType === 'url' || fieldType === 'date') && (
                      <TextInput
                        style={styles.input}
                        placeholder={`Enter ${fieldLabel.toLowerCase()}`}
                        placeholderTextColor={colors.textMutedLight}
                        keyboardType={fieldType === 'number' ? 'numeric' : fieldType === 'url' ? 'url' : 'default'}
                        autoCapitalize={fieldType === 'url' ? 'none' : 'sentences'}
                        autoCorrect={fieldType !== 'url'}
                        value={typeof currentVal === 'string' || typeof currentVal === 'number' ? String(currentVal) : ''}
                        onChangeText={(text) => handleTextChange(activeTab, fieldName, text)}
                      />
                    )}

                    {(fieldType === 'textarea' || fieldType === 'long_text' || fieldType === 'paragraph') && (
                      <TextInput
                        style={[styles.input, { minHeight: 80, textAlignVertical: 'top', paddingTop: 10 }]}
                        placeholder={`Enter ${fieldLabel.toLowerCase()}`}
                        placeholderTextColor={colors.textMutedLight}
                        multiline={true}
                        numberOfLines={3}
                        value={typeof currentVal === 'string' ? currentVal : ''}
                        onChangeText={(text) => handleTextChange(activeTab, fieldName, text)}
                      />
                    )}

                    {(fieldType === 'select' || fieldType === 'multiselect') && parsedOptions.length > 0 && (
                      <View style={styles.optionsContainer}>
                        {parsedOptions.map(option => {
                          const isSelected = Array.isArray(currentVal)
                            ? currentVal.includes(option)
                            : (typeof currentVal === 'string' && currentVal.split(',').map(s => s.trim()).includes(option));
                          return (
                            <TouchableOpacity
                              key={option}
                              style={[styles.optionPill, isSelected && styles.optionPillSelected]}
                              onPress={() => handleSelectToggle(activeTab, fieldName, option, fieldType === 'multiselect')}
                            >
                              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{option}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}

                    {fieldType === 'file' && (
                      <View style={{ marginTop: 8 }}>
                        {(() => {
                          const existingVal = currentVal;
                          const files = Array.isArray(existingVal) ? existingVal : (existingVal ? [existingVal] : []);

                          return (
                            <>
                              {files.map((fileUrl, index) => {
                                const isVideo = typeof fileUrl === 'string' && fileUrl.match(/\.(mp4|mov)$/i);
                                const isAudio = typeof fileUrl === 'string' && fileUrl.match(/\.(mp3|wav|aac|ogg|webm)$/i);
                                const isImage = typeof fileUrl === 'string' && fileUrl.match(/\.(jpg|jpeg|png|webp)$/i);

                                return (
                                  <View key={index} style={{ marginBottom: 12, backgroundColor: colors.surfaceLight, padding: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.borderLight }}>
                                    {(isVideo || isAudio) ? (
                                      <Video
                                        source={{ uri: fileUrl }}
                                        style={{ width: '100%', height: isVideo ? 200 : 50, borderRadius: 8, backgroundColor: '#000', marginBottom: 8 }}
                                        controls={true}
                                        resizeMode={isVideo ? "cover" : "contain"}
                                        paused={true}
                                      />
                                    ) : isImage ? (
                                      <Image source={{ uri: fileUrl }} style={{ width: '100%', height: 200, borderRadius: 8, backgroundColor: colors.surfaceLight, marginBottom: 8 }} resizeMode="cover" />
                                    ) : (
                                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                        <Icon name="document-attach-outline" size={24} color={colors.primary} />
                                        <Text style={{ flex: 1, marginLeft: 12, color: colors.textMainLight, fontSize: 13 }} numberOfLines={1}>
                                          {String(fileUrl).split('/').pop()}
                                        </Text>
                                      </View>
                                    )}

                                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                                      <TouchableOpacity onPress={() => handleDeleteFile(activeTab, fieldName, fileUrl)} style={{ padding: 4, flexDirection: 'row', alignItems: 'center' }}>
                                        <Icon name="trash-outline" size={16} color="#ef4444" />
                                        <Text style={{ color: '#ef4444', fontSize: 12, marginLeft: 4 }}>Remove</Text>
                                      </TouchableOpacity>
                                    </View>
                                  </View>
                                );
                              })}

                              <TouchableOpacity
                                style={[styles.fileButton, { marginTop: files.length > 0 ? 4 : 0 }]}
                                onPress={() => handleFileUpload(activeTab, fieldName)}
                                disabled={isUploadingFile}
                              >
                                {isUploadingFile ? (
                                  <ActivityIndicator size="small" color={colors.primary} />
                                ) : (
                                  <>
                                    <Icon name="cloud-upload-outline" size={20} color={colors.primary} />
                                    <Text style={styles.fileButtonText}>{files.length > 0 ? "Add Another File" : "Upload File"}</Text>
                                  </>
                                )}
                              </TouchableOpacity>
                              {isUploadingFile && (
                                <View style={{ marginTop: 8 }}>
                                  <ProgressBar progress={uploadProgress} />
                                </View>
                              )}
                            </>
                          );
                        })()}
                      </View>
                    )}
                  </View>
                );
              });
            })()}
          </>
        )}

      </KeyboardAwareScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, (isLoading || isUploadingMedia || isUploadingFile || uploadingField !== null) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading || isUploadingMedia || isUploadingFile || uploadingField !== null}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.backgroundLight} />
          ) : (
            <Text style={styles.saveButtonText}>Save All Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textMainLight,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    marginBottom: 12,
    backgroundColor: colors.backgroundLight,
  },
  tabsScroll: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    borderBottomColor: colors.primary,
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: colors.textMutedLight,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMutedLight,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroup: {
    marginBottom: 20,
  },
  sectionHeader: {
    marginTop: 12,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textMainLight,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textMainLight,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    justifyContent: 'center',
    ...typography.body,
    color: colors.textMainLight,
  },
  inputMultiline: {
    minHeight: 100,
    height: 100,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  optionPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  optionPillSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  optionText: {
    ...typography.body,
    color: colors.textMainLight,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: colors.primaryLight + '20',
  },
  fileButtonText: {
    ...typography.body,
    color: colors.primary,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.backgroundLight,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    ...typography.h4,
    color: colors.backgroundLight,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.backgroundMain,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarEditIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.backgroundLight,
  }
});
