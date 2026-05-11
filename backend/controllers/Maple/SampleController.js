// controllers/Maple/SampleController.js
import Sample from "../../models/Maple/Sample.js";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create sample
export const createSample = async (req, res) => {
    try {
        const { 
            title, 
            description, 
            setupType, 
            gender, 
            location, 
            date, 
            featured,
            images 
        } = req.body;

        // Parse images if sent as JSON string
        let parsedImages = images;
        if (typeof images === 'string') {
            try {
                parsedImages = JSON.parse(images);
            } catch (e) {
                parsedImages = images;
            }
        }

        // Validate required fields
        if (!title || !description || !setupType || !gender || !location || !date) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }

        // Validate images
        if (!parsedImages || (Array.isArray(parsedImages) && parsedImages.length === 0)) {
            return res.status(400).json({
                success: false,
                message: 'At least one image is required',
            });
        }

        // Ensure images is an array
        const imageArray = Array.isArray(parsedImages) ? parsedImages : [parsedImages];
        
        // Ensure at least one image is primary
        const hasPrimary = imageArray.some(img => img.isPrimary);
        if (!hasPrimary && imageArray.length > 0) {
            imageArray[0].isPrimary = true;
        }

        const newSample = await Sample.create({
            title: title.trim(),
            description: description.trim(),
            setupType,
            gender,
            images: imageArray,
            location: location.trim(),
            date,
            featured: featured === 'true' || featured === true,
        });

        res.status(201).json({
            success: true,
            message: 'Sample created successfully',
            data: newSample,
        });

    } catch (error) {
        console.error('Create Sample Error:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all samples with filters
export const getAllSamples = async (req, res) => {
    try {
        const { setupType, gender, featured } = req.query;
        
        // Build filter object
        const filter = { status: 'active' };
        
        if (setupType && setupType !== 'all') {
            filter.setupType = setupType;
        }
        if (gender && gender !== 'all') {
            filter.gender = gender;
        }
        if (featured && featured !== 'all') {
            filter.featured = featured === 'true' || featured === 'featured';
        }

        const samples = await Sample.find(filter)
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Samples retrieved successfully',
            data: samples,
            count: samples.length,
        });

    } catch (error) {
        console.error('Get All Samples Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Get single sample
export const getSample = async (req, res) => {
    try {
        const { id } = req.params;
        const sample = await Sample.findById(id);

        if (!sample) {
            return res.status(404).json({
                success: false,
                message: 'Sample not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Sample retrieved successfully',
            data: sample,
        });

    } catch (error) {
        console.error('Get Sample Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Update sample
export const updateSample = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            title, 
            description, 
            setupType, 
            gender, 
            location, 
            date, 
            featured,
            images,
            existingImages,
            deletedImages
        } = req.body;
        
        const sample = await Sample.findById(id);
        if (!sample) {
            return res.status(404).json({
                success: false,
                message: 'Sample not found',
            });
        }

        // Parse existingImages if sent as JSON string
        let parsedExistingImages = existingImages;
        if (typeof existingImages === 'string') {
            try {
                parsedExistingImages = JSON.parse(existingImages);
            } catch (e) {
                parsedExistingImages = null;
            }
        }

        // Parse deletedImages if sent as JSON string
        let parsedDeletedImages = deletedImages;
        if (typeof deletedImages === 'string') {
            try {
                parsedDeletedImages = JSON.parse(deletedImages);
            } catch (e) {
                parsedDeletedImages = [];
            }
        }

        // Handle deleted images - remove files from disk
        if (parsedDeletedImages && parsedDeletedImages.length > 0) {
            for (const imgUrl of parsedDeletedImages) {
                const filename = path.basename(imgUrl);
                const imagePath = path.join(__dirname, '../../uploads/samples', filename);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
        }

        // Prepare update data
        const updateData = {};
        if (title) updateData.title = title.trim();
        if (description) updateData.description = description.trim();
        if (setupType) updateData.setupType = setupType;
        if (gender) updateData.gender = gender;
        if (location) updateData.location = location.trim();
        if (date) updateData.date = date;
        if (featured !== undefined) updateData.featured = featured === 'true' || featured === true;

        // Handle images - merge existing with new uploaded ones
        let allImages = [];
        
        // Start with existing images that weren't deleted (with their isPrimary status)
        if (parsedExistingImages && Array.isArray(parsedExistingImages)) {
            allImages = [...parsedExistingImages];
        } else if (!parsedDeletedImages || parsedDeletedImages.length === 0) {
            // If no existingImages sent and no deletions, keep current images
            allImages = [...sample.images];
        }
        
        // Add newly uploaded images
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => ({
                url: `/uploads/samples/${file.filename}`,
                filename: file.filename,
                isPrimary: allImages.length === 0, // Only primary if no other images
                uploadedAt: new Date()
            }));
            allImages = [...allImages, ...newImages];
        }

        // Update images only if we have images to set
        if (allImages.length > 0) {
            updateData.images = allImages;
        }

        const updatedSample = await Sample.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Sample updated successfully',
            data: updatedSample,
        });

    } catch (error) {
        console.error('Update Sample Error:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};


// Delete sample
export const deleteSample = async (req, res) => {
    try {
        const { id } = req.params;
        const sample = await Sample.findById(id);

        if (!sample) {
            return res.status(404).json({
                success: false,
                message: 'Sample not found',
            });
        }

        // Delete all image files
        if (sample.images && sample.images.length > 0) {
            for (const img of sample.images) {
                const filename = path.basename(img.url);
                const imagePath = path.join(__dirname, '../../uploads/samples', filename);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
        }

        await Sample.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Sample deleted successfully',
        });

    } catch (error) {
        console.error('Delete Sample Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get samples by setup type
export const getSamplesBySetupType = async (req, res) => {
    try {
        const { setupType } = req.params;
        const samples = await Sample.find({ 
            setupType, 
            status: 'active'
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Samples retrieved successfully',
            data: samples,
            count: samples.length,
        });

    } catch (error) {
        console.error('Get Samples By Setup Type Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Get samples by setup type and gender
export const getSamplesBySetupTypeAndGender = async (req, res) => {
    try {
        const { setupType, gender } = req.params;
        
        const filter = { status: 'active' };
        
        if (setupType && setupType !== 'all') {
            filter.setupType = setupType;
        }
        if (gender && gender !== 'all') {
            filter.gender = gender;
        }

        const samples = await Sample.find(filter)
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Samples retrieved successfully',
            data: samples,
            count: samples.length,
        });

    } catch (error) {
        console.error('Get Samples Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Add images to existing sample
export const addImagesToSample = async (req, res) => {
    try {
        const { id } = req.params;
        
        const sample = await Sample.findById(id);
        if (!sample) {
            return res.status(404).json({
                success: false,
                message: 'Sample not found',
            });
        }

        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => ({
                url: `/uploads/samples/${file.filename}`,
                filename: file.filename,
                isPrimary: false,
                uploadedAt: new Date()
            }));
            
            sample.images.push(...newImages);
            await sample.save();
        }

        res.status(200).json({
            success: true,
            message: 'Images added successfully',
            data: sample,
        });

    } catch (error) {
        console.error('Add Images Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete specific image from sample
export const deleteImageFromSample = async (req, res) => {
    try {
        const { id, imageId } = req.params;
        
        const sample = await Sample.findById(id);
        if (!sample) {
            return res.status(404).json({
                success: false,
                message: 'Sample not found',
            });
        }

        const imageIndex = sample.images.findIndex(img => img._id.toString() === imageId);
        if (imageIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Image not found in sample',
            });
        }

        const imageToDelete = sample.images[imageIndex];
        const filename = path.basename(imageToDelete.url);
        const imagePath = path.join(__dirname, '../../uploads/samples', filename);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        sample.images.splice(imageIndex, 1);
        
        if (imageToDelete.isPrimary && sample.images.length > 0) {
            sample.images[0].isPrimary = true;
        }

        await sample.save();

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully',
            data: sample,
        });

    } catch (error) {
        console.error('Delete Image Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};