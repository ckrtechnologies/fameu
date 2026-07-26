export const getAuditionStatus = (auditionDate, dbStatus) => {
  if (dbStatus === 'closed') {
    return 'Closed';
  }

  if (!auditionDate) {
    return dbStatus === 'active' ? 'Active' : 'Closed';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const audDate = new Date(auditionDate);
  audDate.setHours(0, 0, 0, 0);

  if (audDate.getTime() === today.getTime()) {
    return 'Live';
  } else if (audDate.getTime() < today.getTime()) {
    return 'Closed';
  } else {
    return 'Active';
  }
};
