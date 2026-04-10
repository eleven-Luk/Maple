// routes/Maple/sampleRoutes.js
import express from 'express';
import { protect } from '../../middleware/auth.js';
import { uploadSampleImage } from '../../middleware/upload.js'; // Changed from uploadSample to uploadSampleImage
import { 
    createSample, 
    getAllSamples, 
    getSample, 
    updateSample, 
    deleteSample,
    getSamplesByCategory
} from '../../controllers/Maple/SampleController.js';

const router = express.Router();

// Public routes
router.get('/all', getAllSamples);
router.get('/category/:category', getSamplesByCategory);
router.get('/view/:id', getSample);


// Protected routes (admin only)
router.post('/create', protect, uploadSampleImage, createSample);
router.put('/update/:id', protect, uploadSampleImage, updateSample);
router.delete('/delete/:id', protect, deleteSample);

export default router;