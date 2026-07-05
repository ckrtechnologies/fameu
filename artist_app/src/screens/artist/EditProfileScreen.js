import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, PermissionsAndroid, Platform , RefreshControl, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import DocumentPicker from 'react-native-document-picker';
import Video from 'react-native-video';
import { colors, typography } from '../../theme/theme';
import { useGetProfileQuery, useUpsertProfileMutation, useUpdateCategoryMutation, useUploadMediaMutation, useLazyCheckUsernameQuery, useGetProfessionsQuery, useUploadGenericFileMutation } from '../../services/profileApi';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { data: profileResponse, isLoading: isFetching , refetch} = useGetProfileQuery()
  const [upsertProfile, { isLoading: isSaving }] = useUpsertProfileMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [uploadMedia, { isLoading: isUploadingMedia }] = useUploadMediaMutation();
  const [uploadGenericFile, { isLoading: isUploadingFile }] = useUploadGenericFileMutation();
  const [checkUsername, { isFetching: isCheckingUsername }] = useLazyCheckUsernameQuery();
  const { data: professionsResponse, isLoading: isLoadingProfessions } = useGetProfessionsQuery();
  const professionsList = professionsResponse?.data || [];

  const [activeTab, setActiveTab] = useState('Basic Info');

  const [showTalentModal, setShowTalentModal] = useState(false);

  const handleImageUpload = async (res) => {

    if (res.didCancel) return;
    if (res.errorMessage) {
      Alert.alert('Camera Error', res.errorMessage);
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

    try {
      await uploadMedia(formData).unwrap();
      Alert.alert('Success', 'Profile photo updated!');
    } catch (error) {
      console.error('Upload photo error:', error);
      const errMsg = error?.data?.error || error?.message || 'Failed to upload photo';
      Alert.alert('Error', typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
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
    languages: '',
    username: '',
  });

  const [categoryFormData, setCategoryFormData] = useState({});
  const [genderModalVisible, setGenderModalVisible] = useState(false);

  const categoriesFromApi = profileResponse?.data?.categories || [];
  const [categories, setCategories] = useState([]);
  const tabs = ['Basic Info', ...categories];

  const isInitialized = React.useRef(false);

  useEffect(() => {
    if (route.params?.updatedCategories) {
      setCategories(route.params.updatedCategories);

      setCategoryFormData(prev => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach(cat => {
          if (!route.params.updatedCategories.includes(cat)) {
            delete next[cat];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }
  }, [route.params?.updatedCategories]);

  useEffect(() => {
    if (profileResponse?.data && !isInitialized.current) {
      if (route.params?.updatedCategories) {
        setCategories(route.params.updatedCategories);
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
        languages: p.languages ? p.languages.join(', ') : '',
        username: p.users?.username || '',
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
  }, [profileResponse]);

  const handleVerifyUsername = async () => {
    if (!formData.username) return Alert.alert('Error', 'Please enter a username to verify.');
    try {
      const response = await checkUsername(formData.username).unwrap();
      if (response.data.available) {
        Alert.alert('Success', 'This username is available!');
      } else {
        Alert.alert('Error', 'This username is already taken. Please choose another one.');
      }
    } catch (err) {
      Alert.alert('Error', err?.data?.error || 'Failed to check username.');
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

      const response = await uploadGenericFile(formData).unwrap();
      
      if (response.success && response.url) {
        setCategoryFormData(prev => {
          const existing = prev[category]?.[key];
          let newVal;
          if (Array.isArray(existing)) {
            newVal = [...existing, response.url];
          } else if (typeof existing === 'string' && existing !== '') {
            newVal = [existing, response.url];
          } else {
            newVal = [response.url];
          }
          return {
            ...prev,
            [category]: {
              ...(prev[category] || {}),
              [key]: newVal
            }
          };
        });
        Alert.alert('Success', 'File uploaded successfully!');
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        return;
      }
      Alert.alert('Error', err?.data?.error || err.message || 'Upload failed');
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.full_name || !formData.full_name.trim()) {
        Alert.alert('Validation Error', 'Full Name is required.');
        return;
      }
      if (!formData.username || !formData.username.trim()) {
        Alert.alert('Validation Error', 'Username (Handle) is required.');
        return;
      }
      if (!formData.age || !String(formData.age).trim()) {
        Alert.alert('Validation Error', 'Age is required.');
        return;
      }
      if (!formData.gender || !formData.gender.trim()) {
        Alert.alert('Validation Error', 'Gender is required.');
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
        Alert.alert('Invalid Link', 'Please only use Instagram or YouTube links.');
        return;
      }

      // 1. Save Basic Info
      const payload = {
        ...formData,
        categories, // Save the currently active categories
        age: formData.age ? parseInt(formData.age, 10) : null,
        languages: formData.languages ? formData.languages.split(',').map(s => s.trim()).filter(s => s) : [],
      };

      const savedProfile = await upsertProfile(payload).unwrap();

      // 2. Save all Category Data
      const artistId = profileResponse?.data?.id || savedProfile?.data?.id || savedProfile?.id;
      if (!artistId) {
        Alert.alert('Error', 'Profile ID missing after save.');
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

      Alert.alert('Success', 'Profile saved successfully!');
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
      Alert.alert('Error', typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    }
  };

  const isLoading = isSaving || isUpdating;

  if (isFetching) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]} edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textMainLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{route.params?.isOnboarding ? 'Complete Profile' : 'Edit Profile'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll} refreshControl={<RefreshControl refreshing={isFetching || false} onRefresh={refetch} tintColor={colors.primary} />}>
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
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 }}>
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

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

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
                  Alert.alert(
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
                                Alert.alert("Error", "Camera permission denied");
                              }
                            } catch (err) {
                              console.warn(err);
                            }
                          } else {
                            launchCamera({ mediaType: 'photo', cameraType: 'front', quality: 0.8 }, handleImageUpload);
                          }
                        }
                      },
                      {
                        text: 'Choose from Gallery',
                        onPress: () => {
                          launchImageLibrary({ mediaType: 'photo', selectionLimit: 1, quality: 0.8 }, handleImageUpload);
                        }
                      }
                    ]
                  );
                }}
              >
                {profileResponse?.data?.avatar_url ? (
                  <Image source={{ uri: profileResponse.data.avatar_url }} style={styles.avatarImage} />
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
              <Text style={{ ...typography.caption, color: colors.textSecondaryLight, marginTop: 12 }}>
                Tap to change profile photo
              </Text>
            </View>

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
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 5'9''"
                  placeholderTextColor={colors.textMutedLight}
                  value={formData.height}
                  onChangeText={(t) => setFormData(p => ({ ...p, height: t }))}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Weight</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 70kg"
                  placeholderTextColor={colors.textMutedLight}
                  value={formData.weight}
                  onChangeText={(t) => setFormData(p => ({ ...p, weight: t }))}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Mumbai"
                placeholderTextColor={colors.textMutedLight}
                value={formData.city}
                onChangeText={(t) => setFormData(p => ({ ...p, city: t }))}
              />
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
              <Text style={styles.label}>Languages (comma separated)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. English, Hindi"
                placeholderTextColor={colors.textMutedLight}
                value={formData.languages}
                onChangeText={(t) => setFormData(p => ({ ...p, languages: t }))}
              />
            </View>
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>Fill in your {activeTab.toLowerCase()} specific details to stand out.</Text>
            {isLoadingProfessions ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            ) : (() => {
              const currentProfession = professionsList.find(p => p.name === activeTab);
              const fields = currentProfession?.profession_fields || [];
              if (fields.length === 0) {
                return <Text style={{ color: colors.textMutedLight, marginTop: 16 }}>No custom fields required for this profession.</Text>;
              }
              return fields.map((field) => (
                <View key={field.field_name} style={styles.inputGroup}>
                  <Text style={styles.label}>{field.field_label} {field.is_required ? '*' : ''}</Text>
                  
                  {(field.field_type === 'text' || field.field_type === 'number' || field.field_type === 'url') && (
                    <TextInput
                      style={styles.input}
                      placeholder={`Enter ${field.field_label.toLowerCase()}`}
                      placeholderTextColor={colors.textMutedLight}
                      keyboardType={field.field_type === 'number' ? 'numeric' : field.field_type === 'url' ? 'url' : 'default'}
                      autoCapitalize={field.field_type === 'url' ? 'none' : 'sentences'}
                      autoCorrect={field.field_type !== 'url'}
                      value={categoryFormData[activeTab]?.[field.field_name] || ''}
                      onChangeText={(text) => handleTextChange(activeTab, field.field_name, text)}
                    />
                  )}

                  {(field.field_type === 'select' || field.field_type === 'multiselect') && field.options && (
                    <View style={styles.optionsContainer}>
                      {field.options.map(option => {
                        const isSelected = (categoryFormData[activeTab]?.[field.field_name] || []).includes(option);
                        return (
                          <TouchableOpacity 
                            key={option}
                            style={[styles.optionPill, isSelected && styles.optionPillSelected]}
                            onPress={() => handleSelectToggle(activeTab, field.field_name, option, field.field_type === 'multiselect')}
                          >
                            <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{option}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}

                  {field.field_type === 'file' && (
                    <View style={{ marginTop: 8 }}>
                      {(() => {
                        const existingVal = categoryFormData[activeTab]?.[field.field_name];
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
                                    <TouchableOpacity onPress={() => handleDeleteFile(activeTab, field.field_name, fileUrl)} style={{ padding: 4, flexDirection: 'row', alignItems: 'center' }}>
                                      <Icon name="trash-outline" size={16} color="#ef4444" />
                                      <Text style={{ color: '#ef4444', fontSize: 12, marginLeft: 4 }}>Remove</Text>
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              );
                            })}
                            
                            <TouchableOpacity 
                              style={[styles.fileButton, { marginTop: files.length > 0 ? 4 : 0 }]}
                              onPress={() => handleFileUpload(activeTab, field.field_name)}
                            >
                              <Icon name="cloud-upload-outline" size={20} color={colors.primary} />
                              <Text style={styles.fileButtonText}>{files.length > 0 ? "Add Another File" : "Upload File"}</Text>
                            </TouchableOpacity>
                          </>
                        );
                      })()}
                    </View>
                  )}
                </View>
              ));
            })()}
          </>
        )}

      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
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

const styles = StyleSheet.create({
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
    marginBottom: 8,
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
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondaryLight,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroup: {
    marginBottom: 20,
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
    padding: 14,
    ...typography.body,
    color: colors.textMainLight,
  },
  inputMultiline: {
    height: 100,
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
