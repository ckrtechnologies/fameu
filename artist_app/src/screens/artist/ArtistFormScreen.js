import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, typography } from '../../theme/theme';
import { useUpdateCategoryMutation, useGetProfileQuery } from '../../services/profileApi';

export const FIELD_CONFIGS = {
  Actor: [
    { key: 'body_type', label: 'Body Type', placeholder: 'e.g. Athletic, Slim, Curvy' },
    { key: 'skin_tone', label: 'Skin Tone', placeholder: 'e.g. Fair, Medium, Dark' },
    { key: 'hair_color', label: 'Hair Color', placeholder: 'e.g. Black, Brown, Blonde' },
    { key: 'eye_color', label: 'Eye Color', placeholder: 'e.g. Black, Brown, Blue' },
    { key: 'acting_exp', label: 'Acting Experience', placeholder: 'Years of experience or key roles', multiline: true },
  ],
  Singer: [
    { key: 'vocal_range', label: 'Vocal Range', placeholder: 'e.g. Soprano, Tenor, Baritone' },
    { key: 'singing_genre', label: 'Singing Genres', placeholder: 'e.g. Pop, Classical (comma separated)', isArray: true },
    { key: 'instruments', label: 'Instruments Played', placeholder: 'e.g. Guitar, Piano (comma separated)', isArray: true },
    { key: 'singing_exp', label: 'Singing Experience', placeholder: 'Years of experience or key performances', multiline: true },
  ],
  Model: [
    { key: 'measurements', label: 'Measurements', placeholder: 'e.g. 36-24-36' },
    { key: 'shoe_size', label: 'Shoe Size', placeholder: 'e.g. 8 UK' },
    { key: 'ramp_exp', label: 'Ramp Experience', placeholder: 'Years or key shows', multiline: true },
    { key: 'brand_history', label: 'Brand History', placeholder: 'Brands you have worked with', multiline: true },
  ],
  Dancer: [
    { key: 'dance_styles', label: 'Dance Styles', placeholder: 'e.g. Hip-Hop, Classical (comma separated)', isArray: true },
    { key: 'training', label: 'Training Background', placeholder: 'Where did you train?', multiline: true },
    { key: 'competition_history', label: 'Competition History', placeholder: 'Awards or key events', multiline: true },
  ],
  Technician: [
    { key: 'sub_category', label: 'Specialization', placeholder: 'e.g. Cinematography, Editing, Lighting' },
    { key: 'equipment', label: 'Equipment Owned', placeholder: 'e.g. RED Komodo, Sony A7SIII', multiline: true },
    { key: 'software_skills', label: 'Software Skills', placeholder: 'e.g. Premiere Pro, Resolve (comma separated)', isArray: true },
    { key: 'work_exp', label: 'Work Experience', placeholder: 'Key projects or years of experience', multiline: true },
  ],
};

export default function ArtistFormScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { categories } = route.params || {};

  const { data: profileResponse } = useGetProfileQuery();
  const artistId = profileResponse?.data?.id;

  const [updateCategory, { isLoading }] = useUpdateCategoryMutation();
  const [activeTab, setActiveTab] = useState(categories?.[0]);
  const [formData, setFormData] = useState({});

  const handleTextChange = (category, key, text) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: text
      }
    }));
  };

  const handleSave = async () => {
    if (!artistId) {
      Alert.alert('Error', 'Profile not found. Please complete base profile first.');
      return;
    }

    try {
      const promises = categories.map(cat => {
        const fields = FIELD_CONFIGS[cat] || [];
        const catData = formData[cat] || {};
        
        // Process array fields
        const processedData = { ...catData };
        fields.forEach(f => {
          if (f.isArray && processedData[f.key] && typeof processedData[f.key] === 'string') {
            processedData[f.key] = processedData[f.key].split(',').map(s => s.trim()).filter(s => s);
          }
        });

        return updateCategory({ artistId, category: cat, detailsData: processedData }).unwrap();
      });

      await Promise.all(promises);
      
      Alert.alert('Success', 'Profile details updated!');
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
      Alert.alert('Error', error?.data?.error || 'Failed to update some details');
    }
  };

  if (!categories || !categories.length) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Text style={styles.errorText}>Invalid categories selected.</Text>
      </SafeAreaView>
    );
  }

  const fields = FIELD_CONFIGS[activeTab] || [];

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

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>Fill in your {activeTab.toLowerCase()} specific details to stand out.</Text>

        {fields.map((field) => (
          <View key={field.key} style={styles.inputGroup}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              style={[styles.input, field.multiline && styles.inputMultiline]}
              placeholder={field.placeholder}
              placeholderTextColor={colors.textMutedLight}
              multiline={field.multiline}
              value={formData[activeTab]?.[field.key] || ''}
              onChangeText={(text) => handleTextChange(activeTab, field.key, text)}
            />
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
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    marginTop: 40,
  }
});
