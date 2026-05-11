// middleware/upload.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('✅ Uploads directory created at:', uploadDir);
}

// Create samples subdirectory
const uploadDirSample = path.join(__dirname, '../uploads/samples');
if (!fs.existsSync(uploadDirSample)) {
    fs.mkdirSync(uploadDirSample, { recursive: true });
    console.log('✅ Samples uploads directory created at:', uploadDirSample);
}

// Create receipts subdirectory
const uploadDirReceipts = path.join(__dirname, '../uploads/receipts');
if (!fs.existsSync(uploadDirReceipts)) {
    fs.mkdirSync(uploadDirReceipts, { recursive: true });
    console.log('✅ Receipts uploads directory created at:', uploadDirReceipts);
}

// ==================== SINGLE IMAGE UPLOAD ====================
const storageSingle = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDirSample);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = `sample-${uniqueSuffix}${ext}`;
        cb(null, filename);
    }
});

// ==================== MULTIPLE IMAGES UPLOAD ====================
const storageMultiple = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDirSample);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = `sample-${uniqueSuffix}${ext}`;
        cb(null, filename);
    }
});

// ==================== RECEIPT UPLOAD ====================
const storageReceipt = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDirReceipts);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = `receipt-${uniqueSuffix}${ext}`;
        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WEBP)!'));
    }
};

// Receipt file filter (allows images AND PDF)
const fileFilterReceipt = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    // Check mimetype for images and PDF
    const imageMimetypes = /image\/(jpeg|jpg|png|gif|webp)/;
    const pdfMimetype = /application\/pdf/;
    const mimetype = imageMimetypes.test(file.mimetype) || pdfMimetype.test(file.mimetype);

    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, PNG, GIF, WEBP) and PDF are allowed!'));
    }
};

// Single image upload
const uploadSingle = multer({
    storage: storageSingle,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: fileFilter,
});

// Multiple images upload (max 10 images)
const uploadMultiple = multer({
    storage: storageMultiple,
    limits: { 
        fileSize: 5 * 1024 * 1024, // 5MB per file
        files: 10 // Max 10 files
    },
    fileFilter: fileFilter,
});

// Receipt upload
const uploadReceiptMulter = multer({
    storage: storageReceipt,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: fileFilterReceipt,
});

// ==================== RESUME UPLOAD ====================
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = `resume-${uniqueSuffix}${ext}`;
        cb(null, filename);
    }
});

const fileFilterResume = (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only document files are allowed (PDF, DOC, DOCX)!'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilterResume,
});

// Error handling middleware
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 5MB per file.'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Maximum is 10 files.'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    } else if (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next();
};

// Middleware for resume upload
export const uploadResume = (req, res, next) => {
    upload.single('resume')(req, res, (err) => {
        if (err) return handleMulterError(err, req, res, next);
        
        if (req.file) {
            req.body.resume = `/uploads/${req.file.filename}`;
        }
        next();
    });
};

// Middleware for receipt upload
export const uploadReceipt = (req, res, next) => {
    uploadReceiptMulter.single('receipt')(req, res, (err) => {
        if (err) return handleMulterError(err, req, res, next);
        
        if (req.file) {
            req.body.receiptUrl = `/uploads/receipts/${req.file.filename}`;
        }
        next();
    });
};

// Middleware for single sample image upload
export const uploadSingleSampleImage = (req, res, next) => {
    uploadSingle.single('image')(req, res, (err) => {
        if (err) return handleMulterError(err, req, res, next);
        
        if (req.file) {
            req.body.images = [{
                url: `/uploads/samples/${req.file.filename}`,
                filename: req.file.filename,
                isPrimary: true
            }];
        }
        next();
    });
};

// Middleware for multiple sample images upload
export const uploadMultipleSampleImages = (req, res, next) => {
    uploadMultiple.array('images', 10)(req, res, (err) => {
        if (err) return handleMulterError(err, req, res, next);
        
        if (req.files && req.files.length > 0) {
            req.body.images = req.files.map((file, index) => ({
                url: `/uploads/samples/${file.filename}`,
                filename: file.filename,
                isPrimary: index === 0
            }));
        }
        next();
    });
};

// Middleware for mixed upload (single or multiple)
export const uploadSampleImages = (req, res, next) => {
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
        uploadMultiple.array('images', 10)(req, res, (err) => {
            if (err) return handleMulterError(err, req, res, next);
            
            if (req.files && req.files.length > 0) {
                req.body.images = req.files.map((file, index) => ({
                    url: `/uploads/samples/${file.filename}`,
                    filename: file.filename,
                    isPrimary: index === 0
                }));
            } else {
                uploadSingle.single('image')(req, res, (err2) => {
                    if (err2) return handleMulterError(err2, req, res, next);
                    
                    if (req.file) {
                        req.body.images = [{
                            url: `/uploads/samples/${req.file.filename}`,
                            filename: req.file.filename,
                            isPrimary: true
                        }];
                    }
                    next();
                });
                return;
            }
            next();
        });
    } else {
        next();
    }
};

export { upload, uploadSingle, uploadMultiple };