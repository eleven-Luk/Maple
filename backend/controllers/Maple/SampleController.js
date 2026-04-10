import Sample from "../../models/Maple/Sample.js";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create sample
export const createSample = async (req, res) => {
    try {
        const { title, description, category, subCategory, location, date, featured } = req.body;
        const image = req.file ? `/uploads/samples/${req.file.filename}` : null;

        if (!title || !description || !category || !subCategory || !location || !date || !image) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }

        const newSample = await Sample.create({
            title: title.trim(),
            description: description.trim(),
            category,
            subCategory: subCategory.trim(),
            image,
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

// Get all samples
export const getAllSamples = async (req, res) => {
    try {
        const samples = await Sample.find({ status: 'active' })
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
        const { title, description, category, subCategory, location, date, featured } = req.body;
        
        const sample = await Sample.findById(id);
        if (!sample) {
            return res.status(404).json({
                success: false,
                message: 'Sample not found',
            });
        }

        let image = sample.image;
        if (req.file) {
            // Delete old image if exists
            if (sample.image) {
                const oldImagePath = path.join(__dirname, '../../uploads/samples', path.basename(sample.image));
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            image = `/uploads/samples/${req.file.filename}`;
        }

        const updatedSample = await Sample.findByIdAndUpdate(
            id,
            {
                title: title?.trim(),
                description: description?.trim(),
                category,
                subCategory: subCategory?.trim(),
                image,
                location: location?.trim(),
                date,
                featured: featured === 'true' || featured === true,
            },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Sample updated successfully',
            data: updatedSample,
        });

    } catch (error) {
        console.error('Update Sample Error:', error);
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

        // Delete image file
        if (sample.image) {
            const imagePath = path.join(__dirname, '../../uploads/samples', path.basename(sample.image));
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
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

// Get samples by category
export const getSamplesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const samples = await Sample.find({ 
            category, 
            status: 'active',
            featured: true 
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Samples by category retrieved successfully',
            data: samples,
            count: samples.length,
        });

    } catch (error) {
        console.error('Get Samples By Category Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};