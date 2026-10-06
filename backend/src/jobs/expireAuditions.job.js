import cron from 'node-cron';
import supabase from '../config/supabase.js';

export const startExpireAuditionsJob = () => {
  // Run daily at midnight '0 0 * * *'
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Running expireAuditions job...');
    try {
      const today = new Date().toISOString().split('T')[0];

      // 1. Update auditions where valid_till < today and status != closed
      const { error: validTillErr } = await supabase
        .from('auditions')
        .update({ status: 'closed' })
        .lt('valid_till', today)
        .neq('status', 'closed');

      if (validTillErr) {
        console.error('[CRON] expireAuditions valid_till error:', validTillErr.message);
      }

      // 2. Fallback: Update legacy auditions where valid_till is NULL and date < today
      const { error: legacyErr } = await supabase
        .from('auditions')
        .update({ status: 'closed' })
        .is('valid_till', null)
        .lt('date', today)
        .neq('status', 'closed');

      if (legacyErr) {
        console.error('[CRON] expireAuditions legacy date error:', legacyErr.message);
      } else {
        console.log(`[CRON] expireAuditions finished successfully.`);
      }
    } catch (error) {
      console.error('[CRON] expireAuditions threw exception:', error);
    }
  });
};
