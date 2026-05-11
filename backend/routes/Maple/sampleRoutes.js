import express from 'express';
import { protect } from '../../middleware/auth.js';
import { uploadSingleSampleImage, uploadMultipleSampleImages } from '../../middleware/upload.js';
import { 
    createSample, 
    getAllSamples, 
    getSample, 
    updateSample, 
    deleteSample,
    getSamplesBySetupType,
    getSamplesBySetupTypeAndGender,
    addImagesToSample,
    deleteImageFromSample
} from '../../controllers/Maple/SampleController.js';

const router = express.Router();

// Public routes
router.get('/all', getAllSamples);
router.get('/setup/:setupType', getSamplesBySetupType);
router.get('/setup/:setupType/gender/:gender', getSamplesBySetupTypeAndGender);
router.get('/view/:id', getSample);

// Protected routes (admin only)
router.post('/create', protect, uploadMultipleSampleImages, createSample);
router.post('/create-single', protect, uploadSingleSampleImage, createSample);
router.put('/update/:id', protect, uploadMultipleSampleImages, updateSample);
router.delete('/delete/:id', protect, deleteSample);

// Image management routes
router.post('/:id/add-images', protect, uploadMultipleSampleImages, addImagesToSample);
router.delete('/:id/images/:imageId', protect, deleteImageFromSample);

export default router;