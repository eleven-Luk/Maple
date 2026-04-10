// controllers/Maple/ScheduleController.js
import Appointment from "../../models/Maple/Appointment.js";
import UnavailableDate from "../../models/Maple/UnavailableDate.js";

// Helper function to format end time
const formatEndTime = (startTime, durationHours) => {
    const [hours, minutes] = startTime.split(':');
    const endHour = parseInt(hours) + parseInt(durationHours);
    return `${endHour.toString().padStart(2, '0')}:${minutes}`;
};

// ==================== AVAILABILITY CHECKS ====================
export const checkTimeSlotAvailability = async (req, res) => {
    try {
        const { date, time, durationHours } = req.query;
        
        if (!date || !time || !durationHours) {
            return res.status(400).json({
                success: false,
                message: 'Date, time, and duration are required'
            });
        }
        
        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);
        
        const [hours, minutes] = time.split(':');
        const selectedStart = new Date(selectedDate);
        selectedStart.setHours(parseInt(hours), parseInt(minutes), 0);
        
        const selectedEnd = new Date(selectedStart);
        selectedEnd.setHours(selectedStart.getHours() + parseInt(durationHours));
        
        const dayStart = new Date(selectedDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(selectedDate);
        dayEnd.setHours(23, 59, 59, 999);
        
        // Get ALL confirmed and rescheduled appointments
        const existingAppointments = await Appointment.find({
            preferredDate: { $gte: dayStart, $lte: dayEnd },
            status: { $in: ['confirmed', 'rescheduled'] }
        });
        
        let hasConflict = false;
        let conflictingAppointment = null;
        
        for (const app of existingAppointments) {
            const [appHours, appMinutes] = app.preferredTime.split(':');
            const appStart = new Date(selectedDate);
            appStart.setHours(parseInt(appHours), parseInt(appMinutes), 0);
            
            const appEnd = new Date(appStart);
            appEnd.setHours(appStart.getHours() + app.durationHours);
            
            console.log(`Checking against booking: ${app.preferredTime} to ${formatEndTime(app.preferredTime, app.durationHours)}`);
            console.log(`Requested: ${time} to ${formatEndTime(time, parseInt(durationHours))}`);
            console.log(`Overlap? ${selectedStart < appEnd && selectedEnd > appStart}`);
            
            // Check if the requested time slot overlaps with existing booking
            if ((selectedStart < appEnd && selectedEnd > appStart)) {
                hasConflict = true;
                conflictingAppointment = app;
                break;
            }
        }
        
        res.status(200).json({
            success: true,
            isAvailable: !hasConflict,
            conflictingTime: hasConflict ? `${conflictingAppointment.preferredTime} - ${formatEndTime(conflictingAppointment.preferredTime, conflictingAppointment.durationHours)}` : null,
            message: hasConflict ? 'This time slot is already booked' : 'Time slot available'
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
        
        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);
        
        const dayStart = new Date(selectedDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(selectedDate);
        dayEnd.setHours(23, 59, 59, 999);
        
        // Get ALL confirmed and rescheduled appointments for this date
        const existingAppointments = await Appointment.find({
            preferredDate: { $gte: dayStart, $lte: dayEnd },
            status: { $in: ['confirmed', 'rescheduled'] }
        });
        
        console.log(`📅 Checking availability for ${date}`);
        console.log(`Found ${existingAppointments.length} existing bookings:`);
        existingAppointments.forEach(app => {
            const endTime = formatEndTime(app.preferredTime, app.durationHours);
            console.log(`   - ${app.preferredTime} to ${endTime} (${app.durationHours}h) - ${app.name}`);
        });
        
        // Define all possible time slots (30-minute intervals from 9 AM to 8 PM)
        const allTimeSlots = [];
        for (let hour = 9; hour <= 20; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                if (timeString >= '09:00' && timeString <= '20:00') {
                    allTimeSlots.push(timeString);
                }
            }
        }
        
        const availableSlots = {};
        
        // For each time slot, check if it's available
        for (const slot of allTimeSlots) {
            const [hours, minutes] = slot.split(':');
            const slotStart = new Date(selectedDate);
            slotStart.setHours(parseInt(hours), parseInt(minutes), 0);
            
            // Calculate slot end (30 minutes later for 30-min slots)
            const slotEnd = new Date(slotStart);
            slotEnd.setMinutes(slotEnd.getMinutes() + 30);
            
            let isAvailable = true;
            let conflictingAppointment = null;
            
            // Check against all existing appointments
            for (const app of existingAppointments) {
                const [appHours, appMinutes] = app.preferredTime.split(':');
                const appStart = new Date(selectedDate);
                appStart.setHours(parseInt(appHours), parseInt(appMinutes), 0);
                
                const appEnd = new Date(appStart);
                appEnd.setHours(appStart.getHours() + app.durationHours);
                
                // Check if this time slot overlaps with the existing booking
                // Overlap occurs if: slotStart < appEnd AND slotEnd > appStart
                if (slotStart < appEnd && slotEnd > appStart) {
                    isAvailable = false;
                    conflictingAppointment = app;
                    break;
                }
            }
            
            availableSlots[slot] = isAvailable;
            if (!isAvailable) {
                console.log(`   ❌ ${slot} is BOOKED`);
            }
        }
        
        // Count available vs booked
        const bookedCount = Object.values(availableSlots).filter(v => v === false).length;
        const availableCount = Object.values(availableSlots).filter(v => v === true).length;
        console.log(`📊 Results: ${availableCount} available, ${bookedCount} booked`);
        
        res.status(200).json({
            success: true,
            data: availableSlots,
            allTimeSlots,
            message: 'Available time slots retrieved successfully'
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
        const { date, time } = req.body;

        if (!date || !time) {
            return res.status(400).json({
                success: false,
                message: 'Date and time are required'
            });
        }

        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        // ✅ Include both 'confirmed' AND 'rescheduled' appointments
        const existingAppointment = await Appointment.findOne({
            preferredDate: { $gte: startDate, $lte: endDate },
            preferredTime: time,
            status: { $in: ['confirmed', 'rescheduled'] }
        }); 

        const unavailableDate = await UnavailableDate.findOne({
            date: {$gte: startDate, $lte: endDate}
        }); 

        const isAvailable = !existingAppointment && !unavailableDate;

        res.status(200).json({
            success: true,
            isAvailable,
            message: isAvailable ? 'Date is available' : 'Date is not available'
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

        // ✅ Include both 'confirmed' AND 'rescheduled' appointments
        const bookedAppointments = await Appointment.find({
            preferredDate: { $gte: startDate, $lte: endDate },
            status: { $in: ['confirmed', 'rescheduled'] }
        }).select('preferredTime');

        const bookedTimes = bookedAppointments.map(app => app.preferredTime);

        const unavailableDate = await UnavailableDate.findOne({
            date: {$gte: startDate, $lte: endDate}
        }); 

        const allTimeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

        const availableSlots = {};
        allTimeSlots.forEach(slot => {
            availableSlots[slot] = !bookedTimes.includes(slot) && !unavailableDate;
        });

        res.status(200).json({
            success: true,
            availableSlots,
            isDateUnavailable: !!unavailableDate,
            unavailableReason: unavailableDate?.reason || 'Not Available'
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

// ==================== RESCHEDULING ====================
export const rescheduleAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { newDate, newTime, durationHours, reason } = req.body;
        
        if (!newDate || !newTime || !durationHours) {
            return res.status(400).json({
                success: false,
                message: 'New date, time, and duration are required'
            });
        }
        
        const selectedDate = new Date(newDate);
        selectedDate.setHours(0, 0, 0, 0);
        
        const [hours, minutes] = newTime.split(':');
        const selectedStart = new Date(selectedDate);
        selectedStart.setHours(parseInt(hours), parseInt(minutes), 0);
        
        const selectedEnd = new Date(selectedStart);
        selectedEnd.setHours(selectedStart.getHours() + parseInt(durationHours));
        
        const dayStart = new Date(selectedDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(selectedDate);
        dayEnd.setHours(23, 59, 59, 999);
        
        const existingAppointments = await Appointment.find({
            preferredDate: { $gte: dayStart, $lte: dayEnd },
            status: 'confirmed',
            _id: { $ne: appointmentId }
        });
        
        let hasConflict = false;
        for (const app of existingAppointments) {
            const [appHours, appMinutes] = app.preferredTime.split(':');
            const appStart = new Date(selectedDate);
            appStart.setHours(parseInt(appHours), parseInt(appMinutes), 0);
            
            const appEnd = new Date(appStart);
            appEnd.setHours(appStart.getHours() + app.durationHours);
            
            if ((selectedStart < appEnd && selectedEnd > appStart)) {
                hasConflict = true;
                break;
            }
        }
        
        if (hasConflict) {
            return res.status(400).json({
                success: false,
                message: 'The requested time slot is not available'
            });
        }
        
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            {
                preferredDate: new Date(newDate),
                preferredTime: newTime,
                durationHours: parseInt(durationHours),
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