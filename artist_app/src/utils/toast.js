/**
 * Fameu Toast Utility
 * Wraps react-native-toast-message with typed helpers.
 */
import Toast from 'react-native-toast-message';

export const showSuccess = (title, message) => {
  Toast.show({ type: 'fameuSuccess', text1: title, text2: message, position: 'top', topOffset: 60, visibilityTime: 3000 });
};

export const showError = (title, message) => {
  Toast.show({ type: 'fameuError', text1: title || 'Something went wrong', text2: message, position: 'top', topOffset: 60, visibilityTime: 4000 });
};

export const showWarning = (title, message) => {
  Toast.show({ type: 'fameuWarning', text1: title, text2: message, position: 'top', topOffset: 60, visibilityTime: 3500 });
};

export const showInfo = (title, message) => {
  Toast.show({ type: 'fameuInfo', text1: title, text2: message, position: 'top', topOffset: 60, visibilityTime: 3000 });
};

export const getErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred.';
  if (typeof error === 'string') return error;
  return (
    error?.data?.error ||
    error?.data?.message ||
    error?.message ||
    error?.error ||
    'An unexpected error occurred.'
  );
};

export const useToast = () => ({ showSuccess, showError, showWarning, showInfo, getErrorMessage });
