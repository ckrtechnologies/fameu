/**
 * Educated Error Formatter for Fameu
 * Transforms raw error objects, network issues, and database constraints
 * into clear, user-friendly explanations with actionable guidance.
 */

export function formatEducatedError(error, defaultContext = 'An unexpected error occurred.') {
  let rawMessage = '';
  
  if (typeof error === 'string') {
    rawMessage = error;
  } else if (error?.data?.error) {
    rawMessage = error.data.error;
  } else if (error?.data?.message) {
    rawMessage = error.data.message;
  } else if (error?.message) {
    rawMessage = error.message;
  } else if (error?.error) {
    rawMessage = error.error;
  } else {
    rawMessage = defaultContext;
  }

  const lower = rawMessage.toLowerCase();

  // 1. Audition Type / Mode Check Constraint
  if (lower.includes('audition_type') || (lower.includes('check constraint') && lower.includes('audition'))) {
    return {
      message: defaultContext,
      reason: 'The selected audition execution mode (Walk-in, Scheduled, or Online) was not accepted or required logistics fields were missing.',
      guidance: 'Please confirm that your Audition Execution Mode is selected and that all required venue address and date details are filled in before saving.'
    };
  }

  // 2. Self Profile Comment
  if (lower.includes('own profile') || lower.includes('comment on your own profile')) {
    return {
      message: defaultContext,
      reason: 'Fameu guidelines do not permit posting new comments on your own profile.',
      guidance: 'To reply to queries or feedback from artists, tap "Reply" directly beneath their comment.'
    };
  }

  // 3. Not Null / Mandatory Field Missing
  if (lower.includes('not-null') || lower.includes('required') || lower.includes('missing')) {
    const match = rawMessage.match(/column "([^"]+)"/);
    const colName = match ? match[1].replace(/_/g, ' ') : '';
    return {
      message: defaultContext,
      reason: colName 
        ? `The mandatory field "${colName}" is empty.` 
        : 'One or more required fields have not been filled in.',
      guidance: 'Please review all mandatory fields marked with an asterisk (*) across the form.'
    };
  }

  // 4. Credits / Balance
  if (lower.includes('credit') || lower.includes('balance') || lower.includes('insufficient')) {
    return {
      message: defaultContext,
      reason: 'Your account has insufficient posting credits to complete this action.',
      guidance: 'Please visit the billing section or contact Fameu support to recharge your credits.'
    };
  }

  // 5. Network / Connection Timeout
  if (lower.includes('network') || lower.includes('timeout') || lower.includes('fetch') || lower.includes('offline') || lower.includes('econnrefused')) {
    return {
      message: 'Network connection issue.',
      reason: 'The app was unable to establish a stable connection with the server.',
      guidance: 'Please check your Wi-Fi or cellular data connection and try again.'
    };
  }

  // 6. Authentication / Session Expired
  if (lower.includes('unauthorized') || lower.includes('jwt') || lower.includes('session') || lower.includes('token') || lower.includes('401')) {
    return {
      message: 'Authentication session expired.',
      reason: 'Your login credentials have expired for security reasons.',
      guidance: 'Please log out and sign back in to renew your session.'
    };
  }

  // 7. Duplicate / Unique Constraint
  if (lower.includes('duplicate') || lower.includes('already exists') || lower.includes('unique constraint')) {
    return {
      message: defaultContext,
      reason: 'A record with the same name, username, or details already exists.',
      guidance: 'Please choose a different name or edit your existing listing.'
    };
  }

  // 8. General cleaned error
  let cleaned = rawMessage
    .replace(/^Error:\s*/i, '')
    .replace(/^Failed to [^:]+:\s*/i, '')
    .trim();

  return {
    message: defaultContext,
    reason: cleaned || 'The server encountered an error while processing your request.',
    guidance: 'Please double-check your inputs. If this continues, please reach out to Fameu support.'
  };
}
