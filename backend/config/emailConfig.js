const nodemailer = require('nodemailer');

const DEFAULTS ={
    FROM_EMAIL: '"RentalEase" <rentalease.app@gmail.com>',
    SMTP_PORT: 587,
    SMTP_TIMEOUT: 10000
}

const validateEnv = () =>{
    const requiredVars=[
        'EMAIL_HOST',   
        'EMAIL_PORT',
        'EMAIL_USER',
        'EMAIL_PASSWORD',
        'EMAIL_FROM',
    ];

    const missingVars = requiredVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
        throw new Error(
        `Missing required email configuration environment variables: ${missingVars.join(', ')}`
        );
    }
}

const createTransportConfig=()=>{
    try{
        validateEnv();
        return {
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT, 10) || DEFAULTS.SMTP_PORT,
            secure: process.env.EMAIL_PORT === '465',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
            connectionTimeout: DEFAULTS.SMTP_TIMEOUT,
            greetingTimeout: DEFAULTS.SMTP_TIMEOUT,
            socketTimeout: DEFAULTS.SMTP_TIMEOUT,
            tls:{
                rejectUnauthorized: true,
                minVersion: 'TLSv1.2',
            },
            service: process.env.EMAIL_SERVICE || 'gmail',
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            rateDelta: 60000,
            rateLimit: 10,
            debug: process.env.NODE_ENV !== 'production',
            logger: process.env.NODE_ENV !== 'production',
        };
    } catch (error) {
        console.error('Error creating email transport config:', error);
        throw error;
    }
}

const transporter = nodemailer.createTransport(createTransportConfig());

const defaultEmailSettings = {
    from: process.env.EMAIL_FROM || DEFAULTS.FROM_EMAIL,
    headers: {
        'X-Mailer': 'RentalEase',
        'X-Priority': '3',
    },
};

transporter.verify((error, success) =>{
    if(error){
        console.error('Email server is not responding:', error);
    }else{
        console.log('Email server is ready to send emails');
    }
});

module.exports={
    transporter,
    defaultEmailSettings,
    getSupportProviders: () => [
        'gmail',
        'sendgrid',
        'ses',
        'mailgun',
    ],
}
