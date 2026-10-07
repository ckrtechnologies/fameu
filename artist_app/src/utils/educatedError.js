/**
 * Educated Error Formatter for Fameu (Artist App)
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

  // 1. Application Already Submitted
  if (lower.includes('already applied') || lower.includes('duplicate application') || lower.includes('already submitted')) {
    return {
      message: 'Application already submitted.',
      reason: 'You have already applied for this role/audition.',
      guidance: 'You can check your status updates and feedback anytime in the "My Applications" tab.'
    };
  }

  // 2. Closed / Expired Audition
  if (lower.includes('audition closed') || lower.includes('deadline passed') || lower.includes('no longer accepting')) {
    return {
      message: 'Audition is closed.',
      reason: 'The casting director has closed submissions for this audition.',
      guidance: 'Explore other open auditions that match your profile in the "Discovery" tab.'
    };
  }

  // 3. Self Profile Comment
  if (lower.includes('own profile') || lower.includes('comment on your own profile')) {
    return {
      message: defaultContext,
      reason: 'Fameu guidelines do not permit posting new comments on your own profile.',
      guidance: 'To reply to feedback or queries from recruiters, tap "Reply" directly beneath their comment.'
    };
  }

  // 4. Not Null / Mandatory Field Missing
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
      reason: 'A record with the same details or username already exists.',
      guidance: 'Please modify your entry and try again.'
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
    guidance: 'Please review your inputs. If this persists, please reach out to Fameu support.'
  };
}
