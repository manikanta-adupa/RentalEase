// Load environment variables when running directly
require("dotenv").config();

const validator = require("validator");
const handlebars = require("handlebars");

// Register Handlebars helpers
handlebars.registerHelper('eq', (a, b) => a === b);
handlebars.registerHelper('lt', (a, b) => a < b);
handlebars.registerHelper('gt', (a, b) => a > b);
handlebars.registerHelper('multiply', (a, b) => a * b);
handlebars.registerHelper('math', (a) => Math.abs(a));
const winston = require("winston");
const fs = require("fs");
const path = require("path");
const pLimit = require("p-limit");
const {
  transporter,
  defaultEmailSettings,
  getSupportProviders,
} = require("../config/emailConfig");

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: "logs/email.log",
    }),
    new winston.transports.Console(),
  ],
});

const limit = pLimit(10);

const createResponse = (success, message, data = null, error = null) => ({
  success,
  message,
  data,
  error: error ? error.message : null,
});

const validateEmailInput = ({ to, subject, html, text, attachments }) => {
  const errors = [];
  if (!to || !validator.isEmail(to)) {
    errors.push("Invalid or missing recipient email address");
  }
  if (!subject || typeof subject !== "string" || subject.trim().length === 0) {
    errors.push("Invalid or missing email subject");
  }
  if (!html && !text) {
    errors.push("Email content (HTML or text) is required");
  }
  if (attachments && !Array.isArray(attachments)) {
    errors.push("Attachments must be an array");
  }

  return errors.length > 0 ? errors : null;
};


const renderTemplate = (template, context) =>{
    try {
        const compiledTemplate= handlebars.compile(template);
        return compiledTemplate(context);   
    } catch (error) {
        logger.error('Error rendering email template:', error);
        throw error;
    }
}

const loadTemplate = async (templateName, context) => {
    try {
        // Load main layout
        const layoutPath = path.join(__dirname, '../templates/email/layouts/main.hbs');
        const layout = fs.readFileSync(layoutPath, 'utf8');
        
        // Load specific template
        const templatePath = path.join(__dirname, `../templates/email/${templateName}.hbs`);
        const template = fs.readFileSync(templatePath, 'utf8');
        
        // Render the specific template
        const compiledTemplate = handlebars.compile(template);
        const renderedTemplate = compiledTemplate(context);
        
        // Render with layout
        const compiledLayout = handlebars.compile(layout);
        return compiledLayout({
            ...context,
            body: renderedTemplate,
            title: context.title || 'RentalEase'
        });
        
    } catch (error) {
        logger.error('Error loading template:', error);
        throw error;
    }
};

const sendEmail = async (to, subject, html, text, attachments) =>{
    try {
        const validationErrors = validateEmailInput({to, subject, html, text, attachments});
        if(validationErrors){
            return createResponse(false, 'Validation failed', null, {validationErrors});
        }
        const emailOptions={
            ...defaultEmailSettings,
            to,
            subject,
            html,
            text,
            attachments,
        }
        logger.info('Sending email to:', to);
        const result = await limit(() => transporter.sendMail(emailOptions));
        logger.info('Email sent successfully:', result.messageId);
        return createResponse(true, 'Email sent successfully', result);
    }
    catch(error){
        logger.error('Error sending email:', error);
        return createResponse(false, 'Email sending failed', null, {error: error.message});
    }
}

const sendBulkEmails = async (emails) =>{
    try {
        const results = await Promise.all(emails.map(email => limit(() => sendEmail(email.to, email.subject, email.html, email.text, email.attachments))));
        return results.filter(result => result.success).map(result => result.data);     
    }
    catch(error){   
        logger.error('Error sending bulk emails:', error);
        return createResponse(false, 'Bulk email sending failed', null, {error: error.message});
    }
}

const sendWelcomeEmail = async (to, name) =>{
    try {
        const context = {name};
        const html = await loadTemplate('welcome', context);
        const text = `Welcome to our platform, ${name}!`;
        const result = await sendEmail(to, 'Welcome to RentalEase', html, text);
        logger.info('Welcome email sent successfully:', result.messageId);
        return result;
    }
    catch(error){
        logger.error('Error sending welcome email:', error);
        return createResponse(false, 'Welcome email sending failed', null, {error: error.message});
    }
}

const sendApplicationStatusEmail = async (to, name, status) =>{
    try {
        const context = {name, status};
        const html = await loadTemplate('application-status', context);
        const text = `Your application status has been updated to ${status}.`;
        const result = await sendEmail(to, 'Application Status Update', html, text);
        logger.info('Application status email sent successfully:', result.messageId);
        return result;
    }
    catch(error){
        logger.error('Error sending application status email:', error);
        return createResponse(false, 'Application status email sending failed', null, {error: error.message});
    }
}

const sendRentReminderEmail = async (to, tenantName, property, options = {}) =>{
    try {
        const context = {
            tenantName,
            property,
            dueDate: options.dueDate || property.rentDueDate,
            daysUntilDue: options.daysUntilDue || 3,
            paymentStatus: options.paymentStatus || 'Pending',
            lateFeePolicy: options.lateFeePolicy,
            ownerName: options.ownerName || property.owner?.name,
            ownerEmail: options.ownerEmail || property.owner?.email,
            ownerPhone: options.ownerPhone || property.owner?.phone,
            email: to
        };
        const html = await loadTemplate('rent-reminder', context);
        const text = `Your rent is due on ${context.dueDate}.`;
        const result = await sendEmail(to, 'Rent Payment Reminder', html, text);
        logger.info('Rent reminder email sent successfully:', result.messageId);
        return result;
    }
    catch(error){
        logger.error('Error sending rent reminder email:', error);
        return createResponse(false, 'Rent reminder email sending failed', null, {error: error.message});
    }
}

// Enhanced application status function
const sendApplicationStatusEmailEnhanced = async (to, tenantName, status, options = {}) => {
    try {
        const context = {
            name: tenantName,
            status, 
            ownerMessage: options.ownerMessage,
            property: options.property,
            email: to
        };
        const html = await loadTemplate('application-status', context);
        const text = `Your application status has been updated to ${status}.`;
        const result = await sendEmail(to, 'Application Status Update', html, text);
        logger.info('Application status email sent successfully:', result.messageId);
        return result;
    }
    catch(error){
        logger.error('Error sending application status email:', error);
        return createResponse(false, 'Application status email sending failed', null, {error: error.message});
    }
}

// Send new application notification to property owner
const sendNewApplicationEmail = async (to, ownerName, tenant, property, applicationText = '') => {
    try {
        const context = {
            ownerName,
            tenant: {
                name: tenant.name,
                email: tenant.email,
                phone: tenant.phone,
                address: tenant.address
            },
            property: {
                title: property.title,
                address: property.address,
                city: property.city,
                state: property.state,
                monthlyRent: property.monthlyRent
            },
            applicationText,
            email: to
        };
        
        const html = await loadTemplate('new-application', context);
        const text = `New rental application received for ${property.title} from ${tenant.name}. Email: ${tenant.email}, Phone: ${tenant.phone}`;
        
        const result = await sendEmail(to, '🏠 New Rental Application Received', html, text);
        logger.info('New application email sent successfully:', result.messageId);
        return result;
    }
    catch(error){
        logger.error('Error sending new application email:', error);
        return createResponse(false, 'New application email sending failed', null, {error: error.message});
    }
}

//send password reset email
const sendPasswordResetEmail = async (to, name, resetToken) =>{
    try{
        // Create mobile app deep link
        const resetLink = `rentalease://reset-password?token=${resetToken}`;
        
        const context = {
            name,
            resetLink,
            expiration: 60 // 1 hour in minutes
        }
        const html = await loadTemplate('password-reset', context);
        const text = `Reset your password by opening this link in the RentalEase app: ${resetLink}`;
        const result = await sendEmail(to, '🔐 Password Reset Request', html, text);
        logger.info('Password reset email sent successfully:', result.messageId);
        return result;
    }
    catch(error){
        logger.error('Error sending password reset email:', error);
        return createResponse(false, 'Password reset email sending failed', null, {error: error.message});
    }
}

//send email verification email

const sendEmailVerificationEmail = async (to, name, verificationToken) =>{
    try{
        const context = {
            name,
            verificationLink: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`,
            expiration: 3600000 / 60000 //1 hour in minutes
        }
        const html = await loadTemplate('email-verification', context);
        const text = `Click the link below to verify your email: ${context.verificationLink}`;
        const result = await sendEmail(to, '✅ Verify Your Email', html, text);
        logger.info('Email verification email sent successfully:', result.messageId);
        return result;
    }
    catch(error){
        logger.error('Error sending email verification email:', error);
        return createResponse(false, 'Email verification email sending failed', null, {error: error.message});
    }
}

// Test function for all email templates
// const testEmailService = async (testEmailAddress = 'test@example.com') => {
//     console.log('🧪 Testing Email Service...\n');
    
//     try {
//         // Test 1: Welcome Email
//         console.log('1️⃣ Testing Welcome Email...');
//         const welcomeResult = await sendWelcomeEmail(testEmailAddress, 'John Doe');
//         console.log(welcomeResult.success ? '✅ Welcome email test passed' : '❌ Welcome email test failed');
        
//         // Test 2: Application Status Email
//         console.log('\n2️⃣ Testing Application Status Email...');
//         const statusResult = await sendApplicationStatusEmailEnhanced(
//             testEmailAddress, 
//             'John Doe', 
//             'approved',
//             { ownerMessage: 'Welcome! Looking forward to having you as our tenant.' }
//         );
//         console.log(statusResult.success ? '✅ Application status email test passed' : '❌ Application status email test failed');
        
//         // Test 3: Rent Reminder Email
//         console.log('\n3️⃣ Testing Rent Reminder Email...');
//         const reminderResult = await sendRentReminderEmail(
//             testEmailAddress,
//             'John Doe',
//             { 
//                 address: '123 Test Street',
//                 city: 'Mumbai',
//                 state: 'Maharashtra',
//                 monthlyRent: 25000,
//                 owner: { name: 'Property Owner', email: 'owner@example.com', phone: '+91-9876543210' }
//             },
//             {
//                 dueDate: '2024-01-01',
//                 daysUntilDue: 3,
//                 paymentStatus: 'Pending',
//                 lateFeePolicy: 'Late fee of ₹500 will be charged after 3 days of due date.'
//             }
//         );
//         console.log(reminderResult.success ? '✅ Rent reminder email test passed' : '❌ Rent reminder email test failed');
        
//         console.log('\n🎉 Email service testing completed!');
//         return true;
        
//     } catch (error) {
//         console.error('❌ Email service test failed:', error);
//         return false;
//     }
// }

module.exports = {
    // Core functions
    sendEmail,
    sendBulkEmails,
    
    // Basic template functions
    sendWelcomeEmail,
    sendApplicationStatusEmail,
    sendRentReminderEmail,
    
    // Enhanced functions with better context
    sendApplicationStatusEmailEnhanced,
    sendNewApplicationEmail,
    
    // Password reset and verification functions
    sendPasswordResetEmail,
    sendEmailVerificationEmail,
    
    // Testing function
    // testEmailService,
    
    // Utility functions
    loadTemplate,
    renderTemplate
}

// TEMPORARY: Remove this after testing
// if (require.main === module) {
//     // Quick test - replace with your email
//     testEmailService('test@example.com')
//         .then(() => console.log('✅ All tests completed'))
//         .catch(err => console.error('❌ Test failed:', err));
// }