const Queue =require('bull');
const redisConfig = require('../config/redis');

const imageQueue =new Queue('image-queue',{
    redis: redisConfig,
});

imageQueue.defaultJobOptions = {
    attempts: 3,
    backoff: {
        type: 'exponential',
        delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,

}

imageQueue.on('completed', (job, result) =>{
    console.log(`Job ${job.id} completed successfully`);
});

imageQueue.on('failed', (job, err) =>{
    console.error(`Job ${job.id} failed with error: ${err.message}`);
});

module.exports = imageQueue;