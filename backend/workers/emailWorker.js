const emailQueue = require('../queues/email-queue');
const emailService = require('../services/emailService');

emailQueue.process('send-email', async (job) =>{
    const {type, to, data} = job.data;
    console.log(`Worker: Processing email for type: ${type}`);
    try{
        switch(type){
            case 'welcome':
                await emailService.sendWelcomeEmail(to, data.name);
                break;
            case 'password-reset':
                await emailService.sendPasswordResetEmail(to, data.name, data.resetToken);  
                break;
            case 'new-application':
                await emailService.sendNewApplicationEmail(to, data.ownerName, data.tenant, data.property, data.message);
                break;
            case 'application-status':
                await emailService.sendApplicationStatusEmailEnhanced(to, data.tenantName, data.status, {property: data.property, ownerMessage: data.ownerMessage});
                break;
            default:
                throw new Error('Invalid email type');
        }
        console.log(`Worker: Email sent successfully for type: ${type}`);
    }
    catch(error){
        console.error(`Worker: Error sending email for type: ${type}`, error);
        throw error;
    }
});
