import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput, Dimensions, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { 
  ArrowUpDown, 
  Coins, 
  Globe, 
  Briefcase, 
  Film, 
  MapPin, 
  Clock, 
  Users, 
  CalendarRange, 
  Check, 
  Sparkles, 
  Flame, 
  Zap, 
  Gem, 
  Plus, 
  Minus,
  CheckCircle2,
  X
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { typography, spacing } from '../theme/theme';
import CustomButton from './forms/CustomButton';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Category icons and accents for the left sidebar
const CATEGORY_META = {
  sort_by: { icon: ArrowUpDown, color: '#3B82F6', label: 'Sort By' },
  min_budget: { icon: Coins, color: '#10B981', label: 'Compensation' },
  mode: { icon: Globe, color: '#8B5CF6', label: 'Audition Mode' },
  category: { icon: Briefcase, color: '#F59E0B', label: 'Profession' },
  project_type: { icon: Film, color: '#EC4899', label: 'Project Type' },
  city: { icon: MapPin, color: '#EF4444', label: 'City' },
  duration_type: { icon: Clock, color: '#06B6D4', label: 'Duration' },
  gender_req: { icon: Users, color: '#6366F1', label: 'Gender' },
  age: { icon: CalendarRange, color: '#D97706', label: 'Age Range' },
};

export default function SidebarFilterModal({ visible, onClose, onApply, filterConfig, initialFilters, defaultFilters }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(colors, insets);
  
  const [activeTab, setActiveTab] = useState(filterConfig[0]?.key || 'sort_by');
  const [tempFilters, setTempFilters] = useState(initialFilters || defaultFilters || {});

  useEffect(() => {
    if (visible) {
      setTempFilters(initialFilters || defaultFilters || {});
      setActiveTab(filterConfig[0]?.key || 'sort_by');
    }
  }, [visible, initialFilters, defaultFilters, filterConfig]);

  const handleApply = () => {
    onApply(tempFilters);
    onClose();
  };

  const handleClear = () => {
    setTempFilters(defaultFilters || {});
  };

  // 1. Sort By Panel
  const renderSortPanel = () => {
    const sortOptions = [
      { key: 'Recent', label: 'Recent', desc: 'Latest casting calls first', icon: Clock, color: '#3B82F6' },
      { key: 'Expiring Soon', label: 'Expiring Soon', desc: 'Urgent submission deadlines', icon: Zap, color: '#F59E0B' },
      { key: 'Popular', label: 'Popular', desc: 'Most viewed & applied', icon: Flame, color: '#EF4444' },
      { key: 'Highest Budget', label: 'Highest Budget', desc: 'Top paying productions', icon: Gem, color: '#10B981' },
    ];

    const currentSort = tempFilters.sort_by || 'Recent';

    return (
      <ScrollView style={styles.rightContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Sort By</Text>
        <View style={styles.cardList}>
          {sortOptions.map((opt) => {
            const isSelected = currentSort === opt.key;
            const IconComp = opt.icon;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[styles.richCard, isSelected && styles.richCardActive]}
                onPress={() => setTempFilters({ ...tempFilters, sort_by: opt.key })}
                activeOpacity={0.8}
              >
                <View style={[styles.richCardIconWrapper, { backgroundColor: opt.color + '15' }]}>
                  <IconComp size={20} color={opt.color} />
                </View>
                <View style={styles.richCardTextWrapper}>
                  <Text style={[styles.richCardTitle, isSelected && styles.richCardTitleActive]}>{opt.label}</Text>
                  <Text style={styles.richCardDesc}>{opt.desc}</Text>
                </View>
                {isSelected && (
                  <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                    <Check size={14} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  // 2. Compensation Panel
  const renderCompensationPanel = () => {
    const currentVal = tempFilters.min_budget || (tempFilters.is_paid ? 'Paid Only' : 'All');

    const budgetTiers = [
      { key: 'All', label: 'Any Compensation', desc: 'Show all auditions', badge: '💰' },
      { key: 'Paid Only', label: 'Paid Auditions Only', desc: 'Hide unpaid/TFP projects', badge: '🟢' },
      { key: '₹5,000+', label: '₹5,000+', desc: 'Daily stipend & micro shoots', badge: '💵' },
      { key: '₹25,000+', label: '₹25,000+', desc: 'Featured supporting roles', badge: '💼' },
      { key: '₹50,000+', label: '₹50,000+', desc: 'Major brand commercials & leads', badge: '🌟' },
      { key: '₹1,00,000+', label: '₹1,00,000+', desc: 'Feature films & global ads', badge: '💎' },
    ];

    const handleSelectTier = (key) => {
      if (key === 'All') {
        setTempFilters({ ...tempFilters, min_budget: '', is_paid: '' });
      } else if (key === 'Paid Only') {
        setTempFilters({ ...tempFilters, min_budget: 'Paid Only', is_paid: 'true' });
      } else {
        setTempFilters({ ...tempFilters, min_budget: key, is_paid: 'true' });
      }
    };

    return (
      <ScrollView style={styles.rightContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Compensation</Text>
        <View style={styles.cardList}>
          {budgetTiers.map((tier) => {
            const isSelected = currentVal === tier.key;
            return (
              <TouchableOpacity
                key={tier.key}
                style={[styles.richCard, isSelected && styles.richCardActive]}
                onPress={() => handleSelectTier(tier.key)}
                activeOpacity={0.8}
              >
                <View style={styles.tierEmojiWrapper}>
                  <Text style={{ fontSize: 20 }}>{tier.badge}</Text>
                </View>
                <View style={styles.richCardTextWrapper}>
                  <Text style={[styles.richCardTitle, isSelected && styles.richCardTitleActive]}>{tier.label}</Text>
                  <Text style={styles.richCardDesc}>{tier.desc}</Text>
                </View>
                {isSelected && (
                  <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                    <Check size={14} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  // 3. Audition Mode Panel
  const renderModePanel = () => {
    const modes = [
      { key: 'All', label: 'All Modes', desc: 'Online, In-person & Walk-in', badge: '✨' },
      { key: 'Online / Self-Tape', label: 'Online / Self-Tape', desc: 'Remote video submission', badge: '🌐' },
      { key: 'Offline (In-Person)', label: 'In-Person Studio', desc: 'Physical audition at studio', badge: '📍' },
      { key: 'Walk-in', label: 'Walk-in Casting', desc: 'Open audition, direct entry', badge: '🚶' },
    ];

    const currentMode = tempFilters.mode || 'All';

    return (
      <ScrollView style={styles.rightContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Audition Mode</Text>
        <View style={styles.cardList}>
          {modes.map((m) => {
            const isSelected = currentMode === m.key;
            return (
              <TouchableOpacity
                key={m.key}
                style={[styles.richCard, isSelected && styles.richCardActive]}
                onPress={() => setTempFilters({ ...tempFilters, mode: m.key })}
                activeOpacity={0.8}
              >
                <View style={styles.tierEmojiWrapper}>
                  <Text style={{ fontSize: 20 }}>{m.badge}</Text>
                </View>
                <View style={styles.richCardTextWrapper}>
                  <Text style={[styles.richCardTitle, isSelected && styles.richCardTitleActive]}>{m.label}</Text>
                  <Text style={styles.richCardDesc}>{m.desc}</Text>
                </View>
                {isSelected && (
                  <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                    <Check size={14} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  // 4. Gender Requirement Panel
  const renderGenderPanel = () => {
    const genders = [
      { key: 'All', label: 'Any / All Genders', badge: '✨', color: '#6366F1' },
      { key: 'Male', label: 'Male Only', badge: '♂', color: '#3B82F6' },
      { key: 'Female', label: 'Female Only', badge: '♀', color: '#EC4899' },
      { key: 'Other', label: 'Non-Binary / Other', badge: '⚧', color: '#8B5CF6' },
    ];

    const currentGender = tempFilters.gender_req || tempFilters.gender || 'All';

    return (
      <ScrollView style={styles.rightContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Gender Requirement</Text>
        <View style={styles.genderGrid}>
          {genders.map((g) => {
            const isSelected = currentGender === g.key;
            return (
              <TouchableOpacity
                key={g.key}
                style={[styles.genderCard, isSelected && styles.genderCardActive]}
                onPress={() => setTempFilters({ ...tempFilters, gender_req: g.key, gender: g.key })}
                activeOpacity={0.8}
              >
                <View style={[styles.genderBadgeCircle, { backgroundColor: g.color + '15' }]}>
                  <Text style={{ fontSize: 24, color: g.color, fontWeight: '700' }}>{g.badge}</Text>
                </View>
                <Text style={[styles.genderCardLabel, isSelected && styles.genderCardLabelActive]}>{g.label}</Text>
                {isSelected && (
                  <View style={[styles.checkBadgeMini, { backgroundColor: colors.primary }]}>
                    <Check size={12} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  // 5. Age Range Panel with Steppers & Demographic Presets
  const renderAgePanel = () => {
    const minVal = parseInt(tempFilters.age_min, 10) || 0;
    const maxVal = parseInt(tempFilters.age_max, 10) || 100;

    const demographicPresets = [
      { label: '👶 Kids (0 – 12)', min: '0', max: '12' },
      { label: '🎒 Teens (13 – 19)', min: '13', max: '19' },
      { label: '⚡ Young Adults (20 – 35)', min: '20', max: '35' },
      { label: '👔 Mature / Prime (36 – 50)', min: '36', max: '50' },
      { label: '👓 Seniors (50+)', min: '50', max: '100' },
    ];

    const handlePreset = (preset) => {
      setTempFilters({ ...tempFilters, age_min: preset.min, age_max: preset.max });
    };

    const updateMin = (delta) => {
      const next = Math.max(0, minVal + delta);
      setTempFilters({ ...tempFilters, age_min: next.toString() });
    };

    const updateMax = (delta) => {
      const next = Math.max(minVal, maxVal + delta);
      setTempFilters({ ...tempFilters, age_max: next.toString() });
    };

    return (
      <ScrollView style={styles.rightContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Age Range</Text>

        {/* Custom Stepper Controls */}
        <View style={styles.stepperContainer}>
          {/* Min Age Stepper */}
          <View style={styles.stepperBox}>
            <Text style={styles.stepperLabel}>Min Age</Text>
            <View style={styles.stepperControls}>
              <TouchableOpacity style={styles.stepperBtn} onPress={() => updateMin(-1)}>
                <Minus size={16} color={colors.textMainLight} />
              </TouchableOpacity>
              <TextInput
                style={styles.stepperInput}
                value={tempFilters.age_min ? tempFilters.age_min.toString() : ''}
                placeholder="0"
                placeholderTextColor={colors.textMutedLight}
                keyboardType="number-pad"
                onChangeText={(val) => setTempFilters({ ...tempFilters, age_min: val })}
              />
              <TouchableOpacity style={styles.stepperBtn} onPress={() => updateMin(1)}>
                <Plus size={16} color={colors.textMainLight} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.stepperDivider}>to</Text>

          {/* Max Age Stepper */}
          <View style={styles.stepperBox}>
            <Text style={styles.stepperLabel}>Max Age</Text>
            <View style={styles.stepperControls}>
              <TouchableOpacity style={styles.stepperBtn} onPress={() => updateMax(-1)}>
                <Minus size={16} color={colors.textMainLight} />
              </TouchableOpacity>
              <TextInput
                style={styles.stepperInput}
                value={tempFilters.age_max ? tempFilters.age_max.toString() : ''}
                placeholder="100"
                placeholderTextColor={colors.textMutedLight}
                keyboardType="number-pad"
                onChangeText={(val) => setTempFilters({ ...tempFilters, age_max: val })}
              />
              <TouchableOpacity style={styles.stepperBtn} onPress={() => updateMax(1)}>
                <Plus size={16} color={colors.textMainLight} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Demographic Brackets */}
        <Text style={[styles.subSectionTitle, { marginTop: 20 }]}>Quick Demographic Presets</Text>
        <View style={styles.presetList}>
          {demographicPresets.map((dp) => {
            const isPresetActive = tempFilters.age_min === dp.min && tempFilters.age_max === dp.max;
            return (
              <TouchableOpacity
                key={dp.label}
                style={[styles.presetChip, isPresetActive && styles.presetChipActive]}
                onPress={() => handlePreset(dp)}
              >
                <Text style={[styles.presetText, isPresetActive && styles.presetTextActive]}>{dp.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  // 6. Generic Chips Panel (Profession, City, Project Type, Duration)
  const renderGenericPanel = (activeConfig) => {
    const getOptionBadge = (key, opt) => {
      if (key === 'category') {
        const iconMap = {
          Actor: '🎭', Model: '📸', Singer: '🎤', Dancer: '💃', Writer: '📝', Director: '🎬', Technician: '🎧', All: '✨'
        };
        return iconMap[opt] || '🌟';
      }
      if (key === 'city') {
        return opt === 'All' ? '🌐' : '📍';
      }
      if (key === 'project_type') {
        const pMap = { Audition: '🎬', 'Casting call': '📢', 'Photo shoot': '📷', Shoot: '🎥', 'Freelance project/assignment': '💼', All: '✨' };
        return pMap[opt] || '🎬';
      }
      if (key === 'duration_type') {
        const dMap = { 'Full-time': '⏱', 'Part-time': '⏳', 'Date Specific': '📅', All: '✨' };
        return dMap[opt] || '⏱';
      }
      return null;
    };

    return (
      <ScrollView style={styles.rightContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>{activeConfig.label}</Text>
        <View style={styles.optionsGrid}>
          {activeConfig.options.map((opt) => {
            const val = tempFilters[activeConfig.key];
            const isSelected = Array.isArray(val) ? val.includes(opt) : val === opt;
            const badge = getOptionBadge(activeConfig.key, opt);

            const handlePress = () => {
              if (activeConfig.multiSelect) {
                let currentArr = Array.isArray(val) ? val : (val && val !== 'All' && val !== 'Any' ? [val] : []);
                if (opt === 'All' || opt === 'Any') {
                  setTempFilters({ ...tempFilters, [activeConfig.key]: opt });
                } else {
                  let newArr;
                  if (currentArr.includes(opt)) {
                    newArr = currentArr.filter(i => i !== opt);
                  } else {
                    newArr = [...currentArr, opt];
                  }
                  if (newArr.length === 0) newArr = activeConfig.options[0];
                  setTempFilters({ ...tempFilters, [activeConfig.key]: newArr });
                }
              } else {
                setTempFilters({ ...tempFilters, [activeConfig.key]: opt });
              }
            };

            return (
              <TouchableOpacity
                key={opt}
                style={[styles.richChip, isSelected && styles.richChipActive]}
                onPress={handlePress}
                activeOpacity={0.8}
              >
                {badge && <Text style={{ marginRight: 6, fontSize: 13 }}>{badge}</Text>}
                <Text style={[styles.richChipText, isSelected && styles.richChipTextActive]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  const renderRightPanel = () => {
    const activeConfig = filterConfig.find(c => c.key === activeTab);
    if (!activeConfig) return null;

    if (activeTab === 'sort_by' || activeTab === 'sort') return renderSortPanel();
    if (activeTab === 'min_budget' || activeTab === 'compensation') return renderCompensationPanel();
    if (activeTab === 'mode') return renderModePanel();
    if (activeTab === 'gender_req' || activeTab === 'gender') return renderGenderPanel();
    if (activeTab === 'age' || activeTab === 'age_range' || activeConfig.type === 'range') return renderAgePanel();

    return renderGenericPanel(activeConfig);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.headerTitle}>Filters & Sort</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={22} color={colors.textMainLight} />
            </TouchableOpacity>
          </View>

          {/* Body with Sidebar */}
          <View style={styles.body}>
            {/* Left Sidebar */}
            <View style={styles.sidebar}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {filterConfig.map((config) => {
                  const isActive = activeTab === config.key;
                  const meta = CATEGORY_META[config.key] || { icon: Briefcase, color: colors.primary, label: config.label };
                  const IconComp = meta.icon;

                  let hasValue = false;
                  if (config.type === 'range' || config.key === 'age') {
                    hasValue = (tempFilters[config.minKey || 'age_min'] && tempFilters[config.minKey || 'age_min'] !== '') || 
                               (tempFilters[config.maxKey || 'age_max'] && tempFilters[config.maxKey || 'age_max'] !== '');
                  } else {
                    const val = tempFilters[config.key];
                    if (Array.isArray(val)) {
                      hasValue = val.length > 0 && !val.includes('All') && !val.includes('Any');
                    } else {
                      hasValue = val && val !== 'All' && val !== 'Any' && val !== 'Recent';
                    }
                  }

                  return (
                    <TouchableOpacity
                      key={config.key}
                      style={[styles.tabItem, isActive && styles.tabItemActive]}
                      onPress={() => setActiveTab(config.key)}
                      activeOpacity={0.7}
                    >
                      <View 
                        style={[
                          styles.tabIconWrapper, 
                          isActive 
                            ? { backgroundColor: meta.color, elevation: 3, shadowColor: meta.color, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.35, shadowRadius: 4 }
                            : { backgroundColor: meta.color + '18', borderWidth: 1, borderColor: meta.color + '30' }
                        ]}
                      >
                        <IconComp size={15} color={isActive ? '#FFFFFF' : meta.color} strokeWidth={2.2} />
                      </View>
                      <Text 
                        style={[
                          styles.tabText, 
                          isActive && [styles.tabTextActive, { color: colors.textMainLight, fontWeight: '700' }]
                        ]} 
                        numberOfLines={1}
                      >
                        {config.label}
                      </Text>
                      {hasValue && <View style={[styles.dotIndicator, { backgroundColor: meta.color }]} />}
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
            <TouchableOpacity style={styles.clearBtn} onPress={handleClear} activeOpacity={0.8}>
              <Text style={styles.clearBtnText}>Reset All</Text>
            </TouchableOpacity>
            <CustomButton title="Apply Filters" onPress={handleApply} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (colors, insets) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.backgroundLight,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: SCREEN_HEIGHT * 0.78,
    paddingBottom: Math.max(insets.bottom, 20),
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.backgroundLight,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textMainLight,
    fontWeight: '800',
    fontSize: 18,
  },
  closeBtn: {
    padding: 4,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: '38%',
    backgroundColor: colors.surfaceLight,
    borderRightWidth: 1,
    borderRightColor: colors.borderLight,
  },
  tabItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  tabItemActive: {
    backgroundColor: colors.backgroundLight,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  tabIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  tabText: {
    fontSize: 12.5,
    color: colors.textMutedLight,
    fontWeight: '500',
    flex: 1,
  },
  tabTextActive: {
    fontWeight: '700',
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 4,
  },
  contentPane: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  rightContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMainLight,
    marginBottom: 14,
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMutedLight,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardList: {
    gap: 10,
  },
  richCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    position: 'relative',
  },
  richCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '0D',
  },
  richCardIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tierEmojiWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  richCardTextWrapper: {
    flex: 1,
  },
  richCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMainLight,
  },
  richCardTitleActive: {
    color: colors.primary,
  },
  richCardDesc: {
    fontSize: 11,
    color: colors.textMutedLight,
    marginTop: 2,
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  genderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  genderCard: {
    width: '47%',
    padding: 12,
    borderRadius: 14,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    alignItems: 'center',
    position: 'relative',
  },
  genderCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '0D',
  },
  genderBadgeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  genderCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMainLight,
    textAlign: 'center',
  },
  genderCardLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  checkBadgeMini: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceLight,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  stepperBox: {
    flex: 1,
    alignItems: 'center',
  },
  stepperLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMutedLight,
    marginBottom: 6,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperInput: {
    width: 40,
    height: 32,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: colors.textMainLight,
    paddingVertical: 0,
  },
  stepperDivider: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMutedLight,
    marginHorizontal: 8,
  },
  presetList: {
    gap: 8,
  },
  presetChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  presetChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '12',
  },
  presetText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMainLight,
  },
  presetTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  richChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceLight,
    marginBottom: 6,
  },
  richChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
  },
  richChipText: {
    fontSize: 12.5,
    color: colors.textMutedLight,
    fontWeight: '500',
  },
  richChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.backgroundLight,
  },
  clearBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 10,
  },
  clearBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMainLight,
  },
});
