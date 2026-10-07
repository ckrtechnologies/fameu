import { showError, showSuccess } from '../../utils/toast';
import { GlobalAlert } from '../../components/core/GlobalAlert';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  Animated,
  Easing,
  Platform,
  ScrollView,
  Dimensions,
  BackHandler,
} from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useNavigation } from '@react-navigation/native';
import { AnimatedTileGrid } from '../../components/forms/AnimatedTileGrid';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { pick, types, errorCodes, isErrorWithCode } from '@react-native-documents/picker';
import {
  PROJECT_TYPES,
  DURATION_TYPES,
  GENDERS,
  LANGUAGES,
  SKILLS,
  AUDITION_REQUIRED_OPTIONS,
  COMPENSATION_FREQUENCIES,
  AUDITION_MODES as AUDITION_MODES_LIST,
  DEFAULT_CATEGORIES_FALLBACK,
  INDIAN_CITIES,
} from '../../constants/masterData';
import { AUDITION_FORM_PLACEHOLDERS } from '../../constants/formPlaceholders';
import { formatINRRange } from '../../utils/currencyUtils';

import { typography, spacing, globalStyles } from '../../theme/theme';
import { useSelector } from 'react-redux';
import { uploadFileWithProgress } from '../../utils/uploadUtils';
import ProgressBar from '../../components/core/ProgressBar';
import { useCreateAuditionMutation, useUpdateAuditionMutation } from '../../services/auditionApi';
import { useGetProfessionsQuery } from '../../services/profileApi';
import { useGetCitiesQuery } from '../../services/lookupsApi';
import { useTheme } from '../../theme/ThemeProvider';
import { ProfessionCategoryIcon } from '../../components/icons/professions';
import {
  StepBasicInfoIcon,
  StepRoleCriteriaIcon,
  StepBudgetTermsIcon,
  StepLogisticsMediaIcon,
  ListingTypeAuditionIcon,
  ListingTypeJobIcon,
  ListingTypeCastingCallIcon
} from '../../components/icons/wizard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const getTodayDateStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getFutureDateStr = (days = 30) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateDisplay = (dateStr) => {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
};

export default function CreateAuditionScreen({ route }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const editAudition = route?.params?.audition;
  const isEditMode = !!editAudition;

  const [currentStep, setCurrentStep] = useState(1);
  const progressAnim = useRef(new Animated.Value(0.25)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef(null);

  const [createAudition, { isLoading: isCreating }] = useCreateAuditionMutation();
  const [updateAudition, { isLoading: isUpdating }] = useUpdateAuditionMutation();

  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [thumbnailProgress, setThumbnailProgress] = useState(0);

  const token = useSelector(state => state.auth.token);
  const { data: professionsResponse } = useGetProfessionsQuery();
  const isLoading = isCreating || isUpdating || isUploadingPdf || isUploadingThumbnail;

  const [form, setForm] = useState({
    job_type: editAudition?.job_type || 'Audition', // 'Audition' | 'Job' | 'Casting Call'
    title: editAudition?.title || '',
    role_description: editAudition?.role_description || '',
    category: editAudition?.category ? editAudition.category.split(', ') : [],
    other_categories: editAudition?.other_categories ? editAudition.other_categories.split(', ') : [],
    project_type: editAudition?.project_type ? editAudition.project_type.split(', ') : ['Web-series'],
    city: editAudition?.city || 'Mumbai',
    job_location: editAudition?.job_location || '',
    duration_type: editAudition?.duration_type || 'Full-time',
    specific_start_date: editAudition?.specific_start_date || '',
    specific_end_date: editAudition?.specific_end_date || '',
    gender_req: editAudition?.gender_req || 'Any',
    budget_min: editAudition?.budget_min ? String(editAudition.budget_min) : '',
    budget_max: editAudition?.budget_max ? String(editAudition.budget_max) : '',
    budget: editAudition?.budget || '',
    compensation_frequency: editAudition?.compensation_frequency || 'One Time',
    languages: editAudition?.languages ? (Array.isArray(editAudition.languages) ? editAudition.languages : String(editAudition.languages).split(', ')) : ['Hindi', 'English'],
    skills: editAudition?.skills ? (Array.isArray(editAudition.skills) ? editAudition.skills : String(editAudition.skills).split(', ')) : ['Acting'],
    vacancies: editAudition?.vacancies ? String(editAudition.vacancies) : '1',
    is_audition_required: editAudition?.is_audition_required !== undefined ? (editAudition.is_audition_required ? 'Yes (Audition Required)' : 'No') : 'Yes (Audition Required)',
    valid_from: editAudition?.valid_from || getTodayDateStr(),
    valid_till: editAudition?.valid_till || editAudition?.expiry_date || getFutureDateStr(30),
    job_validity_days: editAudition?.job_validity_days ? String(editAudition.job_validity_days) : '30',
    expiry_date: editAudition?.expiry_date || editAudition?.valid_till || getFutureDateStr(30),
    tags: editAudition?.tags ? (Array.isArray(editAudition.tags) ? editAudition.tags.join(', ') : String(editAudition.tags)) : '',
    age_min: editAudition?.age_min ? String(editAudition.age_min) : '18',
    age_max: editAudition?.age_max ? String(editAudition.age_max) : '35',
    mode: editAudition?.mode || 'Offline',
    video_link: editAudition?.video_link || '',
    script_text: editAudition?.script_text || editAudition?.script || '',
    description_pdf_url: editAudition?.description_pdf_url || null,
    thumbnail_url: editAudition?.thumbnail_url || null,
    audition_type: (editAudition?.audition_type === 'walkin' ? 'Walk-in' :
      editAudition?.audition_type === 'scheduled' ? 'Scheduled' :
        editAudition?.audition_type === 'online' ? 'Online' : 'Walk-in'),
    walk_in_venue: editAudition?.venue_address || '',
    walk_in_date: editAudition?.audition_date || '',
    walk_in_time: editAudition?.audition_time || '10:00 AM',
    latitude: editAudition?.lat ? String(editAudition.lat) : '19.0760',
    longitude: editAudition?.lng ? String(editAudition.lng) : '72.8777',
  });

  const dynamicCategories = (professionsResponse?.data || []).map(p => p.name);
  const CATEGORIES = dynamicCategories.length > 0 ? dynamicCategories : DEFAULT_CATEGORIES_FALLBACK;

  const TYPES = AUDITION_MODES_LIST;
  const JOB_TYPES = [
    { id: 'Audition', title: 'Audition', subtitle: 'On-camera / stage audition', icon: ListingTypeAuditionIcon },
    { id: 'Job', title: 'Job', subtitle: 'Crew & production role', icon: ListingTypeJobIcon },
    { id: 'Casting Call', title: 'Casting Call', subtitle: 'Open public talent call', icon: ListingTypeCastingCallIcon }
  ];
  const { data: dynamicCities } = useGetCitiesQuery();
  const CITIES = Array.isArray(dynamicCities) && dynamicCities.length > 0 ? dynamicCities : INDIAN_CITIES;

  const STEPS = [
    { number: 1, title: 'Basic Info', subtitle: 'Project & Category', IconComponent: StepBasicInfoIcon },
    { number: 2, title: 'Role & Criteria', subtitle: 'Role breakdown & skills', IconComponent: StepRoleCriteriaIcon },
    { number: 3, title: 'Budget & Terms', subtitle: 'Pay, validity & duration', IconComponent: StepBudgetTermsIcon },
    { number: 4, title: 'Logistics & Media', subtitle: 'Venue, schedule & script', IconComponent: StepLogisticsMediaIcon },
  ];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const formatCategoryTitle = (name) => {
    if (!name) return '';
    return String(name)
      .toLowerCase()
      .split(' ')
      .map(w => {
        if (['vj', 'rj', 'dop', 'vfx'].includes(w)) return w.toUpperCase();
        return w.charAt(0).toUpperCase() + w.slice(1);
      })
      .join(' ');
  };

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [showCityModal, setShowCityModal] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [activeDatePicker, setActiveDatePicker] = useState(null); // 'start', 'end', 'walk_in', 'expiry'

  const filteredCategories = CATEGORIES.filter(c => c.toLowerCase().includes(categorySearch.toLowerCase()));

  const animateToStep = (stepNumber) => {
    setCurrentStep(stepNumber);
    scrollViewRef.current?.scrollTo?.({ y: 0, animated: true });
  };

  const validateStep = (step) => {
    if (step === 1) {
      if (!form.title?.trim()) {
        showError('Required Field', 'Please enter a Job / Audition Title.');
        return false;
      }
      if (!form.category || form.category.length === 0) {
        showError('Required Field', 'Please select at least one Primary Category.');
        return false;
      }
      if (!form.project_type || form.project_type.length === 0) {
        showError('Required Field', 'Please select at least one Project Type.');
        return false;
      }
      if (!form.city?.trim()) {
        showError('Required Field', 'Please select a Primary City from the list.');
        return false;
      }
      if (!CITIES.some(c => c.toLowerCase() === form.city.trim().toLowerCase())) {
        showError('Invalid City', 'The selected city is not in the recognized cities list. Please select a valid city.');
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!form.role_description?.trim()) {
        showError('Required Field', 'Please describe the character / role breakdown.');
        return false;
      }
      return true;
    }
    if (step === 3) {
      if (form.duration_type === 'Date Specific' && (!form.specific_start_date || !form.specific_end_date)) {
        showError('Date Range Required', 'Please choose both Start and End dates.');
        return false;
      }
      if (!form.valid_from) {
        showError('Validity Required', 'Please choose a Validity From date.');
        return false;
      }
      if (!form.valid_till) {
        showError('Validity Required', 'Please choose a Validity Till date.');
        return false;
      }
      if (new Date(form.valid_till) < new Date(form.valid_from)) {
        showError('Invalid Validity Range', 'Validity Till date cannot be earlier than Validity From date.');
        return false;
      }
      return true;
    }
    if (step === 4) {
      const isAuditionReq = form.is_audition_required && form.is_audition_required.startsWith('Yes');
      if (isAuditionReq && (form.audition_type === 'Walk-in' || form.audition_type === 'Scheduled')) {
        if (!form.walk_in_venue?.trim()) {
          showError('Venue Required', 'Please provide the Venue Address for the audition.');
          return false;
        }
        if (!form.walk_in_date) {
          showError('Date Required', 'Please provide the Audition Date.');
          return false;
        }
      }
      return true;
    }
    return true;
  };

  const handleApplyPresetValidity = (days) => {
    const numDays = Number(days) || 30;
    const baseStr = form.valid_from ? form.valid_from.replace(/-/g, '/') : null;
    const baseDate = baseStr ? new Date(baseStr) : new Date();
    const targetDate = new Date(baseDate);
    targetDate.setDate(targetDate.getDate() + numDays);
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const formatted = `${year}-${month}-${day}`;
    setForm(prev => ({
      ...prev,
      valid_till: formatted,
      expiry_date: formatted,
      job_validity_days: String(numDays)
    }));
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        animateToStep(currentStep + 1);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      animateToStep(currentStep - 1);
    }
  };

  const handleBackPress = () => {
    if (currentStep > 1) {
      animateToStep(currentStep - 1);
      return true;
    }
    const isDirty = !isEditMode && !!(form.title?.trim() || form.role_description?.trim() || form.job_location?.trim());
    if (isDirty) {
      GlobalAlert.show(
        'Discard Draft?',
        'You have unsaved changes in this casting call. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
        ],
        { type: 'warning' }
      );
      return true;
    }
    navigation.goBack();
    return true;
  };

  useEffect(() => {
    const backSub = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backSub.remove();
  }, [currentStep, form, isEditMode]);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formatted = `${year}-${month}-${day}`;
      if (activeDatePicker === 'walk_in') {
        handleChange('walk_in_date', formatted);
      } else if (activeDatePicker === 'start') {
        handleChange('specific_start_date', formatted);
      } else if (activeDatePicker === 'end') {
        handleChange('specific_end_date', formatted);
      } else if (activeDatePicker === 'expiry') {
        handleChange('expiry_date', formatted);
        handleChange('valid_till', formatted);
      } else if (activeDatePicker === 'valid_from') {
        handleChange('valid_from', formatted);
      } else if (activeDatePicker === 'valid_till') {
        handleChange('valid_till', formatted);
        handleChange('expiry_date', formatted);
      }
      setActiveDatePicker(null);
    }
  };

  const handleTimeChange = (event, selectedDate) => {
    setShowTimePicker(false);
    if (selectedDate) {
      let hours = selectedDate.getHours();
      let minutes = selectedDate.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      handleChange('walk_in_time', `${hours}:${minutes} ${ampm}`);
    }
  };

  const handlePdfUpload = async () => {
    try {
      const res = await pick({ type: [types.pdf] });
      const file = res[0];

      const formData = new FormData();
      formData.append('pdf', {
        uri: file.uri,
        type: file.type,
        name: file.name || 'description.pdf',
      });

      setIsUploadingPdf(true);
      setPdfProgress(0);
      try {
        const uploadRes = await uploadFileWithProgress('/hiring_app/auditions/upload-pdf', formData, (progress) => {
          setPdfProgress(progress);
        }, token);

        if (uploadRes?.data?.url) {
          handleChange('description_pdf_url', uploadRes.data.url);
          showSuccess('', 'PDF uploaded successfully!');
        }
      } catch (uploadErr) {
        showError('', 'Failed to upload PDF');
        console.error(uploadErr);
      } finally {
        setIsUploadingPdf(false);
      }
    } catch (err) {
      if (!(isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED)) {
        showError('', 'Failed to pick PDF');
        console.error(err);
      }
    }
  };

  const handleThumbnailUpload = async () => {
    try {
      const res = await pick({ type: [types.images] });
      const file = res[0];

      const formData = new FormData();
      formData.append('thumbnail', {
        uri: file.uri,
        type: file.type,
        name: file.name || 'thumbnail.jpg',
      });

      setIsUploadingThumbnail(true);
      setThumbnailProgress(0);

      try {
        const uploadRes = await uploadFileWithProgress('/hiring_app/auditions/upload-thumbnail', formData, (progress) => {
          setThumbnailProgress(progress);
        }, token);

        if (uploadRes?.data?.url) {
          handleChange('thumbnail_url', uploadRes.data.url);
          showSuccess('', 'Thumbnail uploaded successfully!');
        }
      } catch (uploadErr) {
        showError('', 'Failed to upload Thumbnail');
        console.error(uploadErr);
      } finally {
        setIsUploadingThumbnail(false);
      }
    } catch (err) {
      if (!(isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED)) {
        showError('', 'Failed to pick Thumbnail');
        console.error(err);
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      return;
    }

    const isAuditionReq = form.is_audition_required && form.is_audition_required.startsWith('Yes');

    try {
      const typeMap = {
        'Walk-in': 'walkin',
        'Scheduled': 'scheduled',
        'Online': 'online'
      };

      const finalBudget = (form.budget_min || form.budget_max)
        ? formatINRRange(form.budget_min, form.budget_max)
        : form.budget || 'Unspecified';

      const payload = {
        title: form.title.trim(),
        role_description: form.role_description.trim(),
        character_req: form.role_description.trim(),
        category: form.category.join(', '),
        project_type: form.project_type.join(', '),
        city: form.city,
        duration_type: form.duration_type,
        specific_start_date: form.duration_type === 'Date Specific' ? form.specific_start_date : null,
        specific_end_date: form.duration_type === 'Date Specific' ? form.specific_end_date : null,
        gender_req: form.gender_req,
        budget: finalBudget,
        compensation_frequency: form.compensation_frequency,
        languages: form.languages,
        skills: form.skills,
        vacancies: parseInt(form.vacancies) || 1,
        is_audition_required: isAuditionReq,
        tags: form.tags,
        age_min: parseInt(form.age_min) || 0,
        age_max: parseInt(form.age_max) || 75,
        mode: form.mode,
        video_link: form.video_link,
        script_text: form.script_text ? form.script_text.trim() : null,
        description_pdf_url: form.description_pdf_url,
        thumbnail_url: form.thumbnail_url,
        audition_type: isAuditionReq ? (typeMap[form.audition_type] || form.audition_type) : 'online',
        valid_from: form.valid_from,
        valid_till: form.valid_till,
        expiry_date: form.valid_till,
        job_validity_days: form.job_validity_days,
      };

      if (isAuditionReq && (form.audition_type === 'Walk-in' || form.audition_type === 'Scheduled')) {
        payload.venue_address = form.walk_in_venue || form.city;
        payload.audition_date = form.walk_in_date || form.valid_from || new Date().toISOString().split('T')[0];
        payload.date = form.walk_in_date || form.valid_from || new Date().toISOString().split('T')[0];
        payload.audition_time = form.walk_in_time || '10:00 AM';
        payload.lat = parseFloat(form.latitude) || 19.0760;
        payload.lng = parseFloat(form.longitude) || 72.8777;
      } else {
        payload.venue_address = form.walk_in_venue || form.city;
        payload.audition_date = form.valid_from || new Date().toISOString().split('T')[0];
        payload.date = form.valid_from || new Date().toISOString().split('T')[0];
        payload.audition_time = form.walk_in_time || '10:00 AM';
      }

      if (isEditMode) {
        await updateAudition({ id: editAudition.id, ...payload }).unwrap();
        showSuccess('', 'Audition updated successfully!');
        setTimeout(() => {
          navigation.navigate('Drawer', { screen: 'Tabs', params: { screen: 'MyAuditions' } });
        }, 800);
      } else {
        await createAudition(payload).unwrap();
        showSuccess('', 'Audition created successfully!');
        setTimeout(() => {
          navigation.navigate('Drawer', { screen: 'Tabs', params: { screen: 'MyAuditions' } });
        }, 800);
      }
    } catch (err) {
      console.error('Failed to save audition:', err);
      GlobalAlert.showError(
        isEditMode ? 'Unable to Update Audition' : 'Unable to Post Audition',
        err,
        'Your audition details could not be saved to the system.'
      );
    }
  };

  const activeStepData = STEPS[currentStep - 1];

  return (
    <View style={[globalStyles.container, { backgroundColor: colors.backgroundLight }]}>
      {/* Top Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.headerIcon || '#FFFFFF'} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{isEditMode ? 'Edit Casting Call' : 'Post New Audition'}</Text>
          <Text style={styles.headerSubtitle}>Complete all 4 steps to broadcast</Text>
        </View>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>{currentStep}/4</Text>
        </View>
      </View>

      {/* Ultra-Rich 3D Step Overview Header */}
      <View style={styles.wizardHeaderContainer}>
        {/* Step Nodes Row with Connected Timeline */}
        <View style={styles.stepNodesWrapper}>
          <View style={styles.stepsLineBackground} />
          <View
            style={[
              styles.stepsLineFill,
              {
                width: currentStep === 1 ? '0%' : currentStep === 2 ? '33%' : currentStep === 3 ? '66%' : '85%',
              }
            ]}
          />

          {/* 4 Step Visual Nodes */}
          <View style={styles.stepNodesRow}>
            {STEPS.map((step) => {
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              const { IconComponent } = step;

              return (
                <TouchableOpacity
                  key={step.number}
                  style={styles.stepNodeItem}
                  onPress={() => {
                    if (isCompleted || validateStep(currentStep)) {
                      animateToStep(step.number);
                    }
                  }}
                  activeOpacity={0.85}
                >
                  <View
                    style={[
                      styles.stepIconBubble,
                      isActive && styles.stepIconBubbleActive,
                      isCompleted && styles.stepIconBubbleCompleted,
                    ]}
                  >
                    <IconComponent size={24} active={isActive} completed={isCompleted} />
                    {isCompleted && (
                      <View style={styles.completedMiniBadge}>
                        <Icon name="checkmark-sharp" size={10} color="#FFFFFF" />
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepNodeTitle,
                      isActive && styles.stepNodeTitleActive,
                      isCompleted && styles.stepNodeTitleCompleted,
                    ]}
                    numberOfLines={1}
                  >
                    {step.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Current Active Step Banner */}
        <View style={styles.activeStepBanner}>
          <View style={styles.activeStepBannerLeft}>
            <View style={styles.activeStepBannerPill}>
              <Text style={styles.activeStepBannerPillText}>STEP {currentStep}</Text>
            </View>
            <View>
              <Text style={styles.activeStepBannerTitle}>{activeStepData.title}</Text>
              <Text style={styles.activeStepBannerSubtitle}>{activeStepData.subtitle}</Text>
            </View>
          </View>
          <View style={styles.progressPercentPill}>
            <Text style={styles.progressPercentText}>{currentStep * 25}%</Text>
          </View>
        </View>
      </View>

      <KeyboardAwareScrollView
        ref={scrollViewRef}
        mode={Platform.OS === 'android' ? 'layout' : 'insets'}
        bottomOffset={80}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ==================== STEP 1: BASIC INFO ==================== */}
        {currentStep === 1 && (
          <View style={styles.stepSection}>
            {/* Listing Type 3D Cards */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionHeading}>1. Select Listing Type *</Text>
              <Text style={styles.sectionSubheading}>Choose the classification for this opportunity</Text>

              <View style={styles.jobTypeCardsRow}>
                {JOB_TYPES.map((type) => {
                  const isSelected = form.job_type === type.id;
                  const IconComp = type.icon;
                  return (
                    <TouchableOpacity
                      key={type.id}
                      style={[styles.jobTypeCard, isSelected && styles.jobTypeCardSelected]}
                      onPress={() => handleChange('job_type', type.id)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.jobTypeIconContainer, isSelected && styles.jobTypeIconContainerSelected]}>
                        <IconComp size={30} />
                      </View>
                      <Text style={[styles.jobTypeTitle, isSelected && styles.jobTypeTitleSelected]}>
                        {type.title}
                      </Text>
                      <Text style={styles.jobTypeSubtitle} numberOfLines={2}>
                        {type.subtitle}
                      </Text>
                      {isSelected && (
                        <View style={styles.jobTypeSelectedBadge}>
                          <Icon name="checkmark-circle" size={16} color={colors.primary} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Job / Audition Title & Category */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionHeading}>2. Project & Category Details</Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Job / Audition Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder={AUDITION_FORM_PLACEHOLDERS.TITLE}
                  placeholderTextColor={colors.textMutedLight}
                  value={form.title}
                  onChangeText={(text) => handleChange('title', text)}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Primary Category *</Text>
                <TouchableOpacity
                  style={[styles.input, styles.selectorInput]}
                  onPress={() => setShowCategoryModal(true)}
                  activeOpacity={0.75}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={styles.categoryInputIconCircle}>
                      <ProfessionCategoryIcon categoryName={form.category[0] || 'Actor'} size={20} />
                    </View>
                    <Text style={{
                      color: form.category.length > 0 ? colors.textMainLight : colors.textMutedLight,
                      fontWeight: form.category.length > 0 ? '700' : '400',
                      fontSize: 15,
                      flex: 1,
                    }} numberOfLines={1}>
                      {form.category.length > 0 ? form.category.map(formatCategoryTitle).join(', ') : "Select Primary Category"}
                    </Text>
                  </View>
                  <Icon name="chevron-down-circle" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Project Type Grid */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionHeading}>3. Project Classification *</Text>
              <Text style={styles.sectionSubheading}>Select all production types that apply</Text>
              <AnimatedTileGrid
                options={PROJECT_TYPES}
                selectedValue={form.project_type}
                onSelect={(val) => handleChange('project_type', val)}
                isMulti
              />
            </View>

            {/* Job Location / City */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionHeading}>4. Shoot / Job Location *</Text>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Primary City *</Text>
                <TouchableOpacity
                  style={[styles.input, styles.selectorInput, { marginBottom: spacing.m }]}
                  onPress={() => setShowCityModal(true)}
                  activeOpacity={0.75}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={[styles.categoryInputIconCircle, { backgroundColor: colors.primary + '15' }]}>
                      <Icon name="location" size={18} color={colors.primary} />
                    </View>
                    <Text style={{ color: colors.textMainLight, fontWeight: '700', fontSize: 15 }}>
                      {form.city}
                    </Text>
                  </View>
                  <Icon name="chevron-down-circle" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Specific Shoot Location / Studio (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder={AUDITION_FORM_PLACEHOLDERS.PROJECT_LOCATION}
                  placeholderTextColor={colors.textMutedLight}
                  value={form.job_location}
                  onChangeText={(text) => handleChange('job_location', text)}
                />
              </View>
            </View>
          </View>
        )}

        {/* ==================== STEP 2: ROLE & TALENT CRITERIA ==================== */}
        {currentStep === 2 && (
          <View style={styles.stepSection}>
            {/* Role & Requirements Description */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionHeading}>1. Character Breakdown & Brief *</Text>
              <Text style={styles.sectionSubheading}>Describe scene context, physical look, traits & dialogue</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={AUDITION_FORM_PLACEHOLDERS.ROLE_DESCRIPTION}
                placeholderTextColor={colors.textMutedLight}
                multiline
                numberOfLines={4}
                value={form.role_description}
                onChangeText={(text) => handleChange('role_description', text)}
              />
            </View>

            {/* Vacancies & Age Range */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionHeading}>2. Vacancies & Target Age Group</Text>
              <View style={styles.row}>
                <View style={[styles.formGroup, { width: '40%' }]}>
                  <Text style={styles.label}>Open Positions</Text>
                  <View style={styles.stepperContainer}>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => {
                        const current = parseInt(form.vacancies) || 1;
                        if (current > 1) handleChange('vacancies', String(current - 1));
                      }}
                    >
                      <Icon name="remove" size={16} color={colors.textMainLight} />
                    </TouchableOpacity>
                    <Text style={styles.stepperValue}>{form.vacancies}</Text>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => {
                        const current = parseInt(form.vacancies) || 1;
                        handleChange('vacancies', String(current + 1));
                      }}
                    >
                      <Icon name="add" size={16} color={colors.textMainLight} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={[styles.formGroup, { width: '56%' }]}>
                  <Text style={styles.label}>Target Age Range (Yrs)</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TextInput
                      style={[styles.input, { flex: 1, textAlign: 'center', fontWeight: '700' }]}
                      placeholder={AUDITION_FORM_PLACEHOLDERS.AGE_MIN}
                      placeholderTextColor={colors.textMutedLight}
                      keyboardType="numeric"
                      value={form.age_min}
                      onChangeText={(text) => handleChange('age_min', text)}
                    />
                    <Text style={{ marginHorizontal: 8, color: colors.textMutedLight, fontWeight: '700' }}>—</Text>
                    <TextInput
                      style={[styles.input, { flex: 1, textAlign: 'center', fontWeight: '700' }]}
                      placeholder={AUDITION_FORM_PLACEHOLDERS.AGE_MAX}
                      placeholderTextColor={colors.textMutedLight}
                      keyboardType="numeric"
                      value={form.age_max}
                      onChangeText={(text) => handleChange('age_max', text)}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Gender Requirement */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionHeading}>3. Gender Requirement *</Text>
              <AnimatedTileGrid
                options={GENDERS}
                selectedValue={form.gender_req}
                onSelect={(val) => handleChange('gender_req', val)}
              />
            </View>

            {/* Required Skills */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionHeading}>4. Required Skills & Performance Expertise</Text>
              <AnimatedTileGrid
                options={SKILLS}
                selectedValue={form.skills}
                onSelect={(val) => handleChange('skills', val)}
                isMulti
              />
            </View>

            {/* Preferred Languages */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionHeading}>5. Dialogue & Script Languages</Text>
              <AnimatedTileGrid
                options={LANGUAGES}
                selectedValue={form.languages}
                onSelect={(val) => handleChange('languages', val)}
                isMulti
              />
            </View>
          </View>
        )}

        {/* ==================== STEP 3: BUDGET & TERMS ==================== */}
        {currentStep === 3 && (
          <View style={styles.stepSection}>
            {/* Budget Range (From - To) */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionHeading}>1. Remuneration / Compensation Range</Text>
              <Text style={styles.sectionSubheading}>Provide an estimated budget range in Indian Rupees (₹)</Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.s }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.miniLabel}>MIN BUDGET (₹)</Text>
                  <TextInput
                    style={[styles.input, { fontWeight: '700', fontSize: 16 }]}
                    placeholder={AUDITION_FORM_PLACEHOLDERS.BUDGET_MIN}
                    placeholderTextColor={colors.textMutedLight}
                    keyboardType="numeric"
                    value={form.budget_min}
                    onChangeText={(text) => handleChange('budget_min', text)}
                  />
                </View>
                <Text style={{ marginHorizontal: 12, color: colors.textMutedLight, fontWeight: '900', marginTop: 16 }}>—</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.miniLabel}>MAX BUDGET (₹)</Text>
                  <TextInput
                    style={[styles.input, { fontWeight: '700', fontSize: 16 }]}
                    placeholder={AUDITION_FORM_PLACEHOLDERS.BUDGET_MAX}
                    placeholderTextColor={colors.textMutedLight}
                    keyboardType="numeric"
                    value={form.budget_max}
                    onChangeText={(text) => handleChange('budget_max', text)}
                  />
                </View>
              </View>
            </View>

            {/* Compensation Frequency */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionHeading}>2. Payment Frequency *</Text>
              <AnimatedTileGrid
                options={COMPENSATION_FREQUENCIES}
                selectedValue={form.compensation_frequency}
                onSelect={(val) => handleChange('compensation_frequency', val)}
              />
            </View>

            {/* Duration Type */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionHeading}>3. Engagement Duration *</Text>
              <AnimatedTileGrid
                options={DURATION_TYPES}
                selectedValue={form.duration_type}
                onSelect={(val) => handleChange('duration_type', val)}
              />

              {/* Date Specific Pickers */}
              {form.duration_type === 'Date Specific' && (
                <View style={[styles.row, { marginTop: spacing.m }]}>
                  <View style={[styles.formGroup, { width: '48%' }]}>
                    <Text style={styles.label}>Shoot Start Date *</Text>
                    <TouchableOpacity
                      style={[styles.input, styles.selectorInput]}
                      onPress={() => {
                        setActiveDatePicker('start');
                        setShowDatePicker(true);
                      }}
                    >
                      <Text style={{ color: form.specific_start_date ? colors.textMainLight : colors.textMutedLight, fontWeight: '700' }}>
                        {form.specific_start_date || 'YYYY-MM-DD'}
                      </Text>
                      <Icon name="calendar" size={18} color={colors.primary} />
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.formGroup, { width: '48%' }]}>
                    <Text style={styles.label}>Shoot End Date *</Text>
                    <TouchableOpacity
                      style={[styles.input, styles.selectorInput]}
                      onPress={() => {
                        setActiveDatePicker('end');
                        setShowDatePicker(true);
                      }}
                    >
                      <Text style={{ color: form.specific_end_date ? colors.textMainLight : colors.textMutedLight, fontWeight: '700' }}>
                        {form.specific_end_date || 'YYYY-MM-DD'}
                      </Text>
                      <Icon name="calendar" size={18} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* Casting Post Validity */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionHeading}>4. Casting Post Validity *</Text>
              <Text style={[styles.helpText, { marginBottom: spacing.s }]}>
                Specify the date range during which artists can view and apply for this post.
              </Text>

              <View style={[styles.row, { marginTop: spacing.xs }]}>
                <View style={[styles.formGroup, { width: '48%' }]}>
                  <Text style={styles.label}>Valid From *</Text>
                  <TouchableOpacity
                    style={[styles.input, styles.selectorInput]}
                    onPress={() => {
                      setActiveDatePicker('valid_from');
                      setShowDatePicker(true);
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 4 }}>
                      <Icon name="calendar-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                      <Text style={{ color: form.valid_from ? colors.textMainLight : colors.textMutedLight, fontWeight: '700', fontSize: 13 }} numberOfLines={1}>
                        {formatDateDisplay(form.valid_from) || 'From Date'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                <View style={[styles.formGroup, { width: '48%' }]}>
                  <Text style={styles.label}>Valid Till (Closes On) *</Text>
                  <TouchableOpacity
                    style={[styles.input, styles.selectorInput]}
                    onPress={() => {
                      setActiveDatePicker('valid_till');
                      setShowDatePicker(true);
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 4 }}>
                      <Icon name="time-outline" size={16} color="#F59E0B" style={{ marginRight: 6 }} />
                      <Text style={{ color: form.valid_till ? colors.textMainLight : colors.textMutedLight, fontWeight: '700', fontSize: 13 }} numberOfLines={1}>
                        {formatDateDisplay(form.valid_till) || 'Till Date'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Quick Presets */}
              <View style={{ marginTop: spacing.xs }}>
                <Text style={[styles.label, { fontSize: 11, color: colors.textMutedLight, marginBottom: 6 }]}>Quick Duration Presets:</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {[7, 15, 30, 45, 60].map((days) => {
                    const isSelected = form.valid_from && form.valid_till && (() => {
                      const diffTime = Math.abs(new Date(form.valid_till) - new Date(form.valid_from));
                      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                      return diffDays === days;
                    })();
                    return (
                      <TouchableOpacity
                        key={days}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 20,
                          backgroundColor: isSelected ? colors.primary + '20' : colors.surfaceLight,
                          borderWidth: 1,
                          borderColor: isSelected ? colors.primary : colors.borderLight,
                        }}
                        onPress={() => handleApplyPresetValidity(days)}
                      >
                        <Text style={{ fontSize: 12, fontWeight: isSelected ? '700' : '500', color: isSelected ? colors.primary : colors.textMainLight }}>
                          +{days} Days
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Search Tags */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionHeading}>5. Search Tags & Keywords (Optional)</Text>
              <TextInput
                style={[styles.input, { marginTop: spacing.s }]}
                placeholder={AUDITION_FORM_PLACEHOLDERS.TAGS}
                placeholderTextColor={colors.textMutedLight}
                value={form.tags}
                onChangeText={(text) => handleChange('tags', text)}
              />
            </View>
          </View>
        )}

        {/* ==================== STEP 4: LOGISTICS & MEDIA ==================== */}
        {currentStep === 4 && (
          <View style={styles.stepSection}>
            {/* Audition Required? */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionHeading}>1. Audition Screening Type *</Text>
              <AnimatedTileGrid
                options={AUDITION_REQUIRED_OPTIONS}
                selectedValue={form.is_audition_required}
                onSelect={(val) => handleChange('is_audition_required', val)}
              />
              {!form.is_audition_required?.startsWith('Yes') && (
                <Text style={[styles.helpText, { marginTop: spacing.s }]}>
                  Direct application: Candidates will apply directly with their portfolio and profile. No offline audition required.
                </Text>
              )}
            </View>

            {/* Audition Mode & Logistics - Only when Audition is Required */}
            {form.is_audition_required?.startsWith('Yes') && (
              <>
                <View style={styles.cardSection}>
                  <Text style={styles.sectionHeading}>2. Audition Execution Mode *</Text>
                  <AnimatedTileGrid
                    options={TYPES}
                    selectedValue={form.audition_type}
                    onSelect={(val) => handleChange('audition_type', val)}
                  />
                </View>

                {/* Walk-in Logistics Details */}
                {(form.audition_type === 'Walk-in' || form.audition_type === 'Scheduled') && (
                  <View style={styles.cardSection}>
                    <View style={styles.walkInHeader}>
                      <View style={[styles.categoryInputIconCircle, { backgroundColor: colors.primary + '20' }]}>
                        <Icon name="location" size={20} color={colors.primary} />
                      </View>
                      <Text style={styles.walkInTitle}>{form.audition_type} Venue & Schedule Details</Text>
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Venue Complete Address *</Text>
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder={AUDITION_FORM_PLACEHOLDERS.STUDIO_ADDRESS}
                        placeholderTextColor={colors.textMutedLight}
                        multiline
                        value={form.walk_in_venue}
                        onChangeText={(text) => handleChange('walk_in_venue', text)}
                      />
                    </View>

                    <View style={styles.row}>
                      <View style={[styles.formGroup, { width: '48%' }]}>
                        <Text style={styles.label}>Audition Date *</Text>
                        <TouchableOpacity
                          style={[styles.input, styles.selectorInput]}
                          onPress={() => {
                            setActiveDatePicker('walk_in');
                            setShowDatePicker(true);
                          }}
                        >
                          <Text style={{ color: form.walk_in_date ? colors.textMainLight : colors.textMutedLight, fontWeight: '700' }}>
                            {form.walk_in_date || 'YYYY-MM-DD'}
                          </Text>
                          <Icon name="calendar" size={18} color={colors.primary} />
                        </TouchableOpacity>
                      </View>

                      <View style={[styles.formGroup, { width: '48%' }]}>
                        <Text style={styles.label}>Reporting Time *</Text>
                        <TouchableOpacity
                          style={[styles.input, styles.selectorInput]}
                          onPress={() => setShowTimePicker(true)}
                        >
                          <Text style={{ color: colors.textMainLight, fontWeight: '700' }}>
                            {form.walk_in_time || '10:00 AM'}
                          </Text>
                          <Icon name="time" size={18} color={colors.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
              </>
            )}

            {/* Media & Script Attachments */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionHeading}>
                {form.is_audition_required?.startsWith('Yes') ? '3. Script & Media Attachments' : '2. Script & Media Attachments'}
              </Text>

              {/* Audition Script Text Input */}
              <View style={styles.formGroup}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={styles.label}>Audition Script / Scene Dialogue (Optional)</Text>
                  {form.script_text ? (
                    <Text style={[styles.helpText, { marginTop: 0, fontSize: 11 }]}>
                      {form.script_text.length} chars
                    </Text>
                  ) : null}
                </View>
                <TextInput
                  style={[styles.input, styles.textArea, { minHeight: 120, textAlignVertical: 'top' }]}
                  placeholder={AUDITION_FORM_PLACEHOLDERS.SCRIPT_SIDES}
                  placeholderTextColor={colors.textMutedLight}
                  multiline
                  numberOfLines={5}
                  value={form.script_text}
                  onChangeText={(text) => handleChange('script_text', text)}
                />
                <Text style={styles.helpText}>
                  Actors will be able to read and rehearse this script directly inside the app.
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: spacing.s }}>
                <View style={{ flex: 1, height: 1, backgroundColor: colors.borderLight }} />
                <Text style={{ marginHorizontal: 12, ...typography.caption, color: colors.textMutedLight, fontWeight: '700' }}>
                  OR ATTACH SCRIPT PDF
                </Text>
                <View style={{ flex: 1, height: 1, backgroundColor: colors.borderLight }} />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Detailed Script / Audition Sides (PDF)</Text>
                <TouchableOpacity
                  style={[styles.uploadCard, form.description_pdf_url && styles.uploadCardSuccess]}
                  onPress={handlePdfUpload}
                  disabled={isUploadingPdf}
                  activeOpacity={0.8}
                >
                  {isUploadingPdf ? (
                    <ActivityIndicator color={colors.primary} size="small" />
                  ) : (
                    <View style={{ alignItems: 'center' }}>
                      <View style={[styles.uploadIconBadge, form.description_pdf_url && { backgroundColor: colors.success + '20' }]}>
                        <Icon
                          name={form.description_pdf_url ? "checkmark-done-circle" : "document-text"}
                          size={28}
                          color={form.description_pdf_url ? colors.success : colors.primary}
                        />
                      </View>
                      <Text style={[styles.uploadCardTitle, form.description_pdf_url && { color: colors.success }]}>
                        {form.description_pdf_url ? 'Script PDF Uploaded' : 'Upload Audition Script PDF'}
                      </Text>
                      <Text style={styles.uploadCardSubtext}>
                        {form.description_pdf_url ? 'Tap to replace script file' : 'Attach monologue or scene dialogue for talent'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                {isUploadingPdf && <ProgressBar progress={pdfProgress} />}
              </View>

              {/* Poster / Thumbnail Image */}
              <View style={[styles.formGroup, { marginTop: spacing.m }]}>
                <Text style={styles.label}>Casting Call Banner / Poster Image</Text>
                <TouchableOpacity
                  style={[styles.uploadCard, form.thumbnail_url && styles.uploadCardSuccess]}
                  onPress={handleThumbnailUpload}
                  disabled={isUploadingThumbnail}
                  activeOpacity={0.8}
                >
                  {isUploadingThumbnail ? (
                    <ActivityIndicator color={colors.primary} size="small" />
                  ) : (
                    <View style={{ alignItems: 'center' }}>
                      <View style={[styles.uploadIconBadge, form.thumbnail_url && { backgroundColor: colors.success + '20' }]}>
                        <Icon
                          name={form.thumbnail_url ? "checkmark-done-circle" : "images"}
                          size={28}
                          color={form.thumbnail_url ? colors.success : colors.primary}
                        />
                      </View>
                      <Text style={[styles.uploadCardTitle, form.thumbnail_url && { color: colors.success }]}>
                        {form.thumbnail_url ? 'Poster Image Uploaded' : 'Upload Production Poster'}
                      </Text>
                      <Text style={styles.uploadCardSubtext}>
                        {form.thumbnail_url ? 'Tap to replace thumbnail image' : 'Recommended: 16:9 banner or square poster'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                {isUploadingThumbnail && <ProgressBar progress={thumbnailProgress} />}
              </View>
            </View>
          </View>
        )}
      </KeyboardAwareScrollView>

      {/* Sticky Bottom Navigation Action Bar */}
      <KeyboardStickyView offset={{ closed: 0, opened: insets.bottom }} style={{ width: '100%' }}>
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.footerRow}>
            {currentStep > 1 && (
              <TouchableOpacity
                style={styles.prevButton}
                onPress={handlePrevStep}
                activeOpacity={0.8}
              >
                <Icon name="arrow-back" size={18} color={colors.textMainLight} style={{ marginRight: 6 }} />
                <Text style={styles.prevButtonText}>Previous</Text>
              </TouchableOpacity>
            )}

            {currentStep < 4 ? (
              <TouchableOpacity
                style={[globalStyles.primaryButton, styles.nextButton, { marginLeft: currentStep > 1 ? 12 : 0 }]}
                onPress={handleNextStep}
                activeOpacity={0.85}
              >
                <Text style={globalStyles.primaryButtonText}>
                  Continue to Step {currentStep + 1}
                </Text>
                <Icon name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[globalStyles.primaryButton, styles.nextButton, { marginLeft: currentStep > 1 ? 12 : 0, backgroundColor: '#10B981' }]}
                onPress={handleSubmit}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="rocket-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={[globalStyles.primaryButtonText, { fontSize: 16 }]}>{isEditMode ? 'Save Changes' : 'Broadcast Casting Call'}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardStickyView>

      {/* Category Modal with 3D Icons & Title Casing */}
      <Modal visible={showCategoryModal} animationType="slide" transparent={true} onRequestClose={() => setShowCategoryModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Icon name="close" size={24} color={colors.textMainLight} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder={AUDITION_FORM_PLACEHOLDERS.SEARCH_CATEGORIES}
              placeholderTextColor={colors.textMutedLight}
              value={categorySearch}
              onChangeText={setCategorySearch}
            />
            <FlatList
              data={filteredCategories}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = form.category.includes(item);
                return (
                  <TouchableOpacity
                    style={[styles.categoryModalItem, isSelected && styles.categoryModalItemSelected]}
                    onPress={() => {
                      if (isSelected) {
                        handleChange('category', form.category.filter(c => c !== item));
                      } else {
                        handleChange('category', [...form.category, item]);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.categoryModalItemLeft}>
                      <View style={[styles.categoryIconCircle, isSelected && styles.categoryIconCircleSelected]}>
                        <ProfessionCategoryIcon categoryName={item} size={24} />
                      </View>
                      <Text style={[styles.categoryModalItemText, isSelected && styles.categoryModalItemTextSelected]}>
                        {formatCategoryTitle(item)}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={styles.checkmarkBadge}>
                        <Icon name="checkmark" size={16} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* City Modal */}
      <Modal visible={showCityModal} animationType="slide" transparent={true} onRequestClose={() => setShowCityModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select City</Text>
              <TouchableOpacity onPress={() => setShowCityModal(false)}>
                <Icon name="close" size={24} color={colors.textMainLight} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder={AUDITION_FORM_PLACEHOLDERS.SEARCH_CITY}
              placeholderTextColor={colors.textMutedLight}
              value={citySearch}
              onChangeText={setCitySearch}
            />
            <FlatList
              data={CITIES.filter(c => c.toLowerCase().includes(citySearch.toLowerCase()))}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = form.city === item;
                return (
                  <TouchableOpacity
                    style={[styles.categoryModalItem, isSelected && styles.categoryModalItemSelected]}
                    onPress={() => {
                      handleChange('city', item);
                      setShowCityModal(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.categoryModalItemLeft}>
                      <View style={[styles.categoryIconCircle, isSelected && styles.categoryIconCircleSelected]}>
                        <Icon name="location" size={20} color={colors.primary} />
                      </View>
                      <Text style={[styles.categoryModalItemText, isSelected && styles.categoryModalItemTextSelected]}>
                        {item}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={styles.checkmarkBadge}>
                        <Icon name="checkmark" size={16} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Native Date Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={
            activeDatePicker === 'valid_from' && form.valid_from ? new Date(form.valid_from) :
            activeDatePicker === 'valid_till' && form.valid_till ? new Date(form.valid_till) :
            activeDatePicker === 'start' && form.specific_start_date ? new Date(form.specific_start_date) :
            activeDatePicker === 'end' && form.specific_end_date ? new Date(form.specific_end_date) :
            activeDatePicker === 'walk_in' && form.walk_in_date ? new Date(form.walk_in_date) :
            new Date()
          }
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={
            activeDatePicker === 'valid_till' && form.valid_from
              ? new Date(form.valid_from)
              : (activeDatePicker === 'end' && form.specific_start_date ? new Date(form.specific_start_date) : new Date())
          }
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.s,
    backgroundColor: colors.headerBackground || '#172038',
    borderBottomWidth: 1,
    borderBottomColor: colors.headerBorder || '#232E4A',
  },
  backButton: {
    padding: spacing.s,
    marginRight: spacing.s,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.headerText || '#FFFFFF',
    fontWeight: '800',
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.headerSubtitle || '#94A3B8',
    marginTop: 2,
  },
  stepBadge: {
    backgroundColor: '#E3B04B22',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E3B04B55',
  },
  stepBadgeText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#E3B04B',
  },
  wizardHeaderContainer: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    paddingBottom: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  stepNodesWrapper: {
    position: 'relative',
    marginBottom: spacing.m,
  },
  stepsLineBackground: {
    position: 'absolute',
    top: 24,
    left: (SCREEN_WIDTH - 48) / 8,
    right: (SCREEN_WIDTH - 48) / 8,
    height: 5,
    backgroundColor: colors.borderLight,
    borderRadius: 2.5,
  },
  stepsLineFill: {
    position: 'absolute',
    top: 24,
    left: (SCREEN_WIDTH - 48) / 8,
    height: 5,
    backgroundColor: colors.primary,
    borderRadius: 2.5,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  stepNodesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepNodeItem: {
    alignItems: 'center',
    width: (SCREEN_WIDTH - 48) / 4,
  },
  stepIconBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceLight,
    borderWidth: 2.5,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    position: 'relative',
  },
  stepIconBubbleActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '18',
    elevation: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  stepIconBubbleCompleted: {
    borderColor: '#10B981',
    backgroundColor: '#10B98120',
  },
  completedMiniBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 3,
  },
  stepNodeTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMutedLight,
    textAlign: 'center',
  },
  stepNodeTitleActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  stepNodeTitleCompleted: {
    color: '#10B981',
  },
  activeStepBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary + '0A',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  activeStepBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  activeStepBannerPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeStepBannerPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  activeStepBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textMainLight,
  },
  activeStepBannerSubtitle: {
    fontSize: 11,
    color: colors.textMutedLight,
  },
  progressPercentPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  progressPercentText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  scrollContent: {
    padding: spacing.l,
    paddingBottom: spacing.l,
  },
  stepSection: {
    gap: spacing.l,
  },
  cardSection: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    padding: spacing.l,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textMainLight,
    marginBottom: 4,
  },
  sectionSubheading: {
    ...typography.caption,
    color: colors.textMutedLight,
    marginBottom: spacing.m,
  },
  jobTypeCardsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: spacing.s,
  },
  jobTypeCard: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    alignItems: 'center',
    position: 'relative',
  },
  jobTypeCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '0E',
  },
  jobTypeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobTypeIconContainerSelected: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  jobTypeTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textMainLight,
    textAlign: 'center',
    marginBottom: 2,
  },
  jobTypeTitleSelected: {
    color: colors.primary,
    fontWeight: '800',
  },
  jobTypeSubtitle: {
    fontSize: 9.5,
    color: colors.textMutedLight,
    textAlign: 'center',
    lineHeight: 12,
  },
  jobTypeSelectedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  formGroup: {
    marginBottom: spacing.m,
  },
  label: {
    ...typography.body2,
    color: colors.textMainLight,
    fontWeight: '700',
    marginBottom: 6,
  },
  miniLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.textMutedLight,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 12,
    padding: spacing.m,
    color: colors.textMainLight,
    ...typography.body,
    minHeight: 50,
    justifyContent: 'center',
  },
  selectorInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInputIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 6,
    justifyContent: 'space-between',
  },
  stepperBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  stepperValue: {
    ...typography.body,
    color: colors.textMainLight,
    fontWeight: '800',
    fontSize: 16,
  },
  helpText: {
    ...typography.caption,
    color: colors.textMutedLight,
    marginTop: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  walkInHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  walkInTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
    marginLeft: 10,
  },
  uploadCard: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1.5,
    borderColor: colors.primary + '35',
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  uploadCardSuccess: {
    borderColor: colors.success,
    borderStyle: 'solid',
    backgroundColor: colors.success + '08',
  },
  uploadIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  uploadCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  uploadCardSubtext: {
    fontSize: 11,
    color: colors.textMutedLight,
    textAlign: 'center',
  },
  footer: {
    width: '100%',
    backgroundColor: colors.surfaceLight,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prevButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    minHeight: 52,
  },
  prevButtonText: {
    ...typography.body2,
    color: colors.textMainLight,
    fontWeight: '700',
  },
  nextButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.backgroundLight,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '75%',
    padding: spacing.l,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textMainLight,
    fontWeight: '800',
  },
  searchInput: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 12,
    padding: spacing.m,
    color: colors.textMainLight,
    marginBottom: spacing.m,
    ...typography.body,
  },
  categoryModalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
    marginBottom: 4,
  },
  categoryModalItemSelected: {
    backgroundColor: colors.primary + '12',
  },
  categoryModalItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  categoryIconCircleSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: colors.primary,
  },
  categoryModalItemText: {
    ...typography.body,
    color: colors.textMainLight,
    fontWeight: '500',
    fontSize: 15,
  },
  categoryModalItemTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  checkmarkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
