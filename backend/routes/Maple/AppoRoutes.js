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
    bulkDeleteAppointments,
    uploadReceipt
} from '../../controllers/Maple/AppointmentController.js';

import {
    checkTimeSlotAvailability,
    getAvailableTimeSlotsWithDuration,
    checkAvailability,
    getAvailableTimeSlots,
    rescheduleAppointment,
    getUnavailableDates,
    setUnavailableDate,
    deleteUnavailableDate,
    getAvailableSessions,
    checkSessionAvailability
} from '../../controllers/Maple/ScheduleController.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
router.post('/create', createAppointment);

// Session-based availability routes
router.get('/available-sessions', getAvailableSessions);
router.get('/check-session', checkSessionAvailability);

// Legacy availability check routes (keep for backward compatibility)
router.get('/check-time-slot', checkTimeSlotAvailability);
router.get('/available-time-slots', getAvailableTimeSlotsWithDuration);
router.post('/check-availability', checkAvailability);
router.post('/available-slots', getAvailableTimeSlots);

// Receipt upload route
router.post('/upload-receipt', uploadReceipt);

// Public endpoints for unavailable dates (used by PublicCalendar)
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

// Update routes
router.put('/update/:appointmentId', protect, updateAppointment);
router.put('/confirm/:appointmentId', protect, confirmAppointment);
router.put('/reschedule/:appointmentId', protect, rescheduleAppointment);

// Delete routes
router.delete('/delete/:appointmentId', protect, deleteAppointment);
router.delete('/bulk-delete', protect, bulkDeleteAppointments);

// Unavailable Dates Management
router.get('/unavailable-dates', protect, getUnavailableDates);
router.post('/unavailable-dates', protect, setUnavailableDate);
router.delete('/unavailable-dates/:id', protect, deleteUnavailableDate);

export default router;