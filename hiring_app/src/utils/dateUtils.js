export const getAuditionLiveStatus = (item) => {
  if (item.status === 'closed') {
    return { text: 'Closed', color: '#64748B' };
  }

  let targetDateStr = item.audition_date || item.date || item.specific_start_date;
  if (!targetDateStr && item.instructions) {
    try {
      const inst = typeof item.instructions === 'string' ? JSON.parse(item.instructions) : item.instructions;
      targetDateStr = inst.walk_in_date || inst.specific_start_date;
    } catch(e){}
  }

  if (!targetDateStr) {
    return { text: 'Active', color: '#10B981' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(targetDateStr);
  targetDate.setHours(0, 0, 0, 0);

  if (targetDate.getTime() === today.getTime()) {
    return { text: 'Live', color: '#EF4444' };
  } else if (targetDate.getTime() < today.getTime()) {
    return { text: 'Closed', color: '#64748B' };
  } else {
    return { text: 'Active', color: '#10B981' };
  }
};
