const cloudinary = require('cloudinary').v2;

// Debug: Check if environment variables are loaded
console.log('🔍 Cloudinary Environment Variables Check:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing');

// Validate required environment variables
const requiredEnvVars = {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
};

const missingVars = Object.entries(requiredEnvVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

if (missingVars.length > 0) {
    console.error('❌ Missing required Cloudinary environment variables:');
    missingVars.forEach(varName => {
        console.error(`   - ${varName}`);
    });
    console.error('\n📝 Please check your .env file and ensure these variables are set:');
    console.error('   CLOUDINARY_CLOUD_NAME=your_cloud_name');
    console.error('   CLOUDINARY_API_KEY=your_api_key');
    console.error('   CLOUDINARY_API_SECRET=your_api_secret');
    console.error('\n🔗 Get these values from: https://cloudinary.com/console');
    
    // Don't exit the process, but log warning
    console.error('⚠️  Cloudinary functionality will be disabled until these are configured.');
}

// Only configure Cloudinary if all variables are present
if (missingVars.length === 0) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Test the connection
    cloudinary.api.ping().then(() => {
        console.log('✅ Cloudinary connected successfully');
    }).catch((error) => {
        console.error('❌ Cloudinary connection failed:', error.message);
        console.error('🔧 Please verify your Cloudinary credentials in .env file');
    });
} else {
    console.warn('⚠️  Skipping Cloudinary configuration due to missing environment variables');
}

const uploadToCloudinary = async (fileBuffer, options={}) =>{
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({
            resource_type: 'auto',
            folder: options.folder || 'rentalease',
            ...options,
        }, (error, result) => {
            if(error){
                console.error('Error uploading to Cloudinary:', error);
                reject(error);
            }
            else{
                console.log('File uploaded to Cloudinary');
                resolve({ 
                    url: result.secure_url, 
                    publicId: result.public_id, 
                    originalName: result.original_filename, 
                    size: result.bytes, 
                    format: result.format,
                    width: result.width,
                    height: result.height,
                    uploadedAt: new Date(result.created_at)
                });
            }
        }).end(fileBuffer);
    });
}

const deleteFromCloudinary = async (publicId) => {  
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log('File deleted from Cloudinary:', result);
        return { success: result.result === 'ok', result };
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
}

const bulkDeleteFromCloudinary = async (publicIds) => {
    try {
        const result = await cloudinary.api.delete_resources(publicIds);
        console.log('Bulk delete completed:', result);
        return {
            success: true,
            deleted: result.deleted,
            deletedCount: Object.keys(result.deleted).length,
            partial: result.partial || false
        };
    } catch (error) {
        console.error('Error in bulk delete:', error);
        throw error;
    }
}

const getFileMetadata = async (publicId) => {
    try {
        const result = await cloudinary.api.resource(publicId);
        return {
            success: true,
            data: {
                publicId: result.public_id,
                url: result.secure_url,
                format: result.format,
                size: result.bytes,
                width: result.width || null,
                height: result.height || null,
                originalName: result.original_filename || null,
                uploadedAt: new Date(result.created_at),
                folder: result.folder || null
            }
        };
    } catch (error) {
        console.error('Error getting file metadata:', error);
        return { success: false, error: error.message };
    }
}

const listFilesByFolder = async (folderPath, options = {}) => {
    try {
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: folderPath,
            max_results: options.maxResults || 100,
            next_cursor: options.nextCursor || null,
            resource_type: options.resourceType || 'auto'
        });

        return {
            success: true,
            data: result.resources.map(resource => ({
                publicId: resource.public_id,
                url: resource.secure_url,
                format: resource.format,
                size: resource.bytes,
                width: resource.width || null,
                height: resource.height || null,
                uploadedAt: new Date(resource.created_at),
                folder: resource.folder || null
            })),
            totalCount: result.total_count || 0,
            nextCursor: result.next_cursor || null,
            hasMore: !!result.next_cursor
        };
    } catch (error) {
        console.error('Error listing files by folder:', error);
        return { success: false, error: error.message, data: [] };
    }
}

const generateThumbnail = async (publicId, options = {}) => {
    try {
        const thumbnailUrl = cloudinary.url(publicId, {
            width: options.width || 200,
            height: options.height || 200,
            crop: options.crop || 'fill',
            quality: options.quality || 'auto',
            format: options.format || 'auto'
        });

        return {
            success: true,
            thumbnailUrl,
            originalPublicId: publicId
        };
    } catch (error) {
        console.error('Error generating thumbnail:', error);
        return { success: false, error: error.message };
    }
}

const searchFilesByTag = async (tag, options = {}) => {
    try {
        const result = await cloudinary.api.resources_by_tag(tag, {
            max_results: options.maxResults || 50,
            next_cursor: options.nextCursor || null
        });

        return {
            success: true,
            data: result.resources.map(resource => ({
                publicId: resource.public_id,
                url: resource.secure_url,
                format: resource.format,
                size: resource.bytes,
                uploadedAt: new Date(resource.created_at)
            })),
            nextCursor: result.next_cursor || null,
            hasMore: !!result.next_cursor
        };
    } catch (error) {
        console.error('Error searching files by tag:', error);
        return { success: false, error: error.message, data: [] };
    }
}

const deleteFolderContents = async (folderPath) => {
    try {
        // First, get all resources in the folder
        const resources = await cloudinary.api.resources({
            type: 'upload',
            prefix: folderPath,
            max_results: 500 // Cloudinary max
        });

        if (resources.resources.length === 0) {
            return { success: true, deletedCount: 0, message: 'Folder is empty' };
        }

        // Extract public IDs
        const publicIds = resources.resources.map(resource => resource.public_id);
        
        // Delete all files
        const deleteResult = await bulkDeleteFromCloudinary(publicIds);
        
        return {
            success: true,
            deletedCount: deleteResult.deletedCount,
            message: `Deleted ${deleteResult.deletedCount} files from folder: ${folderPath}`
        };
    } catch (error) {
        console.error('Error deleting folder contents:', error);
        throw error;
    }
}

module.exports = { 
    uploadToCloudinary, 
    deleteFromCloudinary,
    bulkDeleteFromCloudinary,
    getFileMetadata,
    listFilesByFolder,
    generateThumbnail,
    searchFilesByTag,
    deleteFolderContents
};