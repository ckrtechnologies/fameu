import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
export { default as IconBase } from './IconBase';

// Common Icons
export * from './common';

// Profile & Physical Attribute Icons
export * from './profile';

// Preferences & Tags Icons
export * from './preferences';

// Media & Portfolio Icons
export * from './media';

// Quick Action Filled Icons
export * from './actions';

// Navigation Tab Icons
export * from './navigation';

// Live Ticker USP Icons
export * from './ticker';

// Profile Header & Share Icons
export * from './profile_header';

// Profile Basic Info Stat Icons
export * from './profile_stats';

// Overview Stats & Banner Icons
export * from './stats';

// Brand Social Media Icons
export * from './brands';

// Profession & Category Specific 3D Icons
export * from './professions';

// Hiring Dashboard 3D Solid Icons
export * from './dashboard';

// Project Types 3D Solid Icons
export * from './project_types';

// Form Selection 3D Solid Icons
export * from './forms';

// Languages Script Badge Solid Icons
export * from './languages';

// Wizard Step & Listing Type 3D Icons
export * from './wizard';

import {
  ArrowBackIcon,
  ShareIcon,
  CloseIcon,
  ChevronBackIcon,
  ChevronForwardIcon,
  WarningIcon,
  TrashIcon,
  SendIcon,
  CloseCircleIcon,
  PersonCircleIcon,
} from './common';

import {
  AgeCalendarIcon,
  GenderIcon,
  HeightScaleIcon,
  WeightScaleIcon,
  LocationPinIcon,
  LanguageGlobeIcon,
  SkillsStarIcon,
  AvailabilityTimeIcon,
  CalendarNumberIcon,
  CintaaCardIcon,
  PhoneCallIcon,
  EmailIcon,
  InfoBadgeIcon,
} from './profile';

import {
  WorkBriefcaseIcon,
  PreferredLocationIcon,
  LookAlikeIcon,
  HashtagIcon,
  PreferencesGearIcon,
} from './preferences';

import {
  PlayIcon,
  VideoCamIcon,
  CameraIcon,
  WebLinkIcon,
  UploadCloudIcon,
  DocumentAttachIcon,
} from './media';

import {
  DiscoverFilledIcon,
  MessagesFilledIcon,
  PortfolioFilledIcon,
  NetworkFilledIcon,
} from './actions';

import {
  InstagramIcon,
  YouTubeIcon,
  FacebookIcon,
  SnapchatIcon,
} from './brands';

// Icon Registry Map for dynamic lookup by name or key
export const ICONS_REGISTRY = {
  // Navigation & Common
  'arrow-back': ArrowBackIcon,
  'share-social': ShareIcon,
  'share-social-outline': ShareIcon,
  'close': CloseIcon,
  'chevron-back': ChevronBackIcon,
  'chevron-forward': ChevronForwardIcon,
  'warning': WarningIcon,
  'trash': TrashIcon,
  'trash-outline': TrashIcon,
  'send': SendIcon,
  'close-circle': CloseCircleIcon,
  'person-circle': PersonCircleIcon,
  'person-circle-outline': PersonCircleIcon,
  'person': PersonCircleIcon,

  // Quick Actions (Filled)
  'discover': DiscoverFilledIcon,
  'messages': MessagesFilledIcon,
  'portfolio': PortfolioFilledIcon,
  'network': NetworkFilledIcon,

  // Basic Info Mapping Keys (both direct keys and Ionicons names)
  'age': AgeCalendarIcon,
  'calendar-outline': AgeCalendarIcon,
  'gender': GenderIcon,
  'male-female-outline': GenderIcon,
  'height': HeightScaleIcon,
  'resize-outline': HeightScaleIcon,
  'weight': WeightScaleIcon,
  'barbell-outline': WeightScaleIcon,
  'city': LocationPinIcon,
  'location-outline': LocationPinIcon,
  'languages': LanguageGlobeIcon,
  'language-outline': LanguageGlobeIcon,
  'skills': SkillsStarIcon,
  'star-outline': SkillsStarIcon,
  'availability_type': AvailabilityTimeIcon,
  'time-outline': AvailabilityTimeIcon,
  'available_dates': CalendarNumberIcon,
  'calendar-number-outline': CalendarNumberIcon,
  'cintaa': CintaaCardIcon,
  'id-card-outline': CintaaCardIcon,
  'card-outline': CintaaCardIcon,
  'call-outline': PhoneCallIcon,
  'mail-outline': EmailIcon,
  'information-circle-outline': InfoBadgeIcon,
  'information-outline': InfoBadgeIcon,

  // Preferences & Tags
  'options-outline': PreferencesGearIcon,
  'briefcase': WorkBriefcaseIcon,
  'work_preference': WorkBriefcaseIcon,
  'location': PreferredLocationIcon,
  'preferred_cities': PreferredLocationIcon,
  'people': LookAlikeIcon,
  'look_alike': LookAlikeIcon,
  'pricetag': HashtagIcon,
  'hashtags': HashtagIcon,

  // Media
  'play': PlayIcon,
  'videocam': VideoCamIcon,
  'camera': CameraIcon,
  'link': WebLinkIcon,
  'link-outline': WebLinkIcon,
  'globe-outline': LanguageGlobeIcon,
  'cloud-upload-outline': UploadCloudIcon,
  'document-attach-outline': DocumentAttachIcon,

  // Brands
  'logo-instagram': InstagramIcon,
  'instagram': InstagramIcon,
  'logo-youtube': YouTubeIcon,
  'youtube': YouTubeIcon,
  'logo-facebook': FacebookIcon,
  'facebook': FacebookIcon,
  'logo-snapchat': SnapchatIcon,
  'snapchat': SnapchatIcon,
};

/**
 * Dynamic Icon component that looks up custom vector icon from registry.
 * Falls back safely to standard Ionicons vector icon if no custom SVG is registered.
 */
export function AppIcon({ name, size = 24, color, style, ...props }) {
  const Component = ICONS_REGISTRY[name];
  if (Component) {
    return <Component size={size} color={color} style={style} {...props} />;
  }
  return <Ionicons name={name || 'ellipse-outline'} size={size} color={color} style={style} {...props} />;
}

export const Icon = AppIcon;
export default AppIcon;

