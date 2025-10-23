const Queue = require('bull');
const redisConfig = require('../config/redis');

const emailQueue = new Queue('email-queue', {
    redis: redisConfig,
});

emailQueue.defaultJobOptions = {
    attempts: 3,
    backoff:{
        type: 'exponential',
        delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
    }

emailQueue.on('completed', (job, result) =>{
    console.log(`Job ${job.id} completed successfully`);
});

emailQueue.on('failed', (job, err) =>{
    console.error(`Job ${job.id} failed with error: ${err.message}`);
});

module.exports = emailQueue;