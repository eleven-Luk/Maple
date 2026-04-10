// controllers/Maple/AppointmentController.js
import Appointment from "../../models/Maple/Appointment.js";
import UnavailableDate from "../../models/Maple/UnavailableDate.js";
import { sendNewAppointmentNotification, sendClientConfirmationEmail } from '../../utils/emailService.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify transporter
transporter.verify((error, success) => {
    if (error) {
        console.error('Email transporter error:', error);
    } else {
        console.log('✅ Email server is ready for appointments');
    }
});

// Send status update email
const sendStatusUpdateEmail = async (appointment, newStatus, adminMessage) => {
    // Enhanced status messages
    const statusMessages = {
        pending: 'Your appointment request has been received and is pending review by our team. We will confirm your appointment within 24 hours.',
        confirmed: 'Great news! Your appointment has been confirmed. We look forward to capturing your special moments.',
        completed: 'Your appointment has been marked as completed. Thank you for choosing Maple Photography! We hope you loved your experience.',
        cancelled: 'Your appointment has been cancelled. We hope to serve you in the future.',
        rescheduled: 'Your appointment has been rescheduled. Please review the new date and time below.'
    };

    const statusTitles = {
        pending: 'Pending Confirmation',
        confirmed: 'Confirmed',
        completed: 'Completed',
        cancelled: 'Cancelled',
        rescheduled: 'Rescheduled'
    };

    const statusColors = {
        pending: '#f59e0b',
        confirmed: '#3b82f6',
        completed: '#10b981',
        cancelled: '#ef4444',
        rescheduled: '#8b5cf6'
    };

    const statusIcons = {
        pending: '⏳',
        confirmed: '✅',
        completed: '🎉',
        cancelled: '❌',
        rescheduled: '🔄'
    };

    const mailOptions = {
        from: `"Maple Photography" <${process.env.EMAIL_USER}>`,
        to: appointment.email,
        subject: `Appointment Status Update - ${statusTitles[newStatus].toUpperCase()}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                </style>
            </head>
            <body style="font-family: 'Inter', 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div style="max-width: 550px; margin: 50px auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);">
                    <!-- Header -->
                    <div style="background: ${statusColors[newStatus]}; padding: 40px 30px; text-align: center;">
                        <div style="font-size: 56px; margin-bottom: 15px;">${statusIcons[newStatus]}</div>
                        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">Maple Photography</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">Appointment Status Update</p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 40px 35px;">
                        <!-- Status Badge -->
                        <div style="text-align: center; margin-bottom: 30px;">
                            <div style="display: inline-block; padding: 8px 24px; background: ${statusColors[newStatus]}15; border-radius: 50px; border: 1px solid ${statusColors[newStatus]}30;">
                                <span style="color: ${statusColors[newStatus]}; font-weight: 600; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">
                                    ${statusTitles[newStatus].toUpperCase()}
                                </span>
                            </div>
                        </div>
                        
                        <!-- Greeting -->
                        <h2 style="color: #1f2937; font-size: 22px; font-weight: 600; margin-bottom: 15px;">
                            Dear ${appointment.name},
                        </h2>
                        
                        <!-- Status Message Box -->
                        <div style="background: ${statusColors[newStatus]}10; border-radius: 16px; padding: 20px; margin: 20px 0;">
                            <p style="color: #1f2937; line-height: 1.7; margin: 0; font-size: 15px;">
                                ${statusMessages[newStatus]}
                            </p>
                        </div>
                        
                        <!-- Appointment Details Card -->
                        <div style="background: #f9fafb; border-radius: 16px; padding: 25px; margin: 25px 0; border: 1px solid #e5e7eb;">
                            <h3 style="color: #374151; margin: 0 0 20px 0; font-size: 16px; font-weight: 600;">📋 Appointment Details</h3>
                            <div style="display: grid; gap: 15px;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <span style="font-size: 22px;">📅</span>
                                    <div>
                                        <p style="color: #6b7280; font-size: 11px; margin-bottom: 2px;">DATE</p>
                                        <p style="color: #1f2937; font-weight: 500; font-size: 14px;">${new Date(appointment.preferredDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <span style="font-size: 22px;">⏰</span>
                                    <div>
                                        <p style="color: #6b7280; font-size: 11px; margin-bottom: 2px;">TIME</p>
                                        <p style="color: #1f2937; font-weight: 500; font-size: 14px;">${appointment.preferredTime}</p>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <span style="font-size: 22px;">📍</span>
                                    <div>
                                        <p style="color: #6b7280; font-size: 11px; margin-bottom: 2px;">LOCATION</p>
                                        <p style="color: #1f2937; font-weight: 500; font-size: 14px;">${appointment.location}</p>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <span style="font-size: 22px;">📦</span>
                                    <div>
                                        <p style="color: #6b7280; font-size: 11px; margin-bottom: 2px;">PACKAGE</p>
                                        <p style="color: #1f2937; font-weight: 500; font-size: 14px; text-transform: capitalize;">${appointment.packageType} Session</p>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <span style="font-size: 22px;">⏱️</span>
                                    <div>
                                        <p style="color: #6b7280; font-size: 11px; margin-bottom: 2px;">DURATION</p>
                                        <p style="color: #1f2937; font-weight: 500; font-size: 14px;">${appointment.durationHours} hour${appointment.durationHours > 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Admin Message -->
                        ${adminMessage && adminMessage.trim() !== '' ? `
                        <div style="background: #eff6ff; border-left: 4px solid ${statusColors[newStatus]}; padding: 18px; margin: 25px 0; border-radius: 12px;">
                            <p style="color: #1e40af; margin: 0; font-size: 13px; line-height: 1.5;">
                                <strong style="display: block; margin-bottom: 8px;">💬 Message from our team:</strong>
                                ${adminMessage}
                            </p>
                        </div>
                        ` : ''}
                        
                        <!-- Next Steps -->
                        <div style="background: #f0fdf4; border-radius: 16px; padding: 20px; margin: 25px 0; border: 1px solid #bbf7d0;">
                            <h4 style="color: #166534; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">📌 What's next?</h4>
                            <p style="color: #166534; margin: 0; font-size: 13px; line-height: 1.5;">
                                ${newStatus === 'confirmed' ? 'Please arrive 10 minutes before your scheduled time. Bring any reference photos or ideas you\'d like to discuss. We look forward to creating beautiful memories with you!' :
                                  newStatus === 'completed' ? 'Thank you for choosing Maple Photography! You will receive your edited photos within 2-3 weeks. We\'d love to hear about your experience!' :
                                  newStatus === 'cancelled' ? 'If you need to reschedule, please book a new appointment through our website. We hope to work with you in the future!' :
                                  newStatus === 'rescheduled' ? 'Please mark your calendar with the new date and time. If you need any changes, contact us as soon as possible.' :
                                  'You will receive another update once your appointment is confirmed.'}
                            </p>
                        </div>
                        
                        <!-- Contact Info -->
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0 20px;">
                        
                        <div style="text-align: center;">
                            <p style="color: #9ca3af; font-size: 12px; margin: 0 0 10px 0;">
                                Need to make changes or have questions?
                            </p>
                            <a href="mailto:${process.env.EMAIL_USER}" style="color: ${statusColors[newStatus]}; text-decoration: none; font-size: 13px; font-weight: 500;">
                                ${process.env.EMAIL_USER}
                            </a>
                            <p style="color: #d1d5db; font-size: 10px; margin-top: 20px;">
                                © ${new Date().getFullYear()} Maple Photography. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    console.log(`📧 Sending appointment email to ${appointment.email} about status: ${newStatus}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Appointment email sent: ${info.messageId}`);
    return info;
};

// ==================== CREATE ====================
export const createAppointment = async (req, res) => {
    try {
        const { name, email, phone, packageType, preferredDate, preferredTime, durationHours, location, specialRequests } = req.body;

        if (!name || !email || !phone || !packageType || !preferredDate || !preferredTime || !location || !durationHours) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields',
            });
        }

        const existingAppointment = await Appointment.findOne({ email, preferredDate, preferredTime });

        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                message: 'An appointment already exists for this email and time slot.',
            });
        }

        const newAppointment = await Appointment.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            packageType: packageType.trim(),
            preferredDate: new Date(preferredDate),
            preferredTime: preferredTime.trim(),
            durationHours: Number(durationHours),
            location: location.trim(),
            specialRequests: specialRequests ? specialRequests.trim() : '',
            status: 'pending'
        });

        // Send email notifications
        try {
            // Send notification to admin
            await sendNewAppointmentNotification({
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
                packageType: packageType,
                preferredDate: preferredDate,
                preferredTime: preferredTime,
                durationHours: durationHours,
                location: location,
                specialRequests: specialRequests || ''
            });
            
            // Send confirmation to client
            await sendClientConfirmationEmail({
                name: name.trim(),
                email: email.trim(),
                packageType: packageType,
                preferredDate: preferredDate,
                preferredTime: preferredTime,
                location: location
            });
            
            console.log('✅ Both admin and client emails sent successfully');
        } catch (emailError) {
            console.error('❌ Email sending failed:', emailError);
            // Don't fail the appointment creation if email fails
        }

        return res.status(201).json({
            success: true,
            message: 'Your appointment has been booked successfully! A confirmation email has been sent.',
            data: newAppointment,
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors
            });
        }

        console.error('Create Appointment Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};


// ==================== READ ====================
export const getAppointments = async (req, res) => {
    try {
        // Include all statuses including rescheduled
        const appointments = await Appointment.find({
            $or: [
                { deletedAt: null }, 
                { deletedAt: { $exists: false } }
            ]
        }).sort({ preferredDate: 1, preferredTime: 1, createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Appointments retrieved successfully',
            data: appointments,
            count: appointments.length,
        });

    } catch (error) {
        console.error('Error retrieving appointments:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

export const getViewAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }

        res.json({
            success: true,
            message: 'Appointment retrieved successfully',
            data: appointment,
        });
        
    } catch (error) {
        console.error('Get Appointment Error: ', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });      
    }
};

export const getAppointmentsByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        
        // Include rescheduled in valid statuses
        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }
        
        const appointments = await Appointment.find({ status })
            .sort({ preferredDate: 1, preferredTime: 1 });
        
        res.status(200).json({
            success: true,
            message: `${status} appointments retrieved successfully`,
            data: appointments,
            count: appointments.length
        });
        
    } catch (error) {
        console.error('Get Appointments By Status Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getConfirmedAppointments = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // ✅ FIX: Include both 'confirmed' AND 'rescheduled' appointments
        const appointments = await Appointment.find({
            status: { $in: ['confirmed', 'rescheduled'] },  // <-- ADD 'rescheduled'
            preferredDate: { $gte: today }
        }).sort({ preferredDate: 1, preferredTime: 1 });

        res.status(200).json({
            success: true,
            message: 'Confirmed and rescheduled appointments retrieved successfully',
            data: appointments,
            count: appointments.length
        });

    } catch (error) {
        console.error('Get Confirmed Appointments Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

export const getUpcomingAppointments = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const appointments = await Appointment.find({
            status: { $in: ['pending', 'confirmed'] },
            preferredDate: { $gte: today, $lte: nextWeek }
        }).sort({ preferredDate: 1, preferredTime: 1 });

        res.status(200).json({
            success: true,
            message: 'Upcoming appointments retrieved successfully',
            data: appointments,
            count: appointments.length
        });

    } catch (error) {
        console.error('Get Upcoming Appointments Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

export const confirmAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        
        const appointment = await Appointment.findById(appointmentId);
        
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }
        
        if (appointment.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Only pending appointments can be confirmed'
            });
        }
        
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            { status: 'confirmed' },
            { new: true }
        );
        
        res.status(200).json({
            success: true,
            message: 'Appointment confirmed successfully',
            data: updatedAppointment
        });
        
    } catch (error) {
        console.error('Confirm Appointment Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// ==================== UPDATE ====================
export const updateAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { status, notes, sendEmail, adminMessage, rescheduleDate, rescheduleTime, rescheduleDuration } = req.body;
        
        const appointment = await Appointment.findById(appointmentId);
        
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }
        
        const oldStatus = appointment.status;
        
        // Update basic fields
        appointment.status = status;
        if (notes) appointment.notes = notes;
        appointment.updatedAt = Date.now();
        
        // Handle reschedule - update the date and time
        if (status === 'rescheduled' && rescheduleDate && rescheduleTime) {
            appointment.preferredDate = new Date(rescheduleDate);
            appointment.preferredTime = rescheduleTime;
            if (rescheduleDuration) {
                appointment.durationHours = parseInt(rescheduleDuration);
            }
            appointment.rescheduledDate = new Date();
            console.log(`✅ Appointment rescheduled to ${rescheduleDate} at ${rescheduleTime}`);
        } else {
            console.log('Not rescheduling - conditions not met');
            console.log('status === rescheduled?', status === 'rescheduled');
            console.log('rescheduleDate:', rescheduleDate);
            console.log('rescheduleTime:', rescheduleTime);
        }
        
        await appointment.save();
        
        // Send email notification if requested and status changed
        const shouldSendEmail = sendEmail === true && oldStatus !== status;
        console.log('Should send email:', shouldSendEmail);
        
        if (shouldSendEmail) {
            try {
                await sendStatusUpdateEmail(appointment, status, adminMessage);
                console.log(`✅ Email sent to ${appointment.email}`);
            } catch (emailError) {
                console.error('❌ Email failed:', emailError);
            }
        }
        
        res.status(200).json({
            success: true,
            data: appointment,
            message: 'Appointment updated successfully'
        });
        
    } catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update appointment: ' + error.message
        });
    }
};

// ==================== BULK DELETE ====================
export const bulkDeleteAppointments = async (req, res) => {
    try {
        const { appointmentIds } = req.body;
        
        if (!appointmentIds || !Array.isArray(appointmentIds) || appointmentIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an array of appointment IDs to delete'
            });
        }
        
        console.log(`Bulk deleting ${appointmentIds.length} appointments`);
        
        const result = await Appointment.deleteMany({
            _id: { $in: appointmentIds }
        });
        
        res.status(200).json({
            success: true,
            message: `Successfully deleted ${result.deletedCount} appointment(s)`,
            data: {
                deletedCount: result.deletedCount
            }
        });
        
    } catch (error) {
        console.error('Bulk delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete appointments',
            error: error.message
        });
    }
};

// ==================== DELETE ====================
export const deleteAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const deletedAppointment = await Appointment.findByIdAndDelete(appointmentId);

        if (!deletedAppointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Appointment deleted successfully',
            data: deletedAppointment,
        });

    } catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// ==================== STATISTICS ====================
export const getAppointmentStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const stats = {
            total: await Appointment.countDocuments(),
            pending: await Appointment.countDocuments({ status: 'pending' }),
            confirmed: await Appointment.countDocuments({ status: 'confirmed' }),
            completed: await Appointment.countDocuments({ status: 'completed' }),
            cancelled: await Appointment.countDocuments({ status: 'cancelled' }),
            rescheduled: await Appointment.countDocuments({ status: 'rescheduled' }),
            upcoming: await Appointment.countDocuments({
                status: { $in: ['pending', 'confirmed'] },
                preferredDate: { $gte: today }
            }),
            thisWeek: await Appointment.countDocuments({
                preferredDate: { $gte: today, $lte: nextWeek }
            })
        };

        res.status(200).json({
            success: true,
            message: 'Appointment statistics retrieved successfully',
            data: stats
        });

    } catch (error) {
        console.error('Get Appointment Stats Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};