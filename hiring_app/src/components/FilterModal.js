import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { typography, spacing } from '../theme/theme';
import CustomModal from './CustomModal';
import CustomInput from './forms/CustomInput';
import CustomButton from './forms/CustomButton';
import { useGetProfessionsQuery } from '../services/profileApi';
import { useTheme } from '../theme/ThemeProvider';

export default function FilterModal({ visible, onClose, onApply, initialFilters }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [filters, setFilters] = useState(initialFilters || {
    category: '',
    gender: '',
    minAge: '',
    maxAge: '',
    location: '',
  });

  const { data: professionsResponse } = useGetProfessionsQuery();
  const dynamicCategories = (professionsResponse?.data || []).map(p => p.name);
  const categories = dynamicCategories.length > 0 ? dynamicCategories : ['Actor', 'Model', 'Singer', 'Dancer', 'Musician', 'Comedian'];
  const genders = ['Male', 'Female', 'Other', 'Any'];

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      category: '',
      gender: '',
      minAge: '',
      maxAge: '',
      location: '',
    });
  };

  return (
    <CustomModal visible={visible} onClose={onClose} title="Filter Artists">
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Category */}
        <Text style={styles.sectionTitle}>Category</Text>
        <View style={styles.chipContainer}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, filters.category === cat && styles.chipActive]}
              onPress={() => setFilters({ ...filters, category: filters.category === cat ? '' : cat })}
            >
              <Text style={[styles.chipText, filters.category === cat && styles.chipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Gender */}
        <Text style={styles.sectionTitle}>Gender</Text>
        <View style={styles.chipContainer}>
          {genders.map((gen) => (
            <TouchableOpacity
              key={gen}
              style={[styles.chip, filters.gender === (gen === 'Any' ? '' : gen) && styles.chipActive]}
              onPress={() => setFilters({ ...filters, gender: gen === 'Any' ? '' : gen })}
            >
              <Text style={[styles.chipText, filters.gender === (gen === 'Any' ? '' : gen) && styles.chipTextActive]}>{gen}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Age Range */}
        <Text style={styles.sectionTitle}>Age Range</Text>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <CustomInput
              placeholder="Min Age"
              keyboardType="numeric"
              value={filters.minAge}
              onChangeText={(val) => setFilters({ ...filters, minAge: val })}
            />
          </View>
          <Text style={styles.dash}>-</Text>
          <View style={{ flex: 1 }}>
            <CustomInput
              placeholder="Max Age"
              keyboardType="numeric"
              value={filters.maxAge}
              onChangeText={(val) => setFilters({ ...filters, maxAge: val })}
            />
          </View>
        </View>

        {/* Location */}
        <Text style={styles.sectionTitle}>Location</Text>
        <CustomInput
          placeholder="e.g. Mumbai, New York"
          value={filters.location}
          onChangeText={(val) => setFilters({ ...filters, location: val })}
        />
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton variant="ghost" title="Reset" onPress={handleReset} style={{ flex: 1, marginRight: spacing.s }} />
        <CustomButton variant="primary" title="Apply Filters" onPress={handleApply} style={{ flex: 2 }} />
      </View>
    </CustomModal>
  );
}

const getStyles = (colors) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.backgroundLight,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    padding: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textMainLight,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textMainLight,
    marginTop: spacing.l,
    marginBottom: spacing.s,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.body2,
    color: colors.textMutedLight,
  },
  chipTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dash: {
    marginHorizontal: spacing.s,
    ...typography.body1,
    marginBottom: spacing.m, // Align with inputs
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.l,
    paddingBottom: spacing.l,
  },
});
