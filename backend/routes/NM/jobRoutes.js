import express from 'express';
import { body } from 'express-validator';
import { createJob, getAllJobs, getViewJob, updateJob
    , moveToArchive, getArchivedJobs, restoreJob, deleteArchivedJob, viewArchivedJob
 } from '../../controllers/NM/JobController.js';
 import { protect } from '../../middleware/auth.js';

const router = express.Router();

// Validate job creation
const validateJobCreation = [
    body('name').trim().notEmpty().withMessage('Job name is required'),
    body('description').trim().notEmpty().withMessage('Job description is required'),
    body('type').trim().notEmpty().withMessage('Job type is required'),
    body('salary').isFloat({ min: 0 }).withMessage('Salary must be a positive number'),
    body('location').trim().notEmpty().withMessage('Job location is required'),
];

// Get routes
router.get('/all', getAllJobs);
router.get('/archived', protect, getArchivedJobs);
router.get('/archived/:jobId', protect, viewArchivedJob);
router.get('/:id', getViewJob)

// Put routes
router.put('/restore/:jobId', protect, restoreJob); // Fixed: removed duplicate, using :jobId
router.put('/update/:id', protect, validateJobCreation, updateJob);

// Patch routes
router.patch('/archive/:jobId', protect, moveToArchive);

// Delete routes
router.delete('/delete/:jobId', protect, deleteArchivedJob); // Fixed: added protect middleware

// Post routes
router.post('/create', protect, validateJobCreation, createJob);

export default router;