import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme/ThemeProvider';
import { typography, spacing } from '../theme/theme';
import CustomButton from './forms/CustomButton';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SidebarFilterModal({ visible, onClose, onApply, filterConfig, initialFilters, defaultFilters }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const insets = useSafeAreaInsets();
  
  const [activeTab, setActiveTab] = useState(filterConfig[0]?.key);
  const [tempFilters, setTempFilters] = useState(initialFilters || defaultFilters || {});

  useEffect(() => {
    if (visible) {
      setTempFilters(initialFilters || defaultFilters || {});
      setActiveTab(filterConfig[0]?.key);
    }
  }, [visible, initialFilters]);

  const handleApply = () => {
    onApply(tempFilters);
    onClose();
  };

  const handleClear = () => {
    setTempFilters(defaultFilters || {});
  };

  const renderRightPanel = () => {
    const activeConfig = filterConfig.find(c => c.key === activeTab);
    if (!activeConfig) return null;

    if (activeConfig.type === 'range') {
      return (
         <View style={styles.rightContent}>
           <Text style={styles.sectionTitle}>{activeConfig.label}</Text>
           <View style={styles.rangeRow}>
             <TextInput 
               style={styles.input}
               placeholder="Min"
               placeholderTextColor={colors.textMutedLight}
               keyboardType="number-pad"
               value={tempFilters[activeConfig.minKey] || ''}
               onChangeText={(val) => setTempFilters({...tempFilters, [activeConfig.minKey]: val})}
             />
             <Text style={styles.rangeDivider}>to</Text>
             <TextInput 
               style={styles.input}
               placeholder="Max"
               placeholderTextColor={colors.textMutedLight}
               keyboardType="number-pad"
               value={tempFilters[activeConfig.maxKey] || ''}
               onChangeText={(val) => setTempFilters({...tempFilters, [activeConfig.maxKey]: val})}
             />
           </View>
         </View>
      );
    }

    return (
      <ScrollView style={styles.rightContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>{activeConfig.label}</Text>
        <View style={styles.optionsGrid}>
          {activeConfig.options.map(opt => {
            const val = tempFilters[activeConfig.key];
            const isSelected = Array.isArray(val) ? val.includes(opt) : val === opt;
            
            const handlePress = () => {
              if (activeConfig.multiSelect) {
                let currentArr = Array.isArray(val) ? val : (val && val !== 'All' && val !== 'Any' ? [val] : []);
                if (opt === 'All' || opt === 'Any') {
                  setTempFilters({...tempFilters, [activeConfig.key]: opt});
                } else {
                  let newArr;
                  if (currentArr.includes(opt)) {
                    newArr = currentArr.filter(i => i !== opt);
                  } else {
                    newArr = [...currentArr, opt];
                  }
                  if (newArr.length === 0) newArr = activeConfig.options[0]; // fallback to 'All' or similar
                  setTempFilters({...tempFilters, [activeConfig.key]: newArr});
                }
              } else {
                setTempFilters({...tempFilters, [activeConfig.key]: opt});
              }
            };

            return (
              <TouchableOpacity 
                key={opt}
                style={[styles.optionChip, isSelected && styles.optionChipActive]}
                onPress={handlePress}
              >
                <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filters</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close" size={24} color={colors.textMainLight} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={styles.body}>
            {/* Left Sidebar */}
            <View style={styles.sidebar}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {filterConfig.map(config => {
                  const isActive = activeTab === config.key;
                  let hasValue = false;
                  if (config.type === 'range') {
                    hasValue = (tempFilters[config.minKey] && tempFilters[config.minKey] !== '') || 
                               (tempFilters[config.maxKey] && tempFilters[config.maxKey] !== '');
                  } else {
                    const val = tempFilters[config.key];
                    if (Array.isArray(val)) {
                      hasValue = val.length > 0 && !val.includes('All') && !val.includes('Any');
                    } else {
                      hasValue = val && val !== 'All' && val !== 'Any';
                    }
                  }

                  return (
                    <TouchableOpacity 
                      key={config.key} 
                      style={[styles.tabItem, isActive && styles.tabItemActive]}
                      onPress={() => setActiveTab(config.key)}
                    >
                      <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                        {config.label}
                      </Text>
                      {hasValue && <View style={styles.dotIndicator} />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Right Content Pane */}
            <View style={styles.contentPane}>
              {renderRightPanel()}
            </View>
          </View>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
              <Text style={styles.clearBtnText}>Clear All</Text>
            </TouchableOpacity>
            <CustomButton title="Apply Filters" onPress={handleApply} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (colors) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.backgroundLight,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: SCREEN_HEIGHT * 0.75, // 75% of screen
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textMainLight,
  },
  closeBtn: {
    padding: spacing.s,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: '35%',
    backgroundColor: colors.surfaceLight,
    borderRightWidth: 1,
    borderRightColor: colors.borderLight,
  },
  tabItem: {
    paddingVertical: spacing.l,
    paddingHorizontal: spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabItemActive: {
    backgroundColor: colors.backgroundLight,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  tabText: {
    ...typography.body2,
    color: colors.textMutedLight,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  contentPane: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  rightContent: {
    padding: spacing.l,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textMainLight,
    marginBottom: spacing.l,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  optionChip: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceLight,
    marginBottom: spacing.s,
  },
  optionChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
  },
  optionText: {
    ...typography.body2,
    color: colors.textMutedLight,
  },
  optionTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: spacing.m,
    paddingVertical: 12,
    color: colors.textMainLight,
    backgroundColor: colors.surfaceLight,
  },
  rangeDivider: {
    ...typography.body2,
    color: colors.textMutedLight,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.l,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.backgroundLight,
  },
  clearBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: spacing.m,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
  },
  clearBtnText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textMainLight,
  }
});
