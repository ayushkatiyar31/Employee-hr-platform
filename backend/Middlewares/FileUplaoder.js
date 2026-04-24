const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const extension = path.extname(file.originalname || '').replace('.', '');
        const baseName = path.basename(file.originalname || 'file', path.extname(file.originalname || ''));

        return {
            folder: file.fieldname === 'documents' ? 'employee-documents' : 'employee-profiles',
            resource_type: 'auto',
            format: extension || undefined,
            public_id: `${baseName}-${Date.now()}`
        };
    }
});

const cloudinaryFileUploader = multer({ storage: storage });

module.exports = {
    cloudinaryFileUploader
}
