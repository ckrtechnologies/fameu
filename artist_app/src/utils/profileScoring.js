/**
 * Artist Profile Completeness Scoring & Checklist Utility
 * Centralizes the profile strength weights and checklist items.
 */

export const ARTIST_SCORING_WEIGHTS = {
  FULL_NAME: 15,
  CATEGORIES: 20,
  PHOTOS: 20,
  BIO: 15,
  CITY: 10,
  AGE: 5,
  GENDER: 5,
  LANGUAGES: 5,
  PHYSICAL_STATS: 5,
};

/**
 * Calculates artist profile completion percentage (0 - 100)
 * @param {Object} profile - Artist profile data
 * @param {Object} [user] - Auth user object for fallback fields
 * @returns {number} Score between 0 and 100
 */
export const calculateArtistProfileScore = (profile, user) => {
  if (!profile && !user) return 0;
  const p = profile || {};
  let score = 0;

  if (p.full_name || user?.full_name) score += ARTIST_SCORING_WEIGHTS.FULL_NAME;
  if (p.age) score += ARTIST_SCORING_WEIGHTS.AGE;
  if (p.gender) score += ARTIST_SCORING_WEIGHTS.GENDER;
  if (p.city || (Array.isArray(p.preferred_cities) && p.preferred_cities.length > 0)) {
    score += ARTIST_SCORING_WEIGHTS.CITY;
  }
  if (p.bio && p.bio.trim().length > 0) score += ARTIST_SCORING_WEIGHTS.BIO;
  if (Array.isArray(p.categories) && p.categories.length > 0) {
    score += ARTIST_SCORING_WEIGHTS.CATEGORIES;
  }
  if (p.avatar_url || user?.avatar_url || (Array.isArray(p.photo_urls) && p.photo_urls.length > 0)) {
    score += ARTIST_SCORING_WEIGHTS.PHOTOS;
  }
  if (Array.isArray(p.languages) && p.languages.length > 0) {
    score += ARTIST_SCORING_WEIGHTS.LANGUAGES;
  }
  if (p.height || p.weight) {
    score += ARTIST_SCORING_WEIGHTS.PHYSICAL_STATS;
  }

  return Math.min(100, Math.max(0, score));
};

/**
 * Generates the interactive profile checklist for the artist dashboard
 * @param {Object} profile
 * @param {Object} [user]
 * @returns {Array<Object>}
 */
export const getArtistProfileChecklist = (profile, user) => {
  const data = profile || {};
  return [
    {
      id: 'full_name',
      emoji: '👤',
      title: 'Full Name',
      hint: 'Screen / legal name',
      iconName: 'person',
      completed: !!(data.full_name || user?.full_name),
      weight: `+${ARTIST_SCORING_WEIGHTS.FULL_NAME}%`,
      color: '#3B82F6',
      bg: '#EFF6FF',
      targetScreen: 'EditProfile',
    },
    {
      id: 'categories',
      emoji: '🎭',
      title: 'Artistic Categories',
      hint: 'Actor, Model, Singer, Dancer',
      iconName: 'briefcase',
      completed: Array.isArray(data.categories) && data.categories.length > 0,
      weight: `+${ARTIST_SCORING_WEIGHTS.CATEGORIES}%`,
      color: '#8B5CF6',
      bg: '#F5F3FF',
      targetScreen: (Array.isArray(data.categories) && data.categories.length > 0) ? 'EditProfile' : 'ArtistCategory',
    },
    {
      id: 'photos',
      emoji: '📸',
      title: 'Headshots & Photos',
      hint: 'Portfolio look photos',
      iconName: 'camera',
      completed: (Array.isArray(data.photo_urls) && data.photo_urls.length > 0) || !!data.avatar_url || !!user?.avatar_url,
      weight: `+${ARTIST_SCORING_WEIGHTS.PHOTOS}%`,
      color: '#EC4899',
      bg: '#FDF2F8',
      targetScreen: 'EditProfile',
    },
    {
      id: 'bio',
      emoji: '📝',
      title: 'About / Bio',
      hint: 'Introduce your career to recruiters',
      iconName: 'document-attach-outline',
      completed: !!data.bio && data.bio.trim().length > 0,
      weight: `+${ARTIST_SCORING_WEIGHTS.BIO}%`,
      color: '#F59E0B',
      bg: '#FFFBEB',
      targetScreen: 'EditProfile',
    },
    {
      id: 'city',
      emoji: '📍',
      title: 'Base City',
      hint: 'Current shooting location',
      iconName: 'city',
      completed: !!data.city,
      weight: `+${ARTIST_SCORING_WEIGHTS.CITY}%`,
      color: '#10B981',
      bg: '#ECFDF5',
      targetScreen: 'EditProfile',
    },
    {
      id: 'age_gender',
      emoji: '🚻',
      title: 'Age & Gender',
      hint: 'Character casting filters',
      iconName: 'gender',
      completed: !!data.age && !!data.gender,
      weight: `+${ARTIST_SCORING_WEIGHTS.AGE + ARTIST_SCORING_WEIGHTS.GENDER}%`,
      color: '#06B6D4',
      bg: '#ECFEFF',
      targetScreen: 'EditProfile',
    },
    {
      id: 'languages',
      emoji: '🌐',
      title: 'Languages Known',
      hint: 'Fluent spoken languages',
      iconName: 'languages',
      completed: Array.isArray(data.languages) && data.languages.length > 0,
      weight: `+${ARTIST_SCORING_WEIGHTS.LANGUAGES}%`,
      color: '#6366F1',
      bg: '#EEF2FF',
      targetScreen: 'EditProfile',
    },
    {
      id: 'height_weight',
      emoji: '📏',
      title: 'Physical Stats',
      hint: 'Height & weight for roles',
      iconName: 'height',
      completed: !!data.height || !!data.weight,
      weight: `+${ARTIST_SCORING_WEIGHTS.PHYSICAL_STATS}%`,
      color: '#F97316',
      bg: '#FFF7ED',
      targetScreen: 'EditProfile',
    },
    {
      id: 'availability',
      emoji: '📅',
      title: 'Availability & Dates',
      hint: 'Full-time / shoot availability',
      iconName: 'availability_type',
      completed: !!data.availability_type || !!data.available_dates,
      weight: 'Bonus',
      color: '#14B8A6',
      bg: '#F0FDFA',
      targetScreen: 'EditProfile',
    },
    {
      id: 'skills',
      emoji: '⭐',
      title: 'Special Skills',
      hint: 'Voiceover, Martial Arts, Dance',
      iconName: 'skills',
      completed: Array.isArray(data.skills) && data.skills.length > 0,
      weight: 'Bonus',
      color: '#EAB308',
      bg: '#FEFCE8',
      targetScreen: 'EditProfile',
    },
    {
      id: 'social_links',
      emoji: '📱',
      title: 'Social Profiles',
      hint: 'Instagram & YouTube work links',
      iconName: 'logo-instagram',
      completed: !!data.social_links && Object.values(typeof data.social_links === 'string' ? JSON.parse(data.social_links || '{}') : data.social_links).some(Boolean),
      weight: 'Bonus',
      color: '#D946EF',
      bg: '#FDF4FF',
      targetScreen: 'EditProfile',
    },
  ];
};
