const express = require('express');
const router = express.Router();

// Import middleware
const { auth } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
// const { requireApplicationOwner } = require('../middleware/roleMiddleware');

// Import validation middleware
const { 
  validateApplicationCreation,
  validateApplicationStatus,
  validatePagination,
  validateObjectId
} = require('../middleware/validation');

// Import upload middleware
const {
    uploadApplicationDocuments: uploadApplicationDocumentsMiddleware,
    uploadSingleDocument,
    handleUploadErrors,
    validateApplicationDocuments
} = require('../middleware/upload');

// Import controller functions
const {
  createApplication,
  getMyApplications,
  getApplicationsForMyProperties,
  getApplicationById,
  updateApplicationStatus,
  withdrawApplication,
  getApplicationsByProperty,
  getApplicationStats,
  getAllApplicationsDebug,
  fixInconsistentData,
  diagnoseDataInconsistencies
} = require('../controllers/applicationController');

// Import file service functions
const {
    uploadApplicationDocuments,
    getApplicationDocuments,
    replaceApplicationDocument,
    deleteApplicationDocument,
    deleteAllApplicationFiles
} = require('../services/imageService');

// Apply rate limiting to all routes
router.use(apiLimiter);

// Apply authentication to all routes
router.use(auth);

// ===========================
// APPLICATION CRUD ROUTES
// ===========================

// @route   POST /api/applications
// @desc    Create new application (Tenant applies for property)
// @access  Private (Tenant only)
router.post('/', validateApplicationCreation, createApplication);

// @route   GET /api/applications
// @desc    Get applications (filtered by user role and status)
// @access  Private
router.get('/my', validatePagination, getMyApplications);

// @route   GET /api/applications/received
// @desc    Get applications received for my properties (as owner)
// @access  Private
router.get('/received', validatePagination, getApplicationsForMyProperties);

// @route   GET /api/applications/stats
// @desc    Get application statistics for dashboard
// @access  Private
router.get('/stats', getApplicationStats);

// @route   GET /api/applications/debug/all
// @desc    Debug: Get all applications in database
// @access  Private (Temporary debug endpoint)
router.get('/debug/all', getAllApplicationsDebug);

// @route   GET /api/applications/debug/diagnose
// @desc    Debug: Diagnose data inconsistencies
// @access  Private (Temporary debug endpoint)
router.get('/debug/diagnose', diagnoseDataInconsistencies);

// @route   POST /api/applications/debug/fix
// @desc    Debug: Fix data inconsistencies retroactively
// @access  Private (Temporary debug endpoint)
router.post('/debug/fix', fixInconsistentData);

// @route   GET /api/applications/property/:propertyId
// @desc    Get applications for specific property (Owner only)
// @access  Private (Owner only)
router.get('/property/:propertyId', validateObjectId('propertyId'), validatePagination, getApplicationsByProperty);

// @route   GET /api/applications/:id
// @desc    Get single application by ID
// @access  Private
router.get('/:id', validateObjectId('id'), getApplicationById);

// @route   PUT /api/applications/:id
// @desc    Update application status (Owner approves/rejects)
// @access  Private (Owner only)
router.put('/:id', validateObjectId('id'), validateApplicationStatus, updateApplicationStatus);

// @route   PUT /api/applications/:id/withdraw
// @desc    Withdraw application (Tenant cancels)
// @access  Private (Tenant only)
router.put('/:id/withdraw', validateObjectId('id'), withdrawApplication);

// ===========================
// APPLICATION DOCUMENT MANAGEMENT ROUTES
// ===========================

// @route   POST /api/applications/:applicationId/documents
// @desc    Upload documents for application (Tenant only)
// @access  Private (Application owner - tenant)
router.post('/:applicationId/documents',
    validateObjectId('applicationId'),
    // requireApplicationOwner,
    uploadApplicationDocumentsMiddleware,
    handleUploadErrors,
    validateApplicationDocuments,
    async (req, res) => {
        try {
            // Extract document types from request body
            const documentTypes = req.body.documentTypes ? 
                JSON.parse(req.body.documentTypes) : 
                req.files.map(() => 'other');
            //check if the application is owned by the user
            const application = await Application.findById(req.params.applicationId);
            if (!application) {
                return res.status(404).json({
                    success: false,
                    message: "Application not found",
                });
            }
            if (application.tenant.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to upload documents for this application",
                });
            }

            const result = await uploadApplicationDocuments(
                req.files, 
                req.params.applicationId, 
                documentTypes
            );
            
            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Error in application documents upload route:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during document upload'
            });
        }
    }
);

// @route   GET /api/applications/:applicationId/documents
// @desc    Get application documents (Tenant + Property Owner can view)
// @access  Private (Application owner or property owner)
router.get('/:applicationId/documents',
    validateObjectId('applicationId'),
    async (req, res) => {
        try {
            const options = {
                limit: parseInt(req.query.limit) || 50,
                cursor: req.query.cursor
            };
            //check if the application is owned by the user
            const application = await Application.findById(req.params.applicationId);
            if (!application) {
                return res.status(404).json({
                    success: false,
                    message: "Application not found",
                });
            }
            if (application.tenant.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to view documents for this application",
                });
            }
            const result = await getApplicationDocuments(req.params.applicationId, options);
            
            if (result.success) {
                res.json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            console.error('Error getting application documents:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve application documents'
            });
        }
    }
);

// @route   PUT /api/applications/:applicationId/documents/:documentIndex
// @desc    Replace a specific application document (Tenant only)
// @access  Private (Application owner - tenant)
router.put('/:applicationId/documents/:documentIndex',
    validateObjectId('applicationId'),
    // requireApplicationOwner,
    uploadSingleDocument,
    handleUploadErrors,
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'New document file is required'
                });
            }

            const documentIndex = parseInt(req.params.documentIndex);
            //check if the application is owned by the user
            const application = await Application.findById(req.params.applicationId);
            if (!application) {
                return res.status(404).json({
                    success: false,
                    message: "Application not found",
                });
            }
            if (application.tenant.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to replace this application",
                });
            }
            if (isNaN(documentIndex) || documentIndex < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid document index'
                });
            }

            const documentType = req.body.documentType || 'other';
            const result = await replaceApplicationDocument(
                req.params.applicationId,
                documentIndex,
                req.file,
                documentType
            );
            
            if (result.success) {
                res.json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Error replacing application document:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to replace application document'
            });
        }
    }
);

// @route   DELETE /api/applications/:applicationId/documents/:documentIndex
// @desc    Delete a specific application document (Tenant only)
// @access  Private (Application owner - tenant)
router.delete('/:applicationId/documents/:documentIndex',
    validateObjectId('applicationId'),
    // requireApplicationOwner,
    async (req, res) => {
        try {
            const documentIndex = parseInt(req.params.documentIndex);
            //check if the application is owned by the user
            const application = await Application.findById(req.params.applicationId);
            if (!application) {
                return res.status(404).json({
                    success: false,
                    message: "Application not found",
                });
            }
            if (application.tenant.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to delete this application",
                });
            }
            if (isNaN(documentIndex) || documentIndex < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid document index'
                });
            }

            const result = await deleteApplicationDocument(
                req.params.applicationId,
                documentIndex
            );
            
            if (result.success) {
                res.json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Error deleting application document:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete application document'
            });
        }
    }
);

// @route   DELETE /api/applications/:applicationId/documents
// @desc    Delete all application documents (Tenant only)
// @access  Private (Application owner - tenant)
router.delete('/:applicationId/documents',
    validateObjectId('applicationId'),
    //  requireApplicationOwner,
    async (req, res) => {
        try {
            const result = await deleteAllApplicationFiles(req.params.applicationId);
            //check if the application is owned by the user
            const application = await Application.findById(req.params.applicationId);
            if (!application) {
                return res.status(404).json({
                    success: false,
                    message: "Application not found",
                });
            }
            if (application.tenant.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to delete this application",
                });
            }
            if (result.success) {
                res.json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Error deleting all application documents:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete all application documents'
            });
        }
    }
);

module.exports = router; 