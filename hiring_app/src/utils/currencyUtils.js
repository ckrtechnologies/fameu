/**
 * Utility functions for Indian Rupee (INR) currency formatting
 * Follows CKR standard: ₹ with Indian grouping, e.g. ₹1,29,999
 */

export const formatINR = (value) => {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'string' && (value.includes('₹') || value.includes('Rs') || value.includes('INR'))) {
    return value;
  }
  const cleanStr = String(value).replace(/[^0-9.-]+/g, '');
  if (!cleanStr) return String(value);
  const num = Number(cleanStr);
  if (isNaN(num)) return String(value);
  return '₹' + num.toLocaleString('en-IN');
};

export const formatINRRange = (min, max) => {
  if (!min && !max) return 'Unspecified';
  if (min && max) return `${formatINR(min)} - ${formatINR(max)}`;
  if (min) return `${formatINR(min)}+`;
  return `Up to ${formatINR(max)}`;
};
