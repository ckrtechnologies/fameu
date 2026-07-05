export const getAuditionLiveStatus = (item) => {
  let targetDateStr = item.audition_date || item.date || item.specific_start_date;
  if (!targetDateStr && item.instructions) {
    try {
      const inst = typeof item.instructions === 'string' ? JSON.parse(item.instructions) : item.instructions;
      targetDateStr = inst.walk_in_date || inst.specific_start_date;
    } catch(e){}
  }

  if (!targetDateStr) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(targetDateStr);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return null; // Or { text: 'Closed', color: '#64748B' }
  }
  
  if (diffDays === 0) {
    return { text: 'Live Now', color: '#EF4444' };
  } else if (diffDays === 1 || diffDays === 2) {
    return { text: `Live in ${diffDays * 24} hours`, color: '#F59E0B' };
  } else if (diffDays <= 7) {
    return { text: `Live in ${diffDays} days`, color: '#3B82F6' };
  } else if (diffDays <= 15) {
    return { text: `Live in ${diffDays} days`, color: '#10B981' };
  } else if (diffDays <= 90) {
    return { text: `Live in ${diffDays} days`, color: '#8B5CF6' };
  }
  
  return null;
};
