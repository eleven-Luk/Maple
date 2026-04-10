// routes/NM/concernRoutes.js
import express from 'express';
import { 
    createConcerns, 
    getConcernsByBusinessType, 
    getViewConcerns, 
    updateConcerns, 
    deleteConcerns 
} from '../../controllers/NM/ConcernControl.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/create', createConcerns);

// Protected routes :businessType is a path parameter
router.get('/business/:businessType', protect, getConcernsByBusinessType);  // This matches /business/nm or /business/maple
router.get('/view/:concernId', protect, getViewConcerns);
router.put('/update/:concernId', protect, updateConcerns);
router.delete('/delete/:concernId', protect, deleteConcerns);

export default router;