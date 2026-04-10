import express from 'express';
import { protect } from '../../middleware/auth.js';
import { 
    createAppointment, 
    getAppointments, 
    getViewAppointment,  
    deleteAppointment,
    getConfirmedAppointments,
    getAppointmentsByStatus,
    confirmAppointment,
    getUpcomingAppointments,
    getAppointmentStats,
    updateAppointment,
    bulkDeleteAppointments
} from '../../controllers/Maple/AppointmentController.js';

import {
    checkTimeSlotAvailability,
    getAvailableTimeSlotsWithDuration,
    checkAvailability,
    getAvailableTimeSlots,
    rescheduleAppointment,
    getUnavailableDates,
    setUnavailableDate,
    deleteUnavailableDate
} from '../../controllers/Maple/ScheduleController.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
router.post('/create', createAppointment);

// Availability check routes (public)
router.get('/check-time-slot', checkTimeSlotAvailability);
router.get('/available-time-slots', getAvailableTimeSlotsWithDuration);
router.post('/check-availability', checkAvailability);
router.post('/available-slots', getAvailableTimeSlots);

// ✅ PUBLIC endpoint for unavailable dates (used by PublicCalendar)
router.get('/public/unavailable-dates', getUnavailableDates);  
router.get('/public/confirmed', getConfirmedAppointments); 

// ==================== PROTECTED ROUTES ====================
// CRUD Operations
router.get('/get', protect, getAppointments);
router.get('/confirmed', protect, getConfirmedAppointments);
router.get('/status/:status', protect, getAppointmentsByStatus);
router.get('/upcoming', protect, getUpcomingAppointments);
router.get('/stats', protect, getAppointmentStats);
router.get('/view/:appointmentId', protect, getViewAppointment);

// Update routes - IMPORTANT: Use :appointmentId to match controller
router.put('/update/:appointmentId', protect, updateAppointment);
router.put('/confirm/:appointmentId', protect, confirmAppointment);
router.put('/reschedule/:appointmentId', protect, rescheduleAppointment);

// Delete route
router.delete('/delete/:appointmentId', protect, deleteAppointment);
router.delete('/bulk-delete', protect, bulkDeleteAppointments);

// Unavailable Dates Management
router.get('/unavailable-dates', protect, getUnavailableDates);
router.post('/unavailable-dates', protect, setUnavailableDate);
router.delete('/unavailable-dates/:id', protect, deleteUnavailableDate);

export default router;