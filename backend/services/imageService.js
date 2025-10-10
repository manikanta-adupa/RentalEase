const { 
    uploadToCloudinary, 
    deleteFromCloudinary, 
    bulkDeleteFromCloudinary,
    getFileMetadata,
    listFilesByFolder,
    generateThumbnail,
    deleteFolderContents
} = require('../utils/cloudinary');
const Property = require('../models/Property');
const Application = require('../models/Application');

// ===========================
// CREATE OPERATIONS (UPLOAD)
// ===========================

const uploadPropertyImages = async (files, propertyId) => {
    try {
        console.log("Service: About to upload images for property ID:", propertyId);
        const uploadedImages = [];
        if(!files || Array.isArray(files) === false){
            return {
                success: false,
                message: 'Invalid files',
                data: [],
                count: 0,
            };
        }
        if(files.length === 0){
            return {
                success: false,
                message: 'No images provided',
                data: [],
                count: 0,
            };
        }
        if(files.length > 5){
            return {
                success: false,
                message: 'Maximum 5 images allowed',
                data: [],
                count: 0,
            };
        }
        
        for (const file of files) {
            const result = await uploadToCloudinary(file.buffer, {
                folder: `property-images/${propertyId}`,
                tags: [`property-${propertyId}`, 'property-image']
            });
            uploadedImages.push(result);
        }

        // Update Property model with new image URLs
        // const property = await Property.findById(propertyId);
        // if (property) {
        //     const newImageUrls = uploadedImages.map(img => img.url);
        //     property.images.push(...newImageUrls);
        //     await property.save();
        // }

        return {
            success: true,
            message: 'Images uploaded successfully',
            data: uploadedImages.map(image => ({
                url: image.url,
                publicId: image.publicId,
                originalName: image.originalName,
                size: image.size,
                uploadedAt: image.uploadedAt
            })),
            count: uploadedImages.length,
        };
    } catch (error) {
        console.error('Error uploading property images:', error);
        return {
            success: false,
            message: 'Failed to upload property images',
            error: error.message,
            data: [],
            count: 0
        };
    }
}

const uploadPropertyDocuments = async (files, propertyId) => {
    try {
        const uploadedDocuments = [];
        if(!files || Array.isArray(files) === false){
            return {
                success: false,
                message: 'Invalid files',
                data: [],
                count: 0,
            };
        }
        if(files.length === 0){
            return {
                success: false,
                message: 'No documents provided',
                data: [],
                count: 0,
            };
        }
        if(files.length > 10){
            return {
                success: false,
                message: 'Maximum 10 property documents allowed',
                data: [],
                count: 0,
            };
        }
        
        for (const file of files) {
            const result = await uploadToCloudinary(file.buffer, {
                folder: `property-documents/${propertyId}`,
                tags: [`property-${propertyId}`, 'property-document']
            });
            uploadedDocuments.push(result);
        }

        // Update Property model with new document URLs
        const property = await Property.findById(propertyId);
        if (property) {
            const newDocumentUrls = uploadedDocuments.map(doc => doc.url);
            property.documents.push(...newDocumentUrls);
            await property.save();
        }

        return {
            success: true,
            message: 'Property documents uploaded successfully',
            data: uploadedDocuments.map(document => ({
                url: document.url,
                publicId: document.publicId,
                originalName: document.originalName,
                size: document.size,
                uploadedAt: document.uploadedAt
            })),
            count: uploadedDocuments.length,
        };
    } catch (error) {
        console.error('Error uploading property documents:', error);
        return {
            success: false,
            message: 'Failed to upload property documents',
            error: error.message,
            data: [],
            count: 0
        };
    }
}

const uploadApplicationDocuments = async (files, applicationId, documentTypes = []) => {
    try {
        const uploadedDocuments = [];
        if(!files || Array.isArray(files) === false){
            return {
                success: false,
                message: 'Invalid files',
                data: [],
                count: 0,
            };
        }
        if(files.length === 0){
            return {
                success: false,
                message: 'No documents provided',
                data: [],
                count: 0,
            };
        }
        if(files.length > 3){
            return {
                success: false,
                message: 'Maximum 3 application documents allowed',
                data: [],
                count: 0,
            };
        }
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const result = await uploadToCloudinary(file.buffer, {
                folder: `application-documents/${applicationId}`,
                tags: [`application-${applicationId}`, 'application-document']
            });
            uploadedDocuments.push({
                ...result,
                documentType: documentTypes[i] || 'other'
            });
        }

        // Update Application model with new documents
        const application = await Application.findById(applicationId);
        if (application) {
            const newDocuments = uploadedDocuments.map(doc => ({
                type: doc.documentType,
                url: doc.url,
                filename: doc.originalName || `document_${Date.now()}`,
                uploadDate: new Date()
            }));
            application.documents.push(...newDocuments);
            await application.save();
        }

        return {
            success: true,
            message: 'Application documents uploaded successfully',
            data: uploadedDocuments.map(document => ({
                url: document.url,
                publicId: document.publicId,
                originalName: document.originalName,
                size: document.size,
                type: document.documentType,
                uploadedAt: document.uploadedAt
            })),
            count: uploadedDocuments.length,
        };
    } catch (error) {
        console.error('Error uploading application documents:', error);
        return {
            success: false,
            message: 'Failed to upload application documents',
            error: error.message,
            data: [],
            count: 0
        };
    }
}

// ===========================
// READ OPERATIONS
// ===========================

const getPropertyImages = async (propertyId, options = {}) => {
    try {
        const folderPath = `property-images/${propertyId}`;
        const cloudinaryResult = await listFilesByFolder(folderPath, {
            maxResults: options.limit || 50,
            nextCursor: options.cursor
        });

        if (!cloudinaryResult.success) {
            return {
                success: false,
                message: 'Failed to fetch property images',
                data: [],
                count: 0
            };
        }

        // Also get thumbnails for each image
        const imagesWithThumbnails = await Promise.all(
            cloudinaryResult.data.map(async (image) => {
                const thumbnail = await generateThumbnail(image.publicId, {
                    width: 300,
                    height: 200
                });
                return {
                    ...image,
                    thumbnailUrl: thumbnail.success ? thumbnail.thumbnailUrl : null
                };
            })
        );

        return {
            success: true,
            message: 'Property images retrieved successfully',
            data: imagesWithThumbnails,
            count: cloudinaryResult.data.length,
            totalCount: cloudinaryResult.totalCount,
            hasMore: cloudinaryResult.hasMore,
            nextCursor: cloudinaryResult.nextCursor
        };
    } catch (error) {
        console.error('Error getting property images:', error);
        return {
            success: false,
            message: 'Failed to get property images',
            error: error.message,
            data: [],
            count: 0
        };
    }
}

const getPropertyDocuments = async (propertyId, options = {}) => {
    try {
        const folderPath = `property-documents/${propertyId}`;
        const cloudinaryResult = await listFilesByFolder(folderPath, {
            maxResults: options.limit || 50,
            nextCursor: options.cursor
        });

        if (!cloudinaryResult.success) {
            return {
                success: false,
                message: 'Failed to fetch property documents',
                data: [],
                count: 0
            };
        }

        return {
            success: true,
            message: 'Property documents retrieved successfully',
            data: cloudinaryResult.data,
            count: cloudinaryResult.data.length,
            totalCount: cloudinaryResult.totalCount,
            hasMore: cloudinaryResult.hasMore,
            nextCursor: cloudinaryResult.nextCursor
        };
    } catch (error) {
        console.error('Error getting property documents:', error);
        return {
            success: false,
            message: 'Failed to get property documents',
            error: error.message,
            data: [],
            count: 0
        };
    }
}

const getApplicationDocuments = async (applicationId, options = {}) => {
    try {
        // First get from database to get document types
        const application = await Application.findById(applicationId);
        if (!application) {
            return {
                success: false,
                message: 'Application not found',
                data: [],
                count: 0
            };
        }

        // Then get from Cloudinary for additional metadata
        const folderPath = `application-documents/${applicationId}`;
        const cloudinaryResult = await listFilesByFolder(folderPath, {
            maxResults: options.limit || 50,
            nextCursor: options.cursor
        });

        // Merge database and Cloudinary data
        const enrichedDocuments = application.documents.map(dbDoc => {
            const cloudinaryDoc = cloudinaryResult.data.find(cloudDoc => 
                cloudDoc.url === dbDoc.url
            );
            return {
                type: dbDoc.type,
                url: dbDoc.url,
                filename: dbDoc.filename,
                uploadDate: dbDoc.uploadDate,
                publicId: cloudinaryDoc?.publicId,
                size: cloudinaryDoc?.size,
                format: cloudinaryDoc?.format
            };
        });

        return {
            success: true,
            message: 'Application documents retrieved successfully',
            data: enrichedDocuments,
            count: enrichedDocuments.length
        };
    } catch (error) {
        console.error('Error getting application documents:', error);
        return {
            success: false,
            message: 'Failed to get application documents',
            error: error.message,
            data: [],
            count: 0
        };
    }
}

const getFileMetadataById = async (publicId) => {
    try {
        const result = await getFileMetadata(publicId);
        
        if (!result.success) {
            return {
                success: false,
                message: 'File not found or unable to retrieve metadata',
                data: null
            };
        }

        return {
            success: true,
            message: 'File metadata retrieved successfully',
            data: result.data
        };
    } catch (error) {
        console.error('Error getting file metadata:', error);
        return {
            success: false,
            message: 'Failed to get file metadata',
            error: error.message,
            data: null
        };
    }
}

const getAllFilesByProperty = async (propertyId) => {
    try {
        const [imagesResult, documentsResult] = await Promise.all([
            getPropertyImages(propertyId),
            getPropertyDocuments(propertyId)
        ]);

        return {
            success: true,
            message: 'All property files retrieved successfully',
            data: {
                images: imagesResult.data || [],
                documents: documentsResult.data || [],
                totalImages: imagesResult.count || 0,
                totalDocuments: documentsResult.count || 0,
                totalFiles: (imagesResult.count || 0) + (documentsResult.count || 0)
            }
        };
    } catch (error) {
        console.error('Error getting all files by property:', error);
        return {
            success: false,
            message: 'Failed to get property files',
            error: error.message,
            data: { images: [], documents: [] }
        };
    }
}

// ===========================
// UPDATE OPERATIONS
// ===========================

const replacePropertyImage = async (propertyId, oldPublicId, newFile) => {
    try {
        // Delete old image
        await deleteFromCloudinary(oldPublicId);
        
        // Upload new image
        const uploadResult = await uploadToCloudinary(newFile.buffer, {
            folder: `property-images/${propertyId}`,
            tags: [`property-${propertyId}`, 'property-image']
        });

        // Update Property model
        const property = await Property.findById(propertyId);
        if (property) {
            // Find and replace the old URL with new URL
            const oldImageIndex = property.images.findIndex(url => 
                url.includes(oldPublicId)
            );
            if (oldImageIndex !== -1) {
                property.images[oldImageIndex] = uploadResult.url;
                await property.save();
            }
        }

        return {
            success: true,
            message: 'Property image replaced successfully',
            data: {
                oldPublicId,
                newImage: {
                    url: uploadResult.url,
                    publicId: uploadResult.publicId,
                    originalName: uploadResult.originalName,
                    size: uploadResult.size
                }
            }
        };
    } catch (error) {
        console.error('Error replacing property image:', error);
        return {
            success: false,
            message: 'Failed to replace property image',
            error: error.message
        };
    }
}

const replaceApplicationDocument = async (applicationId, oldDocumentIndex, newFile, documentType) => {
    try {
        const application = await Application.findById(applicationId);
        if (!application) {
            return {
                success: false,
                message: 'Application not found'
            };
        }

        if (oldDocumentIndex < 0 || oldDocumentIndex >= application.documents.length) {
            return {
                success: false,
                message: 'Invalid document index'
            };
        }

        const oldDocument = application.documents[oldDocumentIndex];
        
        // Extract public ID from old URL to delete from Cloudinary
        const oldPublicId = oldDocument.url.split('/').pop().split('.')[0];
        if (oldPublicId.includes('/')) {
            // Handle nested folder structure
            const urlParts = oldDocument.url.split('/');
            const publicIdWithFolder = urlParts.slice(-2).join('/').split('.')[0];
            await deleteFromCloudinary(publicIdWithFolder);
        } else {
            await deleteFromCloudinary(oldPublicId);
        }

        // Upload new document
        const uploadResult = await uploadToCloudinary(newFile.buffer, {
            folder: `application-documents/${applicationId}`,
            tags: [`application-${applicationId}`, 'application-document']
        });

        // Update Application model
        application.documents[oldDocumentIndex] = {
            type: documentType || oldDocument.type,
            url: uploadResult.url,
            filename: uploadResult.originalName || `document_${Date.now()}`,
            uploadDate: new Date()
        };
        await application.save();

        return {
            success: true,
            message: 'Application document replaced successfully',
            data: {
                replacedDocument: application.documents[oldDocumentIndex],
                newDocument: {
                    url: uploadResult.url,
                    publicId: uploadResult.publicId,
                    originalName: uploadResult.originalName,
                    size: uploadResult.size
                }
            }
        };
    } catch (error) {
        console.error('Error replacing application document:', error);
        return {
            success: false,
            message: 'Failed to replace application document',
            error: error.message
        };
    }
}

const reorderPropertyImages = async (propertyId, newImageOrder) => {
    try {
        const property = await Property.findById(propertyId);
        if (!property) {
            return {
                success: false,
                message: 'Property not found'
            };
        }

        // Validate that newImageOrder contains all existing images
        if (newImageOrder.length !== property.images.length) {
            return {
                success: false,
                message: 'New order must contain all existing images'
            };
        }

        // Validate that all URLs in newImageOrder exist in current images
        const currentImages = property.images;
        const isValidOrder = newImageOrder.every(url => currentImages.includes(url));
        
        if (!isValidOrder) {
            return {
                success: false,
                message: 'New order contains invalid image URLs'
            };
        }

        // Update the order
        property.images = newImageOrder;
        await property.save();

        return {
            success: true,
            message: 'Property images reordered successfully',
            data: {
                newOrder: newImageOrder,
                count: newImageOrder.length
            }
        };
    } catch (error) {
        console.error('Error reordering property images:', error);
        return {
            success: false,
            message: 'Failed to reorder property images',
            error: error.message
        };
    }
}

// ===========================
// DELETE OPERATIONS
// ===========================

const deleteAnyFile = async (publicId) => {
    try {
        await deleteFromCloudinary(publicId);
        return {
            success: true,
            message: 'File deleted successfully',
        };  
    } catch (error) {
        console.error('Error deleting file:', error);  
        return {
            success: false,
            message: 'Failed to delete file',
            error: error.message
        };
    }
}

const deletePropertyImage = async (propertyId, publicId) => {
    try {
        // Delete from Cloudinary
        await deleteFromCloudinary(publicId);
        
        // Remove from Property model
        const property = await Property.findById(propertyId);
        if (property) {
            property.images = property.images.filter(url => !url.includes(publicId));
            await property.save();
        }

        return {
            success: true,
            message: 'Property image deleted successfully',
            data: { deletedPublicId: publicId }
        };
    } catch (error) {
        console.error('Error deleting property image:', error);
        return {
            success: false,
            message: 'Failed to delete property image',
            error: error.message
        };
    }
}

const deleteApplicationDocument = async (applicationId, documentIndex) => {
    try {
        const application = await Application.findById(applicationId);
        if (!application) {
            return {
                success: false,
                message: 'Application not found'
            };
        }

        if (documentIndex < 0 || documentIndex >= application.documents.length) {
            return {
                success: false,
                message: 'Invalid document index'
            };
        }

        const documentToDelete = application.documents[documentIndex];
        
        // Extract public ID from URL to delete from Cloudinary
        const publicId = documentToDelete.url.split('/').pop().split('.')[0];
        if (publicId.includes('/')) {
            const urlParts = documentToDelete.url.split('/');
            const publicIdWithFolder = urlParts.slice(-2).join('/').split('.')[0];
            await deleteFromCloudinary(publicIdWithFolder);
        } else {
            await deleteFromCloudinary(publicId);
        }

        // Remove from Application model
        application.documents.splice(documentIndex, 1);
        await application.save();

        return {
            success: true,
            message: 'Application document deleted successfully',
            data: { 
                deletedDocument: documentToDelete,
                remainingCount: application.documents.length
            }
        };
    } catch (error) {
        console.error('Error deleting application document:', error);
        return {
            success: false,
            message: 'Failed to delete application document',
            error: error.message
        };
    }
}

const bulkDeleteFiles = async (publicIds) => {
    try {
        const result = await bulkDeleteFromCloudinary(publicIds);
        return {
            success: true,
            message: `Successfully deleted ${result.deletedCount} files`,
            data: {
                deletedCount: result.deletedCount,
                deletedFiles: result.deleted,
                partial: result.partial
            }
        };
    } catch (error) {
        console.error('Error in bulk delete:', error);
        return {
            success: false,
            message: 'Failed to bulk delete files',
            error: error.message
        };
    }
}

const deleteAllPropertyFiles = async (propertyId) => {
    try {
        const [imagesResult, documentsResult] = await Promise.all([
            deleteFolderContents(`property-images/${propertyId}`),
            deleteFolderContents(`property-documents/${propertyId}`)
        ]);

        // Clear from Property model
        const property = await Property.findById(propertyId);
        if (property) {
            property.images = [];
            property.documents = [];
            await property.save();
        }

        return {
            success: true,
            message: 'All property files deleted successfully',
            data: {
                deletedImages: imagesResult.deletedCount,
                deletedDocuments: documentsResult.deletedCount,
                totalDeleted: imagesResult.deletedCount + documentsResult.deletedCount
            }
        };
    } catch (error) {
        console.error('Error deleting all property files:', error);
        return {
            success: false,
            message: 'Failed to delete all property files',
            error: error.message
        };
    }
}

const deleteAllApplicationFiles = async (applicationId) => {
    try {
        const result = await deleteFolderContents(`application-documents/${applicationId}`);

        // Clear from Application model
        const application = await Application.findById(applicationId);
        if (application) {
            application.documents = [];
            await application.save();
        }

        return {
            success: true,
            message: 'All application files deleted successfully',
            data: {
                deletedCount: result.deletedCount
            }
        };
    } catch (error) {
        console.error('Error deleting all application files:', error);
        return {
            success: false,
            message: 'Failed to delete all application files',
            error: error.message
        };
    }
}

module.exports = { 
    // CREATE operations
    uploadPropertyImages, 
    uploadPropertyDocuments,
    uploadApplicationDocuments,
    
    // READ operations
    getPropertyImages,
    getPropertyDocuments,
    getApplicationDocuments,
    getFileMetadataById,
    getAllFilesByProperty,
    
    // UPDATE operations
    replacePropertyImage,
    replaceApplicationDocument,
    reorderPropertyImages,
    
    // DELETE operations
    deleteAnyFile,
    deletePropertyImage,
    deleteApplicationDocument,
    bulkDeleteFiles,
    deleteAllPropertyFiles,
    deleteAllApplicationFiles
};