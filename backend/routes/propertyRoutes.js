const express = require("express");
const router = express.Router();
const {
    createProperty,
    getAllProperties,
    getPropertyById,
    updateProperty,
    deleteProperty,
    searchProperties
} = require("../controllers/propertyController");
const {
    uploadPropertyImages,
    uploadPropertyDocuments,
    getPropertyImages,
    getPropertyDocuments,
    getAllFilesByProperty,
    getFileMetadataById,
    replacePropertyImage,
    reorderPropertyImages,
    deletePropertyImage,
    deleteAllPropertyFiles
} = require("../services/imageService");
const { auth } = require("../middleware/auth");
// const { requireOwner, requirePropertyOwner } = require("../middleware/roleMiddleware");
const { validateProperty, validateObjectId } = require("../middleware/validation");
const { apiLimiter } = require("../middleware/rateLimiter");
const {
    uploadPropertyImages: uploadPropertyImagesMiddleware,
    uploadPropertyDocuments: uploadPropertyDocumentsMiddleware,
    uploadSingleImage,
    handleUploadErrors,
    validatePropertyImages,
    validatePropertyDocuments
} = require("../middleware/upload");

router.use(apiLimiter);

// ===========================
// PROPERTY CRUD ROUTES
// ===========================

// Public routes (no authentication required)
router.get("/", getAllProperties);
router.get("/search", searchProperties);
router.get("/:id", validateObjectId('id'), getPropertyById);

// Protected routes (authentication + role required)
router.post("/", auth, uploadPropertyImagesMiddleware, handleUploadErrors, validatePropertyImages, validateProperty, createProperty);
router.put("/:id", validateObjectId('id'), auth, validateProperty, updateProperty);
router.delete("/:id", validateObjectId('id'), auth, deleteProperty);

// ===========================
// PROPERTY FILE MANAGEMENT ROUTES
// ===========================

// ===== IMAGE ROUTES =====

// Upload property images
router.post("/:propertyId/images",
    validateObjectId('propertyId'),
    auth,
    uploadPropertyImagesMiddleware,
    handleUploadErrors,
    validatePropertyImages,
    async (req, res) => {
        try {
            const result = await uploadPropertyImages(req.files, req.params.propertyId);
            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Error in property images upload route:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during image upload'
            });
        }
    }
);

// Get property images
router.get("/:propertyId/images",
    validateObjectId('propertyId'),//validate the propertyId
    async (req, res) => {
        try {
            const options = {
                limit: parseInt(req.query.limit) || 50,
                cursor: req.query.cursor
            };
            const result = await getPropertyImages(req.params.propertyId, options);
            res.json(result);
        } catch (error) {
            console.error('Error getting property images:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve property images'
            });
        }
    }
);

// Replace a specific property image
router.put("/:propertyId/images/:publicId",
    validateObjectId('propertyId'),
    auth,
    uploadSingleImage,
    handleUploadErrors,
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'New image file is required'
                });
            }
            const result = await replacePropertyImage(
                req.params.propertyId,
                req.params.publicId,
                req.file
            );
            if (result.success) {
                res.json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Error replacing property image:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to replace property image'
            });
        }
    }
);

// Reorder property images
router.put("/:propertyId/images/reorder",
    validateObjectId('propertyId'),
    auth,
    async (req, res) => {
        try {
            const { newOrder } = req.body;
            if (!newOrder || !Array.isArray(newOrder)) {
                return res.status(400).json({
                    success: false,
                    message: 'newOrder array is required'
                });
            }
            const result = await reorderPropertyImages(req.params.propertyId, newOrder);
            if (result.success) {
                res.json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Error reordering property images:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to reorder property images'
            });
        }
    }
);

// Delete a specific property image
router.delete("/:propertyId/images/:publicId",
    validateObjectId('propertyId'),
    auth,
    async (req, res) => {
        try {
            const result = await deletePropertyImage(req.params.propertyId, req.params.publicId);
            if (result.success) {
                res.json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Error deleting property image:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete property image'
            });
        }
    }
);

// ===== DOCUMENT ROUTES =====

// Upload property documents
router.post("/:propertyId/documents",
    validateObjectId('propertyId'),
    auth,
    uploadPropertyDocumentsMiddleware,
    handleUploadErrors,
    validatePropertyDocuments,
    async (req, res) => {
        try {
            const result = await uploadPropertyDocuments(req.files, req.params.propertyId);
            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Error in property documents upload route:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during document upload'
            });
        }
    }
);

// Get property documents
router.get("/:propertyId/documents",
    validateObjectId('propertyId'),
    async (req, res) => {
        try {
            const options = {
                limit: parseInt(req.query.limit) || 50,
                cursor: req.query.cursor
            };
            const result = await getPropertyDocuments(req.params.propertyId, options);
            res.json(result);
        } catch (error) {
            console.error('Error getting property documents:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve property documents'
            });
        }
    }
);

// ===== COMBINED FILE ROUTES =====

// Get all files for a property (images + documents)
router.get("/:propertyId/files",
    validateObjectId('propertyId'),
    async (req, res) => {
        try {
            const result = await getAllFilesByProperty(req.params.propertyId);
            res.json(result);
        } catch (error) {
            console.error('Error getting all property files:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve property files'
            });
        }
    }
);

// Delete all files for a property (images + documents)
router.delete("/:propertyId/files",
    validateObjectId('propertyId'),
    auth,
    async (req, res) => {
        try {
            const result = await deleteAllPropertyFiles(req.params.propertyId);
            if (result.success) {
                res.json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Error deleting all property files:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete all property files'
            });
        }
    }
);

// ===== UTILITY ROUTES =====

// Get file metadata by public ID (for any property file)
router.get("/files/metadata/:publicId",
    async (req, res) => {
        try {
            const result = await getFileMetadataById(req.params.publicId);
            if (result.success) {
                res.json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            console.error('Error getting file metadata:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve file metadata'
            });
        }
    }
);

module.exports = router;