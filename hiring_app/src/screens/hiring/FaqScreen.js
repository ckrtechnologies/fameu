import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import ShrinkableHeader from '../../components/core/ShrinkableHeader';
import { useTheme } from '../../theme/ThemeProvider';
import { typography, spacing } from '../../theme/theme';

const faqs = [
  { question: "How do I verify my company profile?", answer: "To verify your company profile, go to the KYC Verification screen from the sidebar menu and upload the required documents (e.g. PAN, Registration Certificate, and personal ID)." },
  { question: "How much does it cost to post an audition?", answer: "Posting an audition is currently free during our beta period." },
  { question: "How can I contact an artist?", answer: "Once an artist applies to your audition, you can chat with them directly through the Inbox, or you can find them in Search and invite them to an audition." },
  { question: "Is my data secure?", answer: "Yes, we use industry-standard encryption to protect your company's data and uploaded documents." },
];

export default function FaqScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.backgroundLight }]}>
      <ShrinkableHeader title="FAQ" showBack={true} />

      <ScrollView style={styles.container} contentContainerStyle={{ paddingHorizontal: spacing.l, paddingVertical: spacing.m }}>
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
              <Text style={[styles.answer, { color: colors.text }]}>{faq.answer}</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    ...typography.body1,
    fontWeight: 'bold',
    flex: 1,
    paddingRight: spacing.m,
  },
  answer: {
    ...typography.body2,
    marginTop: spacing.m,
    lineHeight: 22,
  },
});
