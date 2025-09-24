const { body, param, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// ObjectId validation middleware
const validateObjectId = (paramName = 'id') => [
    param(paramName)
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error(`Invalid ${paramName} format`);
            }
            return true;
        })
        .withMessage(`${paramName} must be a valid ObjectId`),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array()
            });
        }
        next();
    }
];

const validateRegistration = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address'),
        
    body('password')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8-128 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
        
    body('name')
        .trim()
        .escape()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2-50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),
        
    body('phone')
        .isMobilePhone('any', { strictMode: false })
        .withMessage('Please provide a valid phone number'),
        
    body('address')
        .optional()
        .trim()
        .escape()
        .isLength({ max: 200 })
        .withMessage('Address must be less than 200 characters'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array()
            });
        }
        next();
    }
];

const validateLogin = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address'),
        
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 1, max: 128 })
        .withMessage('Password cannot be empty'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array()
            });
        }
        next();
    }
];

// Property validation middleware (was missing!)
const validateProperty = [
    body('title')
        .trim()
        .isLength({ min: 10, max: 100 })
        .withMessage('Title must be between 10-100 characters'),
        
    body('description')
        .trim()
        .isLength({ min: 20, max: 1000 })
        .withMessage('Description must be between 20-1000 characters'),
        
    body('propertyType')
        .isIn(['house', 'apartment', 'villa', 'room', 'pg', 'studio', 'office', 'warehouse', 'other'])
        .withMessage('Invalid property type'),
        
    body('furnishingStatus')
        .isIn(['fullyFurnished', 'semiFurnished', 'unfurnished'])
        .withMessage('Invalid furnishing status'),
        
    body('city')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('City must be between 2-50 characters'),
        
    body('state')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('State must be between 2-50 characters'),
        
    body('monthlyRent')
        .isNumeric()
        .withMessage('Monthly rent must be a number')
        .isFloat({ min: 1, max: 10000000 })
        .withMessage('Monthly rent must be between 1 and 10,000,000'),
        
    body('securityDeposit')
        .isNumeric()
        .withMessage('Security deposit must be a number')
        .isFloat({ min: 0, max: 50000000 })
        .withMessage('Security deposit must be between 0 and 50,000,000'),
        
    body('bedRooms')
        .isInt({ min: 0, max: 20 })
        .withMessage('Bedrooms must be between 0 and 20'),
        
    body('bathRooms')
        .isInt({ min: 1, max: 20 })
        .withMessage('Bathrooms must be between 1 and 20'),
        
    body('area')
        .isNumeric()
        .withMessage('Area must be a number')
        .isFloat({ min: 50, max: 100000 })
        .withMessage('Area must be between 50 and 100,000 sq ft'),
        
    body('coordinates.latitude')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),
        
    body('coordinates.longitude')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),
        
    body('amenities')
        .optional()
        .isArray({ max: 20 })
        .withMessage('Cannot have more than 20 amenities'),
    
    (req, res, next) => {
        console.log('🔍 Property validation - checking request body');
        console.log('🔍 Request body keys:', Object.keys(req.body));
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error('❌ Property validation failed:');
            console.error('❌ Validation errors:', errors.array());
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array()
            });
        }
        
        console.log('✅ Property validation passed');
        next();
    }
];

// Enhanced application creation validation with better security
const validateApplicationCreation = [
    body('property')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid property ID format');
            }
            return true;
        })
        .withMessage('Property ID must be a valid ObjectId'),
        
    body('message')
        .trim()
        .escape() // XSS protection
        .isLength({ min: 10, max: 1000 })
        .withMessage('Application message must be between 10-1000 characters'),
        
    body('preferredMoveInDate')
        .optional()
        .isISO8601()
        .withMessage('Move-in date must be a valid date')
        .custom((value) => {
            const moveInDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time to start of day
            
            if (moveInDate < today) {
                throw new Error('Move-in date cannot be in the past');
            }
            
            // Don't allow more than 1 year in advance
            const oneYearFromNow = new Date();
            oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
            
            if (moveInDate > oneYearFromNow) {
                throw new Error('Move-in date cannot be more than 1 year in advance');
            }
            
            return true;
        }),
        
    body('tenantInfo.monthlyIncome')
        .optional()
        .isNumeric()
        .withMessage('Monthly income must be a number')
        .isFloat({ min: 0, max: 10000000 })
        .withMessage('Monthly income must be between 0 and 10,000,000'),
        
    body('tenantInfo.familySize')
        .optional()
        .isInt({ min: 1, max: 20 })
        .withMessage('Family size must be between 1 and 20'),
        
    body('documents')
        .optional()
        .isArray({ max: 10 })
        .withMessage('Cannot upload more than 10 documents'),
        
    body('documents.*.type')
        .optional()
        .isIn(['id_proof', 'salary_slip', 'bank_statement', 'reference_letter', 'other'])
        .withMessage('Invalid document type'),
        
    body('documents.*.url')
        .optional()
        .isURL()
        .withMessage('Document URL must be valid'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array()
            });
        }
        next();
    }
];

// Enhanced application status validation
const validateApplicationStatus = [
    body('status')
        .isIn(['approved', 'rejected'])
        .withMessage('Status must be either approved or rejected'),
        
    body('ownerResponse')
        .trim()
        .escape() // XSS protection
        .isLength({ min: 10, max: 500 })
        .withMessage('Owner response must be between 10-500 characters'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array()
            });
        }
        next();
    }
];

// Enhanced pagination validation with better limits
const validatePagination = [
    (req, res, next) => {
        // Validate query parameters for pagination
        const { page, limit, status } = req.query;
        
        if (page && (!Number.isInteger(+page) || +page < 1 || +page > 1000)) {
            return res.status(400).json({
                success: false,
                message: 'Page must be a positive integer between 1 and 1000'
            });
        }
        
        if (limit && (!Number.isInteger(+limit) || +limit < 1 || +limit > 100)) {
            return res.status(400).json({
                success: false,
                message: 'Limit must be a positive integer between 1 and 100'
            });
        }
        
        if (status && !['pending', 'approved', 'rejected', 'withdrawn', 'expired'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be pending, approved, rejected, withdrawn, or expired'
            });
        }
        
        next();
    }
];

module.exports = { 
    validateRegistration, 
    validateLogin, 
    validateProperty,
    validateApplicationCreation,
    validateApplicationStatus,
    validatePagination,
    validateObjectId
};