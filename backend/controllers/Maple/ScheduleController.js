import Appointment from "../../models/Maple/Appointment.js";
import UnavailableDate from "../../models/Maple/UnavailableDate.js";

// Session time mappings
const SESSION_TIMES = {
    morning: { start: '10:00 AM', end: '12:00 PM', label: 'Morning Session (10AM-12PM)' },
    afternoon: { start: '3:00 PM', end: '5:00 PM', label: 'Afternoon Session (3PM-5PM)' }
};

// ==================== SESSION AVAILABILITY ====================
export const getAvailableSessions = async (req, res) => {
    try {
        const { date } = req.query;
        
        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date is required'
            });
        }
        
        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);
        
        const dayStart = new Date(selectedDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(selectedDate);
        dayEnd.setHours(23, 59, 59, 999);
        
        // Check if date is unavailable
        const unavailableDate = await UnavailableDate.findOne({
            date: { $gte: dayStart, $lte: dayEnd }
        });
        
        if (unavailableDate) {
            return res.status(200).json({
                success: true,
                data: {
                    morning: false,
                    afternoon: false
                },
                isDateUnavailable: true,
                reason: unavailableDate.reason
            });
        }
        
        // Get all appointments for this date
        const existingAppointments = await Appointment.find({
            preferredDate: { $gte: dayStart, $lte: dayEnd },
            status: { $in: ['pending', 'confirmed', 'rescheduled'] }
        });
        
        // Check availability for each session
        const availability = {
            morning: true,
            afternoon: true
        };
        
        for (const appointment of existingAppointments) {
            if (appointment.sessionType === 'morning') {
                availability.morning = false;
            } else if (appointment.sessionType === 'afternoon') {
                availability.afternoon = false;
            }
        }
        
        console.log(`📅 Session availability for ${date}:`, availability);
        
        res.status(200).json({
            success: true,
            data: availability,
            sessionTimes: SESSION_TIMES,
            isDateUnavailable: false,
            message: 'Session availability retrieved successfully'
        });
        
    } catch (error) {
        console.error('Get available sessions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get available sessions',
            error: error.message
        });
    }
};

export const checkSessionAvailability = async (req, res) => {
    try {
        const { date, session } = req.query;
        
        if (!date || !session) {
            return res.status(400).json({
                success: false,
                message: 'Date and session are required'
            });
        }
        
        if (!['morning', 'afternoon'].includes(session)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid session type. Must be "morning" or "afternoon"'
            });
        }
        
        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);
        
        const dayStart = new Date(selectedDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(selectedDate);
        dayEnd.setHours(23, 59, 59, 999);
        
        // Check if date is unavailable
        const unavailableDate = await UnavailableDate.findOne({
            date: { $gte: dayStart, $lte: dayEnd }
        });
        
        if (unavailableDate) {
            return res.status(200).json({
                success: true,
                isAvailable: false,
                message: 'This date is unavailable',
                reason: unavailableDate.reason
            });
        }
        
        // Check if session is already booked
        const existingAppointment = await Appointment.findOne({
            preferredDate: { $gte: dayStart, $lte: dayEnd },
            sessionType: session,
            status: { $in: ['pending', 'confirmed', 'rescheduled'] }
        });
        
        const isAvailable = !existingAppointment;
        
        res.status(200).json({
            success: true,
            isAvailable: isAvailable,
            session: session,
            sessionTime: SESSION_TIMES[session],
            message: isAvailable ? 'Session is available' : 'Session is already booked'
        });
        
    } catch (error) {
        console.error('Check session availability error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check session availability',
            error: error.message
        });
    }
};

// ==================== RESCHEDULING ====================
export const rescheduleAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { newDate, sessionType, reason } = req.body;
        
        if (!newDate || !sessionType) {
            return res.status(400).json({
                success: false,
                message: 'New date and session type are required'
            });
        }
        
        if (!['morning', 'afternoon'].includes(sessionType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid session type'
            });
        }
        
        const selectedDate = new Date(newDate);
        selectedDate.setHours(0, 0, 0, 0);
        
        const dayStart = new Date(selectedDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(selectedDate);
        dayEnd.setHours(23, 59, 59, 999);
        
        // Check if session is already booked
        const existingAppointment = await Appointment.findOne({
            preferredDate: { $gte: dayStart, $lte: dayEnd },
            sessionType: sessionType,
            status: { $in: ['pending', 'confirmed', 'rescheduled'] },
            _id: { $ne: appointmentId }
        });
        
        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                message: 'The requested session is not available'
            });
        }
        
        const sessionTime = SESSION_TIMES[sessionType];
        
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            {
                preferredDate: new Date(newDate),
                sessionType: sessionType,
                status: 'rescheduled',
                notes: reason ? `Rescheduled: ${reason}` : 'Appointment rescheduled'
            },
            { new: true }
        );
        
        if (!updatedAppointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Appointment rescheduled successfully',
            data: updatedAppointment
        });
        
    } catch (error) {
        console.error('Reschedule Appointment Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// ==================== LEGACY FUNCTIONS (For backward compatibility) ====================
export const checkTimeSlotAvailability = async (req, res) => {
    try {
        const { date, session } = req.query;
        
        if (session && ['morning', 'afternoon'].includes(session)) {
            const result = await checkSessionAvailabilityLogic(date, session);
            return res.status(200).json({
                success: true,
                isAvailable: result.isAvailable,
                message: result.message
            });
        }
        
        const result = await getAvailableSessionsLogic(date);
        return res.status(200).json({
            success: true,
            availableSessions: result,
            sessionTimes: SESSION_TIMES,
            message: 'Session availability retrieved'
        });
        
    } catch (error) {
        console.error('Check Time Slot Availability Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getAvailableTimeSlotsWithDuration = async (req, res) => {
    try {
        const { date } = req.query;
        
        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date is required'
            });
        }
        
        const availability = await getAvailableSessionsLogic(date);
        
        res.status(200).json({
            success: true,
            data: {
                morning: availability.morning,
                afternoon: availability.afternoon
            },
            sessionTimes: SESSION_TIMES,
            message: 'Session availability retrieved successfully'
        });
        
    } catch (error) {
        console.error('Get Available Time Slots Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

export const checkAvailability = async (req, res) => {
    try {
        const { date, sessionType } = req.body;

        if (!date || !sessionType) {
            return res.status(400).json({
                success: false,
                message: 'Date and session type are required'
            });
        }

        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        const existingAppointment = await Appointment.findOne({
            preferredDate: { $gte: startDate, $lte: endDate },
            sessionType: sessionType,
            status: { $in: ['pending', 'confirmed', 'rescheduled'] }
        }); 

        const unavailableDate = await UnavailableDate.findOne({
            date: {$gte: startDate, $lte: endDate}
        }); 

        const isAvailable = !existingAppointment && !unavailableDate;

        res.status(200).json({
            success: true,
            isAvailable,
            sessionTime: SESSION_TIMES[sessionType],
            message: isAvailable ? 'Session is available' : 'Session is not available'
        });

    } catch (error) {
        console.error('Check Availability Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

export const getAvailableTimeSlots = async (req, res) => {
    try {
        const { date } = req.body;

        if (!date){ 
            return res.status(400).json({
                success: false,
                message: 'Date is required'
            });
        }

        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        const bookedAppointments = await Appointment.find({
            preferredDate: { $gte: startDate, $lte: endDate },
            status: { $in: ['pending', 'confirmed', 'rescheduled'] }
        }).select('sessionType');

        const bookedSessions = bookedAppointments.map(app => app.sessionType);

        const unavailableDate = await UnavailableDate.findOne({
            date: {$gte: startDate, $lte: endDate}
        }); 

        const availableSessions = {
            morning: !bookedSessions.includes('morning') && !unavailableDate,
            afternoon: !bookedSessions.includes('afternoon') && !unavailableDate
        };

        res.status(200).json({
            success: true,
            availableSessions,
            sessionTimes: SESSION_TIMES,
            isDateUnavailable: !!unavailableDate,
            unavailableReason: unavailableDate?.reason || null
        });

    } catch (error) {
        console.error('Get Available Time Slots Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// ==================== UNAVAILABLE DATES ====================
export const getUnavailableDates = async (req, res) => {
    try {
        const unavailableDates = await UnavailableDate.find().sort({ date: 1 });
        
        res.status(200).json({
            success: true,
            message: 'Unavailable dates retrieved successfully',
            data: unavailableDates,
            count: unavailableDates.length
        });
    } catch (error) {
        console.error('Get Unavailable Dates Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

export const setUnavailableDate = async (req, res) => {
    try {
        const { date, reason } = req.body;
        
        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);
        
        const existing = await UnavailableDate.findOne({ 
            date: {
                $gte: normalizedDate,
                $lt: new Date(normalizedDate.getTime() + 24 * 60 * 60 * 1000)
            }
        });
        
        if (existing) {
            existing.reason = reason || 'Not Available';
            existing.updatedAt = new Date();
            await existing.save();
            
            return res.status(200).json({
                success: true,
                message: 'Unavailable date updated',
                data: existing
            });
        }
        
        const unavailableDate = await UnavailableDate.create({
            date: normalizedDate,
            reason: reason || 'Not Available'
        });
        
        res.status(201).json({
            success: true,
            message: 'Date marked as unavailable',
            data: unavailableDate
        });
    } catch (error) {
        console.error('Set Unavailable Date Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

export const deleteUnavailableDate = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deleted = await UnavailableDate.findByIdAndDelete(id);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Unavailable date not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Unavailable date removed successfully',
            data: deleted
        });
    } catch (error) {
        console.error('Delete Unavailable Date Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// ==================== HELPER FUNCTIONS ====================
const checkSessionAvailabilityLogic = async (date, session) => {
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    
    const dayStart = new Date(selectedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(selectedDate);
    dayEnd.setHours(23, 59, 59, 999);
    
    const existingAppointment = await Appointment.findOne({
        preferredDate: { $gte: dayStart, $lte: dayEnd },
        sessionType: session,
        status: { $in: ['pending', 'confirmed', 'rescheduled'] }
    });
    
    return { isAvailable: !existingAppointment };
};

const getAvailableSessionsLogic = async (date) => {
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    
    const dayStart = new Date(selectedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(selectedDate);
    dayEnd.setHours(23, 59, 59, 999);
    
    const existingAppointments = await Appointment.find({
        preferredDate: { $gte: dayStart, $lte: dayEnd },
        status: { $in: ['pending', 'confirmed', 'rescheduled'] }
    });
    
    return {
        morning: !existingAppointments.some(a => a.sessionType === 'morning'),
        afternoon: !existingAppointments.some(a => a.sessionType === 'afternoon')
    };
};