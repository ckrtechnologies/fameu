import cron from 'node-cron';
import supabase from '../config/supabase.js';

export const startAnalyticsSnapshotJob = () => {
  // Run daily at 11:55 PM
  cron.schedule('55 23 * * *', async () => {
    console.log('[CRON] Running analyticsSnapshot job...');
    try {
      // Get counts
      const [users, auditions, applications] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('auditions').select('id', { count: 'exact', head: true }),
        supabase.from('applications').select('id', { count: 'exact', head: true })
      ]);

      const totalUsers = users.count || 0;
      const totalAuditions = auditions.count || 0;
      const totalApplications = applications.count || 0;

      // Note: A real table 'analytics_snapshots' should exist for this. 
      // If it doesn't, this will just log for now.
      const { error } = await supabase.from('analytics_snapshots').insert([{
        total_users: totalUsers,
        total_auditions: totalAuditions,
        total_applications: totalApplications,
        date: new Date().toISOString().split('T')[0]
      }]);

      if (error) {
        if (error.code === '42P01') {
          console.log('[CRON] analytics_snapshots table does not exist, logging stats: ', { totalUsers, totalAuditions, totalApplications });
        } else {
          console.error('[CRON] analyticsSnapshot error:', error.message);
        }
      } else {
        console.log(`[CRON] analyticsSnapshot finished successfully.`);
      }
    } catch (error) {
      console.error('[CRON] analyticsSnapshot threw exception:', error);
    }
  });
};
