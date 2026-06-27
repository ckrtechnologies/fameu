import { startExpireAuditionsJob } from './expireAuditions.job.js';
import { startAnalyticsSnapshotJob } from './analyticsSnapshot.job.js';

export const startCronJobs = () => {
  console.log('[CRON] Initializing background jobs...');
  startExpireAuditionsJob();
  startAnalyticsSnapshotJob();
};
