import cron from 'node-cron';

console.log('⏰ Analytics Worker started');

cron.schedule('*/5 * * * *', () => {
  console.log('🔄 Running analytics aggregation task...');
  console.log('TODO: Aggregate analytics data from Redis Streams');
});

console.log('📅 Scheduled: Analytics aggregation every 5 minutes');
