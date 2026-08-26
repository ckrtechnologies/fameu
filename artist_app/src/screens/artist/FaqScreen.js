import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { typography, spacing } from '../../theme/theme';
import ShrinkableHeader from '../../components/core/ShrinkableHeader';
import useShrinkableHeader from '../../hooks/useShrinkableHeader';

const faqs = [
  { question: "How do I apply for an audition?", answer: "You can apply for auditions by visiting the Auditions tab, selecting an audition, and clicking 'Apply'. Make sure your profile is complete to increase your chances." },
  { question: "How do I update my portfolio?", answer: "Go to your Profile tab and click 'Edit Profile'. From there, you can upload new photos, videos, and update your physical attributes." },
  { question: "Is FameU free to use?", answer: "Yes, creating a profile and applying to standard auditions is completely free for artists." },
  { question: "How will I know if I'm selected?", answer: "You will receive a notification in the app and an email if a recruiter accepts your application or messages you directly." },
];

export default function FaqScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const [expandedIndex, setExpandedIndex] = useState(null);

  const {
    scrollY,
    onScroll,
    headerPaddingVertical,
    headerTitleSize,
    subtitleHeight,
    subtitleOpacity,
    headerElevation,
  } = useShrinkableHeader();

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.backgroundLight }]} edges={['left', 'right']}>
      <ShrinkableHeader 
        title="FAQ"
        subtitle="Frequently Asked Questions"
        showBack={true}
        onBack={() => navigation.goBack()}
        headerPaddingVertical={headerPaddingVertical}
        headerTitleSize={headerTitleSize}
        subtitleHeight={subtitleHeight}
        subtitleOpacity={subtitleOpacity}
        headerElevation={headerElevation}
      />

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={{ padding: spacing.xl }}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {faqs.map((faq, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.faqItem, { backgroundColor: colors.surfaceLight, borderColor: colors.borderLight }]} 
            onPress={() => toggleExpand(index)}
          >
            <View style={styles.faqHeader}>
              <Text style={[styles.question, { color: colors.textMainLight }]}>{faq.question}</Text>
              {expandedIndex === index ? (
                <ChevronUp size={20} color={colors.primary} />
              ) : (
                <ChevronDown size={20} color={colors.textMutedLight} />
              )}
            </View>
            {expandedIndex === index && (
              <Text style={[styles.answer, { color: colors.textMainLight, opacity: 0.8 }]}>{faq.answer}</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  faqItem: {
    marginBottom: spacing.m,
    padding: spacing.m,
    borderRadius: 8,
    borderWidth: 1,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    ...typography.body,
    fontWeight: 'bold',
    flex: 1,
    paddingRight: spacing.m,
  },
  answer: {
    ...typography.body,
    marginTop: spacing.m,
    lineHeight: 22,
  },
});
