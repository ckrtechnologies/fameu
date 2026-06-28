import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, typography } from '../../theme/theme';
import { useGetProfileQuery, useUpsertProfileMutation, useUpdateCategoryMutation } from '../../services/profileApi';
import { FIELD_CONFIGS } from './ArtistFormScreen';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { data: profileResponse, isLoading: isFetching } = useGetProfileQuery();
  const [upsertProfile, { isLoading: isSaving }] = useUpsertProfileMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();

  const [activeTab, setActiveTab] = useState('Basic Info');
  
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
  });

  const [categoryFormData, setCategoryFormData] = useState({});

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
      });

      if (p.category_details) {
        const catData = {};
        (p.categories || []).forEach(cat => {
          const details = p.category_details[cat.toLowerCase()];
          if (details) {
            const processed = { ...details };
            const fields = FIELD_CONFIGS[cat] || [];
            fields.forEach(f => {
              if (f.isArray && Array.isArray(processed[f.key])) {
                processed[f.key] = processed[f.key].join(', ');
              }
            });
            catData[cat] = processed;
          }
        });
        setCategoryFormData(catData);
      }
    }
  }, [profileResponse]);

  const handleSave = async () => {
    try {
      // 1. Save Basic Info
      const payload = {
        ...formData,
        categories, // Save the currently active categories
        age: formData.age ? parseInt(formData.age, 10) : null,
        languages: formData.languages ? formData.languages.split(',').map(s => s.trim()).filter(s => s) : [],
      };
      
      const basicInfoPromise = upsertProfile(payload).unwrap();

      // 2. Save all Category Data
      const artistId = profileResponse?.data?.id;
      if (!artistId) {
        Alert.alert('Error', 'Profile ID missing.');
        return;
      }

      const originalCategories = profileResponse?.data?.categories || [];
      const removedCategories = originalCategories.filter(c => !categories.includes(c));

      const categoryPromises = categories.map(cat => {
        const fields = FIELD_CONFIGS[cat] || [];
        const currentData = categoryFormData[cat] || {};
        const processedData = { ...currentData };
        
        fields.forEach(f => {
          if (f.isArray && processedData[f.key] && typeof processedData[f.key] === 'string') {
            processedData[f.key] = processedData[f.key].split(',').map(s => s.trim()).filter(s => s);
          }
        });

        return updateCategory({ artistId, category: cat, detailsData: processedData }).unwrap();
      });

      const removePromises = removedCategories.map(cat => {
        const emptyData = {};
        const fields = FIELD_CONFIGS[cat] || [];
        fields.forEach(f => {
          emptyData[f.key] = f.isArray ? [] : null;
        });
        return updateCategory({ artistId, category: cat, detailsData: emptyData }).unwrap();
      });

      // Run all requests concurrently
      await Promise.all([basicInfoPromise, ...categoryPromises, ...removePromises]);

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
      Alert.alert('Error', error?.data?.error || 'Failed to save profile');
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
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabsContainer}>
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

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        {activeTab === 'Basic Info' ? (
          <>
            <View style={{ marginBottom: 24 }}>
               <TouchableOpacity 
                 style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary + '15', padding: 16, borderRadius: 12 }}
                 onPress={() => navigation.navigate('ArtistCategory', { isEditing: true, currentCategories: categories })}
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. John Doe"
                placeholderTextColor={colors.textMutedLight}
                value={formData.full_name}
                onChangeText={(t) => setFormData(p => ({ ...p, full_name: t }))}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Age</Text>
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
                <Text style={styles.label}>Gender</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Male"
                  placeholderTextColor={colors.textMutedLight}
                  value={formData.gender}
                  onChangeText={(t) => setFormData(p => ({ ...p, gender: t }))}
                />
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
            {(FIELD_CONFIGS[activeTab] || []).map((field) => (
              <View key={field.key} style={styles.inputGroup}>
                <Text style={styles.label}>{field.label}</Text>
                <TextInput
                  style={[styles.input, field.multiline && styles.inputMultiline]}
                  placeholder={field.placeholder}
                  placeholderTextColor={colors.textMutedLight}
                  multiline={field.multiline}
                  value={categoryFormData[activeTab]?.[field.key] || ''}
                  onChangeText={(text) => setCategoryFormData(prev => ({ 
                    ...prev, 
                    [activeTab]: { ...(prev[activeTab] || {}), [field.key]: text } 
                  }))}
                />
              </View>
            ))}
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
    minHeight: 100,
    textAlignVertical: 'top',
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
  }
});
