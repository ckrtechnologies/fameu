import cron from 'node-cron';
import supabase from '../config/supabase.js';

export const startExpireAuditionsJob = () => {
  // Run daily at midnight '0 0 * * *'
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Running expireAuditions job...');
    try {
      const today = new Date().toISOString().split('T')[0];

      // Update auditions where date < today and status != closed
      const { data, error } = await supabase
        .from('auditions')
        .update({ status: 'closed' })
        .lt('date', today)
        .neq('status', 'closed');

      if (error) {
        console.error('[CRON] expireAuditions error:', error.message);
      } else {
        console.log(`[CRON] expireAuditions finished successfully.`);
      }
    } catch (error) {
      console.error('[CRON] expireAuditions threw exception:', error);
    }
  });
};
