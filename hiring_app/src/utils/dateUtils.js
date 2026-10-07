export const getAuditionLiveStatus = (item) => {
  if (item.status === 'closed' || item.status === 'expired') {
    return { text: 'Closed', color: '#64748B' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check validity deadline first
  const expiryDateStr = item.valid_till || item.expiry_date;
  if (expiryDateStr) {
    const expiryDate = new Date(expiryDateStr);
    expiryDate.setHours(0, 0, 0, 0);
    if (expiryDate.getTime() < today.getTime()) {
      return { text: 'Closed', color: '#64748B' };
    }
  }

  let targetDateStr = item.audition_date || item.date || item.specific_start_date;
  if (!targetDateStr && item.instructions) {
    try {
      const inst = typeof item.instructions === 'string' ? JSON.parse(item.instructions) : item.instructions;
      targetDateStr = inst.walk_in_date || inst.specific_start_date;
    } catch(e){}
  }

  if (targetDateStr) {
    const targetDate = new Date(targetDateStr);
    targetDate.setHours(0, 0, 0, 0);
    if (targetDate.getTime() === today.getTime() || item.is_live) {
      return { text: 'Live', color: '#EF4444' };
    }
  }

  return { text: 'Active', color: '#10B981' };
};
