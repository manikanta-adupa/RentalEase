const app = require('./server');

app.connectDB();

require('./workers/imageWorker');
require('./workers/emailWorker');

console.log('Worker started');