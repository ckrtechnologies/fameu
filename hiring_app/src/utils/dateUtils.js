export const getAuditionLiveStatus = (item) => {
  if (item.status === 'closed' || item.status === 'expired') {
    return { text: 'Closed', color: '#64748B' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Audition date is the main date to check if open or closed
  let targetDateStr = item.audition_date || item.date || item.specific_start_date;
  if (!targetDateStr && item.instructions) {
    try {
      const inst = typeof item.instructions === 'string' ? JSON.parse(item.instructions) : item.instructions;
      targetDateStr = inst.walk_in_date || inst.audition_date || inst.specific_start_date;
    } catch(e){}
  }

  if (targetDateStr) {
    const targetDate = new Date(targetDateStr);
    targetDate.setHours(0, 0, 0, 0);
    if (targetDate.getTime() === today.getTime() || item.is_live) {
      return { text: 'Live', color: '#EF4444' };
    }
    if (targetDate.getTime() < today.getTime()) {
      return { text: 'Closed', color: '#64748B' };
    }
  }

  return { text: 'Active', color: '#10B981' };
};
