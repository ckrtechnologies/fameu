import { INDIAN_CITIES } from './cities';

export const COMPANY_TYPE_OPTIONS = [
  { label: 'Production house', value: 'Production house', icon: 'videocam', badge: '🎬', color: '#8b5cf6' },
  { label: 'Casting company or director', value: 'Casting company or director', icon: 'person-add', badge: '🎭', color: '#3b82f6' },
  { label: 'Free lancer', value: 'Free lancer', icon: 'person', badge: '👤', color: '#10b981' },
  { label: 'Theater group or institution', value: 'Theater group or institution', icon: 'business', badge: '🏛️', color: '#f59e0b' },
  { label: 'Music company', value: 'Music company', icon: 'musical-notes', badge: '🎵', color: '#ec4899' },
  { label: 'Post production Studio', value: 'Post production Studio', icon: 'desktop', badge: '🖥️', color: '#6366f1' },
  { label: 'Brand or Corporate', value: 'Brand or Corporate', icon: 'briefcase', badge: '💼', color: '#0ea5e9' },
  { label: 'Broadcaster or channel', value: 'Broadcaster or channel', icon: 'tv', badge: '📺', color: '#ef4444' },
  { label: 'Filmmaker', value: 'Filmmaker', icon: 'film', badge: '🎥', color: '#8b5cf6' },
  { label: 'Media or Advertising agency', value: 'Media or Advertising agency', icon: 'megaphone', badge: '📢', color: '#f97316' },
  { label: 'Event or outdoor', value: 'Event or outdoor', icon: 'calendar', badge: '🎪', color: '#14b8a6' },
  { label: 'Media company or network', value: 'Media company or network', icon: 'globe', badge: '🌐', color: '#06b6d4' },
  { label: 'Talent management agency', value: 'Talent management agency', icon: 'star', badge: '⭐', color: '#eab308' },
  { label: 'Others', value: 'Others', icon: 'ellipsis-horizontal', badge: '✨', color: '#94a3b8' }
];

export const COMPANY_TYPES = COMPANY_TYPE_OPTIONS.map(c => c.value);
export const COMPANY_TYPES_WITH_ALL = ['All', ...COMPANY_TYPES];

export const PROJECT_TYPES = [
  'Web-series',
  'Films',
  'TV serials',
  'Short Films',
  'Ad films',
  'Reality Shows',
  'Talent Hunt',
  'Regional Movies',
  'Regional Shows',
  'Branded Content',
  'Music Videos',
  'Music Albums',
  'Print shoots',
  'Catalog Shoots',
  'Documentary',
  'Audition',
  'Casting call',
  'Photo shoot',
  'Shoot',
  'Freelance project/assignment',
  'Other'
];
export const PROJECT_TYPES_WITH_ALL = ['All', ...PROJECT_TYPES];

export const AUDITION_MODES = ['Walk-in', 'Scheduled', 'Online'];
export const AUDITION_MODES_WITH_ALL = ['All', ...AUDITION_MODES];

export const DURATION_TYPES = ['Full-time', 'Part-time', 'Date Specific'];
export const DURATION_TYPES_WITH_ALL = ['All', ...DURATION_TYPES];

export const GENDERS = ['Male', 'Female', 'Other', 'Any'];
export const GENDERS_WITH_ALL = ['All', 'Male', 'Female', 'Other', 'Any'];

export const LANGUAGES = [
  'Hindi',
  'English',
  'Marathi',
  'Bengali',
  'Telugu',
  'Tamil',
  'Kannada',
  'Malayalam',
  'Gujarati',
  'Punjabi',
  'Urdu',
  'Bhojpuri',
  'Odia',
  'Assamese',
  'Other'
];

export const SKILLS = [
  'Acting',
  'Dancing',
  'Singing',
  'Anchoring',
  'Modeling',
  'Voice Over',
  'Martial Arts / Action',
  'Instrumentalist',
  'Stand-up Comedy',
  'Direction',
  'Writing'
];

export const COMPENSATION_FREQUENCIES = [
  'Per Day',
  'Per Week',
  'Per Month',
  'One Time',
  'Unpaid / TFP'
];

export const COMPENSATION_OPTIONS = [
  'All',
  'Paid Only',
  '₹5,000+',
  '₹25,000+',
  '₹50,000+',
  '₹1,00,000+'
];

export const AUDITION_REQUIRED_OPTIONS = ['Yes (Audition Required)', 'No'];

export const TOP_CITIES = [
  'Mumbai',
  'Delhi NCR',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Chandigarh',
  'Other'
];
export const TOP_CITIES_WITH_ALL = ['All', ...TOP_CITIES];

export const DEFAULT_CATEGORIES_FALLBACK = [
  'Actor',
  'Model',
  'Dancer',
  'Singer',
  'Musician',
  'Comedian',
  'Technician',
  'Writer',
  'Director',
  'Other'
];

export const AVAILABILITY_OPTIONS = [
  'Full Time',
  'Part Time',
  'Weekends',
  'Short Term',
  'Long Term',
  'Freelance'
];

export const TRAVEL_PREFERENCES = [
  'Available in India',
  'Outside India',
  'Specific Cities'
];

export const HEIGHT_OPTIONS = Array.from({ length: 37 }, (_, i) => {
  const totalInches = 48 + i; // Start from 4' 0"
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  const cm = Math.round(totalInches * 2.54);
  return `${feet}' ${inches}" (${cm} cm)`;
});

export { INDIAN_CITIES };
