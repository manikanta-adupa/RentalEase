const multer = require('multer');
const storage = multer.memoryStorage();

// Different file filters for different contexts
const imageFilter = (req, file, cb) => {
    try {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only images (JPEG, PNG, WebP) are allowed'), false);
        }   
    } catch (error) {
        console.error('Error in imageFilter:', error);
        cb(new Error('Error in image file filter'), false);
    }
}

const documentFilter = (req, file, cb) => {
    try {
        const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF documents and images are allowed'), false);
        }   
    } catch (error) {
        console.error('Error in documentFilter:', error);
        cb(new Error('Error in document file filter'), false);
    }
}

const allFilesFilter = (req, file, cb) => {
    try {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only images and PDFs are allowed'), false);
        }   
    } catch (error) {
        console.error('Error in allFilesFilter:', error);
        cb(new Error('Error in file filter'), false);
    }
}

// Different multer configurations for different contexts
const uploadImages = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5, // 5MB per image
        files: 5 // Max 5 images
    },
    fileFilter: imageFilter,
});

const handleMulterError = (err, res) => {
    if (err instanceof multer.MulterError) {
        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({ success: false, message: 'File too large. Maximum 5MB allowed.', code: 'FILE_TOO_LARGE' });
            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({ success: false, message: 'Too many files. Maximum 5 images allowed.', code: 'TOO_MANY_FILES' });
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({ success: false, message: `Unexpected file field. Expected 'images'.`, code: 'UNEXPECTED_FIELD' });
            default:
                return res.status(400).json({ success: false, message: `Upload error: ${err.message}`, code: 'UPLOAD_ERROR' });
        }
    } else if (err) {
        // Handle custom filter errors or other errors
        return res.status(400).json({ success: false, message: err.message, code: 'INVALID_FILE_TYPE' });
    }
    return null; // No error
};


const uploadPropertyImagesMiddleware = (req, res, next) => {
    console.log('📤 Upload middleware - processing files');
    const uploader = uploadImages.array('images', 5);
    uploader(req, res, function (err) {
        if (err) {
            console.error('📤 Upload middleware - error:', err.message);
        } else {
            console.log('📤 Upload middleware - success, files:', req.files ? req.files.length : 0);
        }
        
        const errorResponse = handleMulterError(err, res);
        if (errorResponse) {
            return; // Response already sent
        }
        // If no errors, proceed to the next middleware
        next();
    });
};

const uploadDocuments = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 10, // 10MB per document
        files: 10 // Max 10 documents
    },
    fileFilter: documentFilter,
});

const uploadApplicationDocs = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5, // 5MB per document
        files: 3 // Max 3 application documents
    },
    fileFilter: documentFilter,
});

const uploadMixed = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 10, // 10MB per file
        files: 15 // Max 15 total files
    },
    fileFilter: allFilesFilter,
});

// Enhanced error handling middleware
const handleUploadErrors = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({
                    success: false,
                    message: 'File too large. Maximum size varies by type (5MB for images, 10MB for documents).',
                    code: 'FILE_TOO_LARGE'
                });
            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({
                    success: false,
                    message: 'Too many files. Check the endpoint limits.',
                    code: 'TOO_MANY_FILES'
                });
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({
                    success: false,
                    message: 'Unexpected file field. Check the field name.',
                    code: 'UNEXPECTED_FIELD'
                });
            default:
                return res.status(400).json({
                    success: false,
                    message: `Upload error: ${error.message}`,
                    code: 'UPLOAD_ERROR'
                });
        }
    }
    
    // Handle custom filter errors
    if (error.message.includes('Only images')) {
        return res.status(400).json({
            success: false,
            message: 'Invalid file type. Only images (JPEG, PNG, WebP) allowed.',
            code: 'INVALID_IMAGE_TYPE'
        });
    }
    
    if (error.message.includes('Only PDF') || error.message.includes('documents')) {
        return res.status(400).json({
            success: false,
            message: 'Invalid file type. Only PDF documents and images allowed.',
            code: 'INVALID_DOCUMENT_TYPE'
        });
    }
    
    if (error.message.includes('Only images and PDFs')) {
        return res.status(400).json({
            success: false,
            message: 'Invalid file type. Only images (JPEG, PNG, WebP) and PDFs allowed.',
            code: 'INVALID_FILE_TYPE'
        });
    }
    
    // Generic error
    console.error('Upload middleware error:', error);
    return res.status(500).json({
        success: false,
        message: 'File upload error occurred.',
        code: 'UPLOAD_SYSTEM_ERROR'
    });
};

// Validation middleware for file requirements
const validateFileUpload = (minFiles = 0, maxFiles = 10, context = 'files') => {
    return (req, res, next) => {
        console.log(`✅ Validate ${context} - min: ${minFiles}, max: ${maxFiles}`);
        const files = req.files;
        const fileCount = files ? files.length : 0;
        console.log(`✅ Validate ${context} - received: ${fileCount} files`);
        
        if (!files || files.length === 0) {
            if (minFiles > 0) {
                console.log(`❌ Validate ${context} - insufficient files: need ${minFiles}, got ${fileCount}`);
                return res.status(400).json({
                    success: false,
                    message: `At least ${minFiles} ${context} required.`,
                    code: 'INSUFFICIENT_FILES'
                });
            }
        }
        
        if (files && files.length > maxFiles) {
            console.log(`❌ Validate ${context} - too many files: max ${maxFiles}, got ${fileCount}`);
            return res.status(400).json({
                success: false,
                message: `Maximum ${maxFiles} ${context} allowed.`,
                code: 'TOO_MANY_FILES'
            });
        }
        
        console.log(`✅ Validate ${context} - passed validation`);
        next();
    };
};

module.exports = {
    // Property images (images only, max 5)
    uploadPropertyImages: uploadPropertyImagesMiddleware,
    
    // Property documents (PDFs + images, max 10)
    uploadPropertyDocuments: uploadDocuments.array('documents', 10),
    
    // Application documents (PDFs + images, max 3)
    uploadApplicationDocuments: uploadApplicationDocs.array('documents', 3),
    
    // Mixed files (for complex scenarios)
    uploadMixed: uploadMixed.fields([
        { name: 'images', maxCount: 5 },
        { name: 'documents', maxCount: 10 }
    ]),
    
    // Single file uploads
    uploadSingleImage: uploadImages.single('image'),
    uploadSingleDocument: uploadDocuments.single('document'),
    
    // Error handling
    handleUploadErrors,
    
    // Validation helpers
    validateFileUpload,
    validatePropertyImages: validateFileUpload(0, 5, 'images'),
    validatePropertyDocuments: validateFileUpload(0, 10, 'documents'),
    validateApplicationDocuments: validateFileUpload(1, 3, 'documents')
};