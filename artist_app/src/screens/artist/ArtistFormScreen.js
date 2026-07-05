import { showError, showSuccess } from '../../utils/toast';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator , RefreshControl } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import DocumentPicker from 'react-native-document-picker';
import { colors, typography } from '../../theme/theme';
import { useUpdateCategoryMutation, useGetProfileQuery, useGetProfessionsQuery, useUploadGenericFileMutation } from '../../services/profileApi';
export default function ArtistFormScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { categories } = route.params || {};

  const { data: profileResponse, isFetching, refetch } = useGetProfileQuery();
  const { data: professionsResponse, isLoading: isLoadingProfessions } = useGetProfessionsQuery();
  
  const artistId = profileResponse?.data?.id;
  const professionsList = professionsResponse?.data || [];

  const [updateCategory, { isLoading }] = useUpdateCategoryMutation();
  const [uploadGenericFile] = useUploadGenericFileMutation();
  const [activeTab, setActiveTab] = useState(categories?.[0]);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (profileResponse?.data?.dynamic_details) {
      setFormData(profileResponse.data.dynamic_details);
    }
  }, [profileResponse]);

  const handleTextChange = (category, key, text) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: text
      }
    }));
  };

  const handleSelectToggle = (category, key, option, isMulti) => {
    setFormData(prev => {
      const catData = prev[category] || {};
      const currentVal = catData[key] || [];
      let newVal;
      
      if (isMulti) {
        if (currentVal.includes(option)) {
          newVal = currentVal.filter(o => o !== option);
        } else {
          newVal = [...currentVal, option];
        }
      } else {
        newVal = [option]; // Single select
      }

      return {
        ...prev,
        [category]: {
          ...catData,
          [key]: newVal
        }
      };
    });
  };

  const handleDeleteFile = (category, key) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] || {}),
        [key]: null
      }
    }));
  };

  const handleFileUpload = async (category, key) => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
      });
      
      const formDataUpload = new FormData();
      formDataUpload.append('file', {
        uri: res.uri,
        type: res.type,
        name: res.name || `file_${Date.now()}`,
      });

      const response = await uploadGenericFile(formDataUpload).unwrap();
      
      if (response.success && response.url) {
        setFormData(prev => ({
          ...prev,
          [category]: {
            ...(prev[category] || {}),
            [key]: response.url
          }
        }));
        showSuccess('', 'File uploaded successfully!');
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        return;
      }
      showError('', err?.data?.error || err.message || 'Upload failed');
    }
  };

  const handleSave = async () => {
    if (!artistId) {
      showError('', 'Profile not found. Please complete base profile first.');
      return;
    }

    let hasInvalidUrls = false;
    categories.forEach(cat => {
      const currentProf = professionsList.find(p => p.name === cat);
      if (currentProf && currentProf.profession_fields) {
        currentProf.profession_fields.forEach(field => {
          if (field.field_type === 'url') {
            const val = formData[cat]?.[field.field_name];
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

    try {
      const promises = categories.map(cat => {
        const catData = formData[cat] || {};
        return updateCategory({ artistId, category: cat, detailsData: catData }).unwrap();
      });

      await Promise.all(promises);
      
      showSuccess('', 'Profile details updated!');
      navigation.reset({
        index: 0,
        routes: [{
          name: 'MainTabs',
          params: {
            screen: 'Tabs',
            params: {
              screen: 'Profile'
            }
          }
        }],
      });
    } catch (error) {
      showError('', error?.data?.error || 'Failed to update some details');
    }
  };

  if (!categories || !categories.length) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Text style={styles.errorText}>Invalid categories selected.</Text>
      </SafeAreaView>
    );
  }

  const currentProfession = professionsList.find(p => p.name === activeTab);
  const fields = currentProfession?.profession_fields || [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textMainLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Role Details</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {categories.map((cat) => {
            const isActive = activeTab === cat;
            return (
              <TouchableOpacity 
                key={cat} 
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setActiveTab(cat)}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <KeyboardAwareScrollView style={styles.container} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={isFetching || isLoadingProfessions || false} onRefresh={refetch} tintColor={colors.primary} />}>
        <Text style={styles.subtitle}>Fill in your {activeTab.toLowerCase()} specific details to stand out.</Text>

        {isLoadingProfessions ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : fields.length === 0 ? (
          <Text style={styles.noFieldsText}>No custom fields required for this profession.</Text>
        ) : fields.map((field) => (
          <View key={field.field_name} style={styles.inputGroup}>
            <Text style={styles.label}>{field.field_label} {field.is_required ? '*' : ''} ({field.field_type})</Text>
            
            {(field.field_type === 'text' || field.field_type === 'number' || field.field_type === 'url') && (
              <TextInput
                style={styles.input}
                placeholder={`Enter ${field.field_label.toLowerCase()}`}
                placeholderTextColor={colors.textMutedLight}
                keyboardType={field.field_type === 'number' ? 'numeric' : field.field_type === 'url' ? 'url' : 'default'}
                autoCapitalize={field.field_type === 'url' ? 'none' : 'sentences'}
                autoCorrect={field.field_type !== 'url'}
                value={formData[activeTab]?.[field.field_name] || ''}
                onChangeText={(text) => handleTextChange(activeTab, field.field_name, text)}
              />
            )}

            {(field.field_type === 'select' || field.field_type === 'multiselect') && field.options && (
              <View style={styles.optionsContainer}>
                {field.options.map(option => {
                  const isSelected = (formData[activeTab]?.[field.field_name] || []).includes(option);
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
              <>
                {formData[activeTab]?.[field.field_name] ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 8, marginTop: 8, borderWidth: 1, borderColor: colors.borderLight }}>
                    <Icon name="document-attach-outline" size={24} color={colors.primary} />
                    <Text style={{ flex: 1, marginLeft: 12, color: colors.textMainLight, fontSize: 13 }} numberOfLines={1}>
                      {String(formData[activeTab][field.field_name]).split('/').pop() || 'Uploaded File'}
                    </Text>
                    <TouchableOpacity onPress={() => handleFileUpload(activeTab, field.field_name)} style={{ padding: 4 }}>
                      <Icon name="pencil-outline" size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteFile(activeTab, field.field_name)} style={{ padding: 4, marginLeft: 8 }}>
                      <Icon name="trash-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.fileButton}
                    onPress={() => handleFileUpload(activeTab, field.field_name)}
                  >
                    <Icon name="cloud-upload-outline" size={20} color={colors.primary} />
                    <Text style={styles.fileButtonText}>Upload File</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        ))}

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
            <Text style={styles.saveButtonText}>Save All Roles</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
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
  },
  tabsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  optionPillSelected: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  optionText: {
    ...typography.body,
    color: colors.textMainLight,
    fontSize: 14,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + '40',
    borderStyle: 'dashed',
    gap: 8,
  },
  fileButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  noFieldsText: {
    ...typography.body,
    color: colors.textMutedLight,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
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
    ...typography.h3,
    color: colors.backgroundLight,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    marginTop: 40,
  }
});
