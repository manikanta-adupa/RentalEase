const imageQueue =require('../queues/image-queue');
const Property = require('../models/Property');
const { uploadPropertyImages} =require('../services/imageService');

imageQueue.process('upload-images', async (job) =>{
    const {files: serializedFiles, propertyId} = job.data;
    console.log(`Worker: Processing image upload for property ID: ${propertyId}`);
    
    const files = serializedFiles.map(file => ({
        buffer: Buffer.from(file.buffer, 'base64'),
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
    }));
    try {
        const imageUploadResult = await uploadPropertyImages(files, propertyId);
        if(imageUploadResult.success && imageUploadResult.data){
            const imageUrls = imageUploadResult.data.map(img => img.url);
            await Property.findByIdAndUpdate(propertyId, {images: imageUrls});
            return {success: true, data: imageUrls};
        } else {
            throw new Error(imageUploadResult.message);
        }
    } catch (error) {
        throw error;
    }
});

