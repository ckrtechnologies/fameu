import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, TextInput, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeProvider';
import { typography, spacing, globalStyles } from '../../theme/theme';
import { GlobalAlert } from '../../components/core/GlobalAlert';
import CustomButton from '../../components/forms/CustomButton';
import { useSubmitSupportTicketMutation } from '../../services/profileApi';
import { useSelector } from 'react-redux';
import ShrinkableHeader from '../../components/core/ShrinkableHeader';
import useShrinkableHeader from '../../hooks/useShrinkableHeader';

export default function ContactUsScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const [submitTicket, { isLoading: isSubmitting }] = useSubmitSupportTicketMutation();
  const { user } = useSelector((state) => state.auth);

  const {
    scrollY,
    onScroll,
    headerPaddingVertical,
    headerTitleSize,
    subtitleHeight,
    subtitleOpacity,
    headerElevation,
  } = useShrinkableHeader();

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      GlobalAlert.show('Error', 'Please fill out both the subject and the message.');
      return;
    }
    try {
      await submitTicket({
        user_id: user?.id,
        user_type: 'artist',
        subject: subject.trim(),
        message: message.trim()
      }).unwrap();
      
      GlobalAlert.show('Success', 'Your message has been sent to the Fameu support team. We will get back to you shortly.');
      setSubject('');
      setMessage('');
      navigation.goBack();
    } catch (error) {
      GlobalAlert.show('Error', 'Failed to send message. Please try again later.');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.backgroundLight }]} edges={['left', 'right']}>
      <ShrinkableHeader 
        title="Contact Us"
        subtitle="We're here to help"
        showBack={true}
        onBack={() => navigation.goBack()}
        headerPaddingVertical={headerPaddingVertical}
        headerTitleSize={headerTitleSize}
        subtitleHeight={subtitleHeight}
        subtitleOpacity={subtitleOpacity}
        headerElevation={headerElevation}
      />

      <KeyboardAwareScrollView 
        style={styles.container} 
        contentContainerStyle={{ padding: spacing.xl }}
        enableOnAndroid={true}
        extraScrollHeight={100}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Need help? Have a question about your account or posting an audition? Send us a message and we'll be in touch!
        </Text>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textMainLight }]}>Subject</Text>
          <TextInput
            style={[globalStyles.input, { backgroundColor: colors.surfaceLight, color: colors.textMainLight, borderColor: colors.borderLight }]}
            placeholder="What is this regarding?"
            placeholderTextColor={colors.textMutedLight}
            value={subject}
            onChangeText={setSubject}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textMainLight }]}>Message</Text>
          <TextInput
            style={[globalStyles.input, { backgroundColor: colors.surfaceLight, color: colors.textMainLight, borderColor: colors.borderLight, minHeight: 150, textAlignVertical: 'top' }]}
            placeholder="Explain your issue or question..."
            placeholderTextColor={colors.textMutedLight}
            multiline
            numberOfLines={6}
            value={message}
            onChangeText={setMessage}
          />
        </View>

        <CustomButton 
          title="Send Message" 
          onPress={handleSubmit} 
          loading={isSubmitting} 
          style={{ marginTop: spacing.l }} 
        />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: spacing.s,
  },
  title: {
    ...typography.h3,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
  },
  subtitle: {
    ...typography.body1,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: spacing.l,
  },
  label: {
    ...typography.body2,
    fontWeight: 'bold',
    marginBottom: spacing.s,
  },
});
