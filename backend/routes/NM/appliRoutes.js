import express from 'express';
import { uploadResume } from '../../middleware/upload.js';
import { createApplication, getApplications, updateApplicationStatus, moveToArchive, getArchivedApplications, getViewApplication, restoreApplication, deleteApplication } from '../../controllers/NM/ApplicationController.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/create', uploadResume, createApplication);

// Protected routes
router.get('/getAll', protect, getApplications);
router.get('/archived', protect, getArchivedApplications);
router.get('/view/:applicationId', protect, getViewApplication);

router.put('/updateStatus/:applicationId', protect, updateApplicationStatus);
router.patch('/archive/:applicationId', protect, moveToArchive);  
router.put('/restore/:applicationId', restoreApplication);

router.delete('/delete/:applicationId', protect, deleteApplication);

export default router;
