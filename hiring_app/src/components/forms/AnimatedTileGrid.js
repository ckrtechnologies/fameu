import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

// Solid SVG Icons
import {
  WebSeriesProjectIcon,
  FilmsProjectIcon,
  TvSerialsProjectIcon,
  ShortFilmsProjectIcon,
  AdFilmsProjectIcon,
  RealityShowsProjectIcon,
  TalentHuntProjectIcon,
  RegionalMoviesProjectIcon,
  RegionalShowsProjectIcon,
  BrandedContentProjectIcon,
  MusicVideosProjectIcon,
  MusicAlbumsProjectIcon,
  PrintShootsProjectIcon,
  CatalogShootsProjectIcon,
  DocumentaryProjectIcon,
  OtherProjectIcon,
} from '../icons/project_types';

import {
  WalkInIcon,
  ScheduledIcon,
  OnlineModeIcon,
  FullTimeIcon,
  PartTimeIcon,
  DateSpecificIcon,
  PerDayIcon,
  PerWeekIcon,
  PerMonthIcon,
  OneTimeIcon,
  UnpaidTfpIcon,
  MaleGenderIcon,
  FemaleGenderIcon,
  OtherGenderIcon,
  AnyGenderIcon,
} from '../icons/forms';

import {
  ProfessionCategoryIcon,
  ActingTheatreProfessionIcon,
  DanceProfessionIcon,
  MusicSoundProfessionIcon,
  CinemaDOPProfessionIcon,
  FashionStylingProfessionIcon,
  BroadcastingMediaProfessionIcon,
  WritingLiteratureProfessionIcon,
  GeneralProfessionIcon,
} from '../icons/professions';

import {
  HindiLanguageIcon,
  EnglishLanguageIcon,
  MarathiLanguageIcon,
  BengaliLanguageIcon,
  TeluguLanguageIcon,
  TamilLanguageIcon,
  KannadaLanguageIcon,
  MalayalamLanguageIcon,
  GujaratiLanguageIcon,
  PunjabiLanguageIcon,
  UrduLanguageIcon,
  BhojpuriLanguageIcon,
  OtherLanguageIcon,
} from '../icons/languages';

export const AnimatedTileGrid = ({ options, selectedValue = [], onSelect, isMulti }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.tileGridContainer}>
      {options.map((option, index) => {
        const isSelected = isMulti 
          ? (Array.isArray(selectedValue) && selectedValue.includes(option)) 
          : selectedValue === option;

        return (
          <AnimatedTile 
            key={option} 
            option={option} 
            isSelected={isSelected} 
            index={index}
            onSelect={() => {
              if (isMulti) {
                const currentArr = Array.isArray(selectedValue) ? selectedValue : [];
                if (isSelected) {
                  onSelect(currentArr.filter(v => v !== option));
                } else {
                  onSelect([...currentArr, option]);
                }
              } else {
                onSelect(option);
              }
            }}
          />
        );
      })}
    </View>
  );
};

export default AnimatedTileGrid;

const AnimatedTile = ({ option, isSelected, onSelect, index }) => {
  const { colors, typography } = useTheme();
  const styles = getStyles(colors, typography);

  const getIconForOption = (name) => {
    const n = (name || '').toLowerCase().trim();

    // 1. Project Types
    if (n === 'web-series' || n.includes('web-series') || n.includes('webseries')) return <WebSeriesProjectIcon size={28} />;
    if (n === 'films' || n.includes('feature film')) return <FilmsProjectIcon size={28} />;
    if (n === 'tv serials' || n.includes('tv serial') || n.includes('television')) return <TvSerialsProjectIcon size={28} />;
    if (n === 'short films' || n.includes('short film')) return <ShortFilmsProjectIcon size={28} />;
    if (n === 'ad films' || n.includes('ad film') || n.includes('commercial')) return <AdFilmsProjectIcon size={28} />;
    if (n === 'reality shows' || n.includes('reality show')) return <RealityShowsProjectIcon size={28} />;
    if (n === 'talent hunt' || n.includes('talent hunt')) return <TalentHuntProjectIcon size={28} />;
    if (n === 'regional movies' || n.includes('regional movie')) return <RegionalMoviesProjectIcon size={28} />;
    if (n === 'regional shows' || n.includes('regional show')) return <RegionalShowsProjectIcon size={28} />;
    if (n === 'branded content' || n.includes('branded')) return <BrandedContentProjectIcon size={28} />;
    if (n === 'music videos' || n.includes('music video')) return <MusicVideosProjectIcon size={28} />;
    if (n === 'music albums' || n.includes('music album')) return <MusicAlbumsProjectIcon size={28} />;
    if (n === 'print shoots' || n.includes('print shoot')) return <PrintShootsProjectIcon size={28} />;
    if (n === 'catalog shoots' || n.includes('catalog shoot') || n.includes('catalogue')) return <CatalogShootsProjectIcon size={28} />;
    if (n === 'documentary' || n.includes('documentary')) return <DocumentaryProjectIcon size={28} />;
    if (n === 'other') return <OtherProjectIcon size={28} />;

    // 2. Audition & Project Modes
    if (n.includes('walk-in') || n.includes('walk in') || n === 'offline') return <WalkInIcon size={28} />;
    if (n.includes('scheduled') || n.includes('appointment')) return <ScheduledIcon size={28} />;
    if (n.includes('online') || n.includes('virtual') || n.includes('remote')) return <OnlineModeIcon size={28} />;

    // 3. Duration Types
    if (n.includes('full-time') || n.includes('full time')) return <FullTimeIcon size={28} />;
    if (n.includes('part-time') || n.includes('part time')) return <PartTimeIcon size={28} />;
    if (n.includes('date specific') || n.includes('contract')) return <DateSpecificIcon size={28} />;

    // 4. Compensation Frequencies
    if (n.includes('per day') || n.includes('daily')) return <PerDayIcon size={28} />;
    if (n.includes('per week') || n.includes('weekly')) return <PerWeekIcon size={28} />;
    if (n.includes('per month') || n.includes('monthly')) return <PerMonthIcon size={28} />;
    if (n.includes('one time') || n.includes('lump sum') || n.includes('fixed')) return <OneTimeIcon size={28} />;
    if (n.includes('unpaid') || n.includes('tfp')) return <UnpaidTfpIcon size={28} />;

    // 5. Gender Options
    if (n === 'male') return <MaleGenderIcon size={28} />;
    if (n === 'female') return <FemaleGenderIcon size={28} />;
    if (n === 'other') return <OtherGenderIcon size={28} />;
    if (n === 'any' || n.includes('all')) return <AnyGenderIcon size={28} />;

    // 6. Skills & Professions
    if (n.includes('acting') || n.includes('actor')) return <ActingTheatreProfessionIcon size={28} />;
    if (n.includes('dancing') || n.includes('dance')) return <DanceProfessionIcon size={28} />;
    if (n.includes('singing') || n.includes('singer') || n.includes('music') || n.includes('instrument')) return <MusicSoundProfessionIcon size={28} />;
    if (n.includes('modeling') || n.includes('model') || n.includes('fashion')) return <FashionStylingProfessionIcon size={28} />;
    if (n.includes('voice') || n.includes('dubbing') || n.includes('anchor') || n.includes('host')) return <BroadcastingMediaProfessionIcon size={28} />;
    if (n.includes('direction') || n.includes('director') || n.includes('camera') || n.includes('dop')) return <CinemaDOPProfessionIcon size={28} />;
    if (n.includes('writing') || n.includes('writer') || n.includes('script') || n.includes('lyric')) return <WritingLiteratureProfessionIcon size={28} />;
    if (n.includes('comedy') || n.includes('stand-up') || n.includes('comedian')) return <ActingTheatreProfessionIcon size={28} />;
    if (n.includes('martial') || n.includes('action') || n.includes('stunt')) return <TalentHuntProjectIcon size={28} />;

    // 7. Audition Requirement Options
    if (n.includes('yes')) return <ActingTheatreProfessionIcon size={28} />;
    if (n.includes('no')) return <TalentHuntProjectIcon size={28} />;

    // 8. Preferred Languages
    if (n === 'hindi') return <HindiLanguageIcon size={28} />;
    if (n === 'english') return <EnglishLanguageIcon size={28} />;
    if (n === 'marathi') return <MarathiLanguageIcon size={28} />;
    if (n === 'bengali') return <BengaliLanguageIcon size={28} />;
    if (n === 'telugu') return <TeluguLanguageIcon size={28} />;
    if (n === 'tamil') return <TamilLanguageIcon size={28} />;
    if (n === 'kannada') return <KannadaLanguageIcon size={28} />;
    if (n === 'malayalam') return <MalayalamLanguageIcon size={28} />;
    if (n === 'gujarati') return <GujaratiLanguageIcon size={28} />;
    if (n === 'punjabi') return <PunjabiLanguageIcon size={28} />;
    if (n === 'urdu') return <UrduLanguageIcon size={28} />;
    if (n === 'bhojpuri') return <BhojpuriLanguageIcon size={28} />;
    if (n === 'other') return <OtherLanguageIcon size={28} />;

    // Fallback Solid Icon
    return <OtherProjectIcon size={28} />;
  };

  return (
    <TouchableOpacity 
      onPress={onSelect} 
      activeOpacity={0.75} 
      style={{ 
        width: '31.3%', 
        marginBottom: 12, 
        marginLeft: index % 3 !== 0 ? '3%' : 0 
      }}
    >
      <View style={[
        styles.tileItem, 
        isSelected ? styles.tileItemSelected : styles.tileItemUnselected,
        {
          borderColor: isSelected ? colors.primary : '#E2E8F0',
          backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
          borderWidth: isSelected ? 2 : 1.5,
          shadowColor: isSelected ? colors.primary : '#000',
          shadowOffset: { width: 0, height: isSelected ? 3 : 1 },
          shadowOpacity: isSelected ? 0.12 : 0.04,
          shadowRadius: isSelected ? 6 : 3,
          elevation: isSelected ? 3 : 1,
        }
      ]}>
        <View style={styles.iconWrapper}>
          {getIconForOption(option)}
        </View>
        <Text 
          numberOfLines={2} 
          style={[styles.tileText, isSelected && styles.tileTextSelected]}
        >
          {option}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const getStyles = (colors, typography = {}) => StyleSheet.create({
  tileGridContainer: {
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'flex-start',
    width: '100%',
  },
  tileItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 96,
  },
  iconWrapper: {
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileText: {
    fontFamily: typography?.fontFamily || 'System',
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
    lineHeight: 15,
  },
  tileTextSelected: {
    color: colors.primary,
    fontWeight: '800',
  }
});
