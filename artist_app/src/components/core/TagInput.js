import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, typography } from '../../theme/theme';

export default function TagInput({ tags = [], onTagsChange, placeholder, style }) {
  const [inputValue, setInputValue] = useState('');
  
  const safeTags = Array.isArray(tags) ? tags : [];

  const handleTextChange = (text) => {
    if (text.includes(',')) {
      const newTags = text.split(',')
        .map(t => t.trim())
        .filter(t => t && !safeTags.includes(t));
      if (newTags.length > 0) {
        onTagsChange([...safeTags, ...newTags]);
      }
      setInputValue('');
    } else {
      setInputValue(text);
    }
  };

  const handleSubmit = () => {
    const text = inputValue.trim();
    if (text && !safeTags.includes(text)) {
      onTagsChange([...safeTags, text]);
    }
    setInputValue('');
  };

  const removeTag = (tagToRemove) => {
    onTagsChange(safeTags.filter(t => t !== tagToRemove));
  };

  return (
    <View style={[styles.container, style]}>
      {safeTags.map(tag => (
        <View key={tag} style={styles.chip}>
          <Text style={styles.chipText}>{tag}</Text>
          <TouchableOpacity onPress={() => removeTag(tag)} style={styles.chipClose}>
            <Icon name="close" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      ))}
      <TextInput
        style={styles.input}
        placeholder={safeTags.length === 0 ? placeholder : 'Add more...'}
        placeholderTextColor={colors.textMutedLight}
        value={inputValue}
        onChangeText={handleTextChange}
        onSubmitEditing={handleSubmit}
        blurOnSubmit={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingTop: 8,
    minHeight: 50,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginRight: 4,
  },
  chipClose: {
    padding: 2,
  },
  input: {
    ...typography.body,
    flex: 1,
    minWidth: 100,
    paddingVertical: 6,
    paddingHorizontal: 4,
    color: colors.textMainLight,
    marginBottom: 8,
  }
});
