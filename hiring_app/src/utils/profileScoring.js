/**
 * Company Profile Completeness Scoring & Checklist Utility
 * Centralizes the profile strength weights and checklist items.
 */

export const COMPANY_SCORING_WEIGHTS = {
  COMPANY_NAME: 25,
  COMPANY_TYPE: 25,
  DESCRIPTION: 25,
  LOGO: 25,
};

/**
 * Calculates company profile completion percentage (0 - 100)
 * @param {Object} profile - Company profile data
 * @param {Object} [user] - Auth user object for fallback fields
 * @returns {number} Score between 0 and 100
 */
export const calculateCompanyProfileScore = (profile, user) => {
  if (!profile && !user) return 0;
  const p = profile || {};
  let score = 0;

  if (p.company_name || user?.display_name) score += COMPANY_SCORING_WEIGHTS.COMPANY_NAME;
  if (p.company_type) score += COMPANY_SCORING_WEIGHTS.COMPANY_TYPE;
  if (p.description && p.description.trim().length > 0) score += COMPANY_SCORING_WEIGHTS.DESCRIPTION;
  if (p.logo_url || user?.avatar_url) score += COMPANY_SCORING_WEIGHTS.LOGO;

  return Math.min(100, Math.max(0, score));
};

/**
 * Checks if company profile meets mandatory fields to proceed to KYC
 * @param {Object} profile
 * @param {Object} [user]
 * @returns {boolean}
 */
export const isCompanyProfileComplete = (profile, user) => {
  return calculateCompanyProfileScore(profile, user) === 100;
};

/**
 * Generates the interactive profile checklist for the hiring dashboard
 * @param {Object} profile
 * @param {Object} [user]
 * @returns {Array<Object>}
 */
export const getCompanyProfileChecklist = (profile, user) => {
  const data = profile || {};
  return [
    {
      id: 'company_name',
      emoji: '🏢',
      title: 'Company Name',
      hint: 'Registered or brand trade name',
      completed: !!(data.company_name || user?.display_name),
      weight: `+${COMPANY_SCORING_WEIGHTS.COMPANY_NAME}%`,
      color: '#3B82F6',
      bg: '#EFF6FF',
    },
    {
      id: 'company_type',
      emoji: '🎬',
      title: 'Company Type',
      hint: 'Production house, Casting, Studio, OTT',
      completed: !!data.company_type,
      weight: `+${COMPANY_SCORING_WEIGHTS.COMPANY_TYPE}%`,
      color: '#8B5CF6',
      bg: '#F5F3FF',
    },
    {
      id: 'description',
      emoji: '📝',
      title: 'About Company',
      hint: 'Overview of your casting work & projects',
      completed: !!(data.description && data.description.trim().length > 0),
      weight: `+${COMPANY_SCORING_WEIGHTS.DESCRIPTION}%`,
      color: '#F59E0B',
      bg: '#FFFBEB',
    },
    {
      id: 'logo_url',
      emoji: '🖼️',
      title: 'Company Logo',
      hint: 'Official brand avatar / production logo',
      completed: !!(data.logo_url || user?.avatar_url),
      weight: `+${COMPANY_SCORING_WEIGHTS.LOGO}%`,
      color: '#10B981',
      bg: '#ECFDF5',
    },
    {
      id: 'alternate_contact',
      emoji: '📞',
      title: 'Contact Details',
      hint: 'Alternate phone & official coordinator email',
      completed: !!(data.alternate_phone || data.alternate_email),
      weight: 'Bonus',
      color: '#06B6D4',
      bg: '#ECFEFF',
    },
  ];
};
