import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, typography } from '../../theme/theme';
import { useUpsertProfileMutation, useGetProfileQuery } from '../../services/profileApi';

const CATEGORIES = [
  { id: 'Actor', title: 'Actor', icon: 'film-outline', color: '#FF6B6B' },
  { id: 'Model', title: 'Model', icon: 'camera-outline', color: '#4ECDC4' },
  { id: 'Singer', title: 'Singer', icon: 'mic-outline', color: '#45B7D1' },
  { id: 'Dancer', title: 'Dancer', icon: 'body-outline', color: '#96CEB4' },
  { id: 'Technician', title: 'Technician', icon: 'construct-outline', color: '#FFEEAD' },
];

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function ArtistCategoryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { data: profileResponse } = useGetProfileQuery();
  const [upsertProfile, { isLoading }] = useUpsertProfileMutation();
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    if (route.params?.currentCategories) {
      setSelectedCategories(route.params.currentCategories);
    } else if (profileResponse?.data?.categories) {
      setSelectedCategories(profileResponse.data.categories);
    }
  }, [profileResponse, route.params?.currentCategories]);

  const toggleCategory = (category) => {
    const isRemoving = selectedCategories.includes(category);
    const originalCategories = profileResponse?.data?.categories || [];
    
    if (isRemoving) {
      if (originalCategories.includes(category)) {
        Alert.alert(
          'Remove Talent Role?',
          `Unchecking this will delete all your ${category} profile data when you save your profile. Are you sure?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Remove', 
              style: 'destructive',
              onPress: () => setSelectedCategories(prev => prev.filter(c => c !== category))
            }
          ]
        );
      } else {
        setSelectedCategories(prev => prev.filter(c => c !== category));
      }
    } else {
      setSelectedCategories(prev => [...prev, category]);
    }
  };

  const handleSubmit = async () => {
    if (selectedCategories.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one talent category to proceed.');
      return;
    }
    
    if (route.params?.isEditing) {
      if (route.params?.onCategoriesUpdated) {
        route.params.onCategoriesUpdated(selectedCategories);
      }
      navigation.goBack();
    } else {
      try {
        const response = await upsertProfile({ categories: selectedCategories }).unwrap();
        if (response.success) {
          navigation.navigate('ArtistForm', { categories: selectedCategories });
        }
      } catch (error) {
        console.error('Update categories error:', error);
        const errMsg = error?.data?.error || error?.message || 'Failed to update categories';
        Alert.alert('Error', typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => {
            if (route.params?.isEditing) {
              if (route.params?.onCategoriesUpdated) {
                route.params.onCategoriesUpdated(selectedCategories);
              }
              navigation.goBack();
            } else {
              navigation.goBack();
            }
          }}
        >
          <Icon name="arrow-back" size={24} color={colors.textMainLight} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>What are your talents?</Text>
        <Text style={styles.subtitle}>Select all categories that apply to help us customize your profile.</Text>
        
        <View style={styles.grid}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategories.includes(cat.id);
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.card,
                  isSelected && styles.cardSelected,
                  { borderColor: isSelected ? cat.color : 'transparent' }
                ]}
                onPress={() => toggleCategory(cat.id)}
                disabled={isLoading}
              >
                <View style={[styles.iconContainer, { backgroundColor: cat.color + (isSelected ? '40' : '15') }]}>
                  <Icon name={cat.icon} size={32} color={cat.color} />
                </View>
                <Text style={styles.cardTitle}>{cat.title}</Text>
                
                {isSelected && (
                  <View style={[styles.checkBadge, { backgroundColor: cat.color }]}>
                    <Icon name="checkmark" size={16} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.continueButton, selectedCategories.length === 0 && styles.continueButtonDisabled]} 
          onPress={handleSubmit}
          disabled={isLoading || selectedCategories.length === 0}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  title: {
    ...typography.h2,
    color: colors.textMainLight,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondaryLight,
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
  },
  cardSelected: {
    backgroundColor: '#FAFAFA',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.textMainLight,
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.backgroundLight,
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: colors.borderLight,
  },
  continueButtonText: {
    ...typography.h3,
    color: '#FFF',
  }
});
