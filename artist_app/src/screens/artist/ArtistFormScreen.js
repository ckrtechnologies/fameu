import { GlobalAlert } from '../../components/core/GlobalAlert';
import { showError, showSuccess } from '../../utils/toast';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import DocumentPicker from '@react-native-documents/picker';
import { useTheme } from '../../theme/ThemeProvider';
import { typography } from '../../theme/theme';
import { useUpdateCategoryMutation, useGetProfileQuery, useGetProfessionsQuery } from '../../services/profileApi';
import { useSelector } from 'react-redux';
import { uploadFileWithProgress } from '../../utils/uploadUtils';
import ProgressBar from '../../components/core/ProgressBar';
export default function ArtistFormScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const route = useRoute();
  const navigation = useNavigation();
  const { categories } = route.params || {};

  const { data: profileResponse, isFetching, refetch } = useGetProfileQuery();
  const { data: professionsResponse, isLoading: isLoadingProfessions } = useGetProfessionsQuery();

  const artistId = profileResponse?.data?.id;
  const professionsList = professionsResponse?.data || [];

  const [updateCategory, { isLoading }] = useUpdateCategoryMutation();
  const token = useSelector(state => state.auth.token);
  const [activeTab, setActiveTab] = useState(categories?.[0]);
  const [formData, setFormData] = useState({});
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

      setIsUploadingFile(true);
      setUploadProgress(0);

      try {
        const response = await uploadFileWithProgress('/artist_app/profile/upload-file', formDataUpload, (progress) => {
          setUploadProgress(progress);
        }, token);

        const fileUrl = response.data?.url || response.url;
        if (fileUrl) {
          setFormData(prev => ({
            ...prev,
            [category]: {
              ...(prev[category] || {}),
              [key]: fileUrl
            }
          }));
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
      GlobalAlert.show('Invalid Link', 'Please only use Instagram or YouTube links.');
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
              screen: 'Dashboard'
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

  const currentProfession = professionsList.find(p => 
    (p.name && p.name.toLowerCase().trim() === activeTab?.toLowerCase().trim()) ||
    (p.slug && p.slug.toLowerCase().trim() === activeTab?.toLowerCase().trim()) ||
    (p.name && p.name.toLowerCase().replace(/[^a-z0-9]/g, '') === activeTab?.toLowerCase().replace(/[^a-z0-9]/g, ''))
  );
  const fields = currentProfession?.profession_fields || currentProfession?.fields || currentProfession?.custom_fields || [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textMainLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Role Details</Text>
        <View style={{ width: 40 }} />
      </View>

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
                <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <KeyboardAwareScrollView 
        contentContainerStyle={styles.formContainer}
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === 'ios' ? 50 : 100}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>
          {activeTab} Details
        </Text>
        <Text style={styles.subtitle}>
          Provide specific details for your role as {activeTab}.
        </Text>

        {isLoadingProfessions ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : fields.length === 0 ? (
          <View style={{ backgroundColor: colors.surfaceLight, padding: 18, borderRadius: 14, borderWidth: 1, borderColor: colors.borderLight, marginTop: 12, alignItems: 'center' }}>
            <Icon name="information-circle-outline" size={24} color={colors.textMutedLight} style={{ marginBottom: 6 }} />
            <Text style={{ color: colors.textMutedLight, fontSize: 13 }}>No custom fields required for {activeTab}.</Text>
          </View>
        ) : fields.map((field) => {
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

          const currentVal = formData[activeTab]?.[fieldName] ?? 
                             formData[activeTab?.toLowerCase()]?.[fieldName] ?? '';

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
                <>
                  {currentVal ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 8, marginTop: 8, borderWidth: 1, borderColor: colors.borderLight }}>
                      <Icon name="document-attach-outline" size={24} color={colors.primary} />
                      <Text style={{ flex: 1, marginLeft: 12, color: colors.textMainLight, fontSize: 13 }} numberOfLines={1}>
                        {String(currentVal).split('/').pop() || 'Uploaded File'}
                      </Text>
                      <TouchableOpacity onPress={() => handleFileUpload(activeTab, fieldName)} style={{ padding: 4 }}>
                        <Icon name="pencil-outline" size={20} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteFile(activeTab, fieldName)} style={{ padding: 4, marginLeft: 8 }} disabled={isUploadingFile}>
                        <Icon name="trash-outline" size={20} color={isUploadingFile ? "#ccc" : "#ef4444"} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.fileButton}
                      onPress={() => handleFileUpload(activeTab, fieldName)}
                      disabled={isUploadingFile}
                    >
                      {isUploadingFile ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : (
                        <>
                          <Icon name="cloud-upload-outline" size={20} color={colors.primary} />
                          <Text style={styles.fileButtonText}>Upload File</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                  {isUploadingFile && (
                    <View style={{ marginTop: 8 }}>
                      <ProgressBar progress={uploadProgress} />
                    </View>
                  )}
                </>
              )}
            </View>
          );
        })}

      </KeyboardAwareScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, (isLoading || isUploadingFile) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading || isUploadingFile}
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
    color: colors.textMutedLight,
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
