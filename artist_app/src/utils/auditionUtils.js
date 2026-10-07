export const getAuditionStatus = (auditionDate, dbStatus, validTill) => {
  if (dbStatus === 'closed' || dbStatus === 'expired') {
    return 'Closed';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (validTill) {
    const vDate = new Date(validTill);
    vDate.setHours(0, 0, 0, 0);
    if (vDate.getTime() < today.getTime()) {
      return 'Closed';
    }
  }

  if (!auditionDate) {
    return dbStatus === 'active' ? 'Active' : 'Closed';
  }

  const audDate = new Date(auditionDate);
  audDate.setHours(0, 0, 0, 0);

  if (audDate.getTime() === today.getTime()) {
    return 'Live';
  } else if (!validTill && audDate.getTime() < today.getTime()) {
    return 'Closed';
  } else {
    return 'Active';
  }
};
