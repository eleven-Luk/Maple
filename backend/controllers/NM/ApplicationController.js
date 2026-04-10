// controllers/NM/ApplicationController.js
import Application from '../../models/NM/Application.js';
import Job from '../../models/NM/Job.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

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
        console.log('✅ Email server is ready for applications');
    }
});

// Send admin notification for new application
const sendNewApplicationNotification = async (applicationData, jobName, resumePath) => {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    
    const mailOptions = {
        from: `"NM Staffing Website" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `💼 NEW JOB APPLICATION - ${applicationData.firstName} ${applicationData.lastName} - ${jobName}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none; }
                    .detail-row { margin-bottom: 15px; padding: 10px; background: white; border-radius: 8px; border-left: 4px solid #f97316; }
                    .label { font-weight: bold; color: #4b5563; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
                    .value { color: #1f2937; font-size: 16px; }
                    .badge { display: inline-block; padding: 5px 12px; background: #fef3c7; color: #92400e; border-radius: 20px; font-size: 12px; font-weight: bold; }
                    .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div style="font-size: 48px; margin-bottom: 10px;">💼</div>
                        <h2>New Job Application Received</h2>
                        <p>A new application has been submitted on NM Staffing website</p>
                    </div>
                    <div class="content">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <span class="badge">PENDING REVIEW</span>
                        </div>
                        
                        <div class="detail-row">
                            <div class="label">👤 Full Name</div>
                            <div class="value">${applicationData.firstName} ${applicationData.middleName ? applicationData.middleName + ' ' : ''}${applicationData.lastName}</div>
                        </div>
                        
                        <div class="detail-row">
                            <div class="label">📧 Email Address</div>
                            <div class="value">${applicationData.email}</div>
                        </div>
                        
                        <div class="detail-row">
                            <div class="label">📞 Phone Number</div>
                            <div class="value">${applicationData.phone}</div>
                        </div>
                        
                        <div class="detail-row">
                            <div class="label">💼 Position Applied</div>
                            <div class="value">${jobName}</div>
                        </div>
                        
                        ${applicationData.message ? `
                        <div class="detail-row">
                            <div class="label">💬 Cover Letter / Message</div>
                            <div class="value">${applicationData.message}</div>
                        </div>
                        ` : ''}
                        
                        <div class="detail-row">
                            <div class="label">📄 Resume/CV</div>
                            <div class="value">Attached to this email</div>
                        </div>
                        
                        <div style="background: #e0e7ff; padding: 15px; border-radius: 8px; margin-top: 20px;">
                            <p style="margin: 0; color: #3730a3; font-size: 14px;">
                                <strong>⚠️ Action Required:</strong> Please review this application and update its status in the admin dashboard.
                            </p>
                        </div>
                    </div>
                    <div class="footer">
                        <p>NM Staffing Application System</p>
                        <p>© ${new Date().getFullYear()} NM Staffing. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        attachments: resumePath ? [{
            filename: path.basename(resumePath),
            path: resumePath
        }] : []
    };
    
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ New application notification sent to admin: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('❌ Failed to send admin notification:', error);
        throw error;
    }
};

// Send auto-reply to applicant
const sendApplicantConfirmation = async (applicationData, jobName) => {
    const mailOptions = {
        from: `"NM Staffing" <${process.env.EMAIL_USER}>`,
        to: applicationData.email,
        subject: `Application Received - ${jobName} - NM Staffing`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none; }
                    .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div style="font-size: 48px; margin-bottom: 10px;">📧</div>
                        <h2>Application Received!</h2>
                    </div>
                    <div class="content">
                        <p>Dear ${applicationData.firstName} ${applicationData.lastName},</p>
                        
                        <p>Thank you for applying for the <strong>${jobName}</strong> position at <strong>NM Staffing</strong>. We have successfully received your application.</p>
                        
                        <div style="background: #e0e7ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin: 0 0 10px 0; color: #3730a3;">Application Summary:</h3>
                            <p style="margin: 5px 0;"><strong>Position:</strong> ${jobName}</p>
                            <p style="margin: 5px 0;"><strong>Application Date:</strong> ${new Date().toLocaleDateString()}</p>
                        </div>
                        
                        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0; color: #92400e;">
                                <strong>📌 What's Next?</strong><br>
                                Our recruitment team will review your application within 3-5 business days. 
                                You will receive another email once your application has been reviewed.
                            </p>
                        </div>
                        
                        <p>If you have any questions, please don't hesitate to contact our HR team.</p>
                        
                        <p>Best regards,<br>
                        <strong>NM Staffing Recruitment Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} NM Staffing. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };
    
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Confirmation email sent to ${applicationData.email}: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('❌ Failed to send confirmation email:', error);
        throw error;
    }
};

// Send status update email for applications
const sendApplicationStatusEmail = async (application, newStatus, adminMessage) => {
    const statusMessages = {
        pending: 'Your application has been received and is pending review.',
        reviewed: 'Your application has been reviewed by our hiring team.',
        interviewed: 'Congratulations! You have been selected for an interview.',
        hired: 'We are pleased to inform you that you have been hired!',
        rejected: 'Thank you for your interest, but we have decided to move forward with other candidates.'
    };

    const statusColors = {
        pending: '#f59e0b',
        reviewed: '#3b82f6',
        interviewed: '#8b5cf6',
        hired: '#10b981',
        rejected: '#ef4444'
    };

    const statusIcons = {
        pending: '⏳',
        reviewed: '👀',
        interviewed: '🎤',
        hired: '🎉',
        rejected: '📧'
    };

    const jobName = application.jobId?.name || 'the position';
    const applicantName = `${application.firstName} ${application.lastName}`;

    const mailOptions = {
        from: `"NM Staffing" <${process.env.EMAIL_USER}>`,
        to: application.email,
        subject: `Application Status Update - ${newStatus.toUpperCase()} - ${jobName}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                </style>
            </head>
            <body style="font-family: 'Inter', 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div style="max-width: 550px; margin: 50px auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);">
                    <div style="background: ${statusColors[newStatus]}; padding: 40px 30px; text-align: center;">
                        <div style="font-size: 56px; margin-bottom: 15px;">${statusIcons[newStatus]}</div>
                        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">NM Staffing</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">Application Status Update</p>
                    </div>
                    
                    <div style="padding: 40px 35px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <div style="display: inline-block; padding: 8px 24px; background: ${statusColors[newStatus]}15; border-radius: 50px; border: 1px solid ${statusColors[newStatus]}30;">
                                <span style="color: ${statusColors[newStatus]}; font-weight: 600; text-transform: uppercase; font-size: 12px;">
                                    ${newStatus.toUpperCase()}
                                </span>
                            </div>
                        </div>
                        
                        <h2 style="color: #1f2937; font-size: 22px; font-weight: 600; margin-bottom: 15px;">
                            Dear ${applicantName},
                        </h2>
                        
                        <p style="color: #4b5563; line-height: 1.6; margin-bottom: 25px; font-size: 15px;">
                            ${statusMessages[newStatus]}
                        </p>
                        
                        <div style="background: #f9fafb; border-radius: 16px; padding: 25px; margin: 25px 0; border: 1px solid #e5e7eb;">
                            <h3 style="color: #374151; margin: 0 0 20px 0; font-size: 16px;">📋 Application Details</h3>
                            <div style="display: grid; gap: 15px;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <span style="font-size: 22px;">💼</span>
                                    <div>
                                        <p style="color: #6b7280; font-size: 11px; margin-bottom: 2px;">POSITION APPLIED</p>
                                        <p style="color: #1f2937; font-weight: 500; font-size: 14px;">${jobName}</p>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <span style="font-size: 22px;">📅</span>
                                    <div>
                                        <p style="color: #6b7280; font-size: 11px; margin-bottom: 2px;">APPLICATION DATE</p>
                                        <p style="color: #1f2937; font-weight: 500; font-size: 14px;">${new Date(application.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        ${adminMessage && adminMessage.trim() !== '' ? `
                        <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 18px; margin: 25px 0; border-radius: 12px;">
                            <p style="color: #1e40af; margin: 0; font-size: 13px;">
                                <strong style="display: block; margin-bottom: 8px;">💬 Message from our hiring team:</strong>
                                ${adminMessage}
                            </p>
                        </div>
                        ` : ''}
                        
                        <div style="background: #f0fdf4; border-radius: 16px; padding: 20px; margin: 25px 0; border: 1px solid #bbf7d0;">
                            <h4 style="color: #166534; margin: 0 0 12px 0; font-size: 14px;">📌 What's next?</h4>
                            <p style="color: #166534; margin: 0; font-size: 13px;">
                                ${newStatus === 'interviewed' ? 'Our recruitment team will contact you within 3-5 business days to schedule the interview.' :
                                  newStatus === 'hired' ? 'You will receive an onboarding email within 24 hours with next steps.' :
                                  newStatus === 'rejected' ? 'We encourage you to visit our careers page for other opportunities.' :
                                  'We will notify you once a decision has been made regarding your application.'}
                            </p>
                        </div>
                        
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0 20px;">
                        
                        <div style="text-align: center;">
                            <p style="color: #9ca3af; font-size: 12px;">Need to follow up? Contact us at</p>
                            <a href="mailto:${process.env.EMAIL_USER}" style="color: ${statusColors[newStatus]}; text-decoration: none; font-size: 13px;">
                                ${process.env.EMAIL_USER}
                            </a>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    console.log(`📧 Sending email to ${application.email} about status: ${newStatus}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent: ${info.messageId}`);
    return info;
};

// ==================== CREATE APPLICATION ====================
export const createApplication = async (req, res) => {
    try {
        console.log('📝 Creating new application...');
        console.log('Request body:', req.body);
        console.log('Uploaded file:', req.file);
        
        const { firstName, middleName, lastName, email, phone, jobId, message } = req.body;
        
        // Validate required fields
        if (!firstName || !lastName || !email || !phone || !jobId) {
            return res.status(400).json({ 
                success: false,
                message: 'Please fill in all required fields',
            });
        }
        
        // Check if already applied
        const existingApplication = await Application.findOne({ email, jobId });
        
        if (existingApplication) {
            return res.status(400).json({ 
                success: false,
                message: 'You have already applied for this job' 
            });
        }
        
        // Get job details for email
        const job = await Job.findById(jobId);
        
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job position not found'
            });
        }
        
        // Get resume path from uploaded file
        const resumePath = req.file ? req.file.path : null;
        
        if (!resumePath) {
            return res.status(400).json({
                success: false,
                message: 'Resume/CV is required'
            });
        }
        
        // Create application
        const newApplication = await Application.create({
            firstName: firstName.trim(),
            middleName: middleName?.trim() || '',
            lastName: lastName.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            jobId,
            resume: resumePath,
            message: message || '',
            status: 'pending'
        });
        
        // Send email notifications
        try {
            // 1. Send notification to ADMIN
            await sendNewApplicationNotification({
                firstName: firstName.trim(),
                middleName: middleName?.trim() || '',
                lastName: lastName.trim(),
                email: email.trim(),
                phone: phone.trim(),
                message: message || '',
            }, job.name, resumePath);
            
            // 2. Send confirmation to APPLICANT
            await sendApplicantConfirmation({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim()
            }, job.name);
            
            console.log('✅ Both admin and applicant emails sent successfully');
        } catch (emailError) {
            console.error('❌ Email sending failed:', emailError);
            // Don't fail the application creation if email fails
        }
        
        res.status(201).json({
            success: true,
            message: 'Application submitted successfully! A confirmation email has been sent.',
            data: newApplication
        });
        
    } catch (error) {
        console.error('❌ Error in createApplication:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors
            });
        }
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied for this job'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// ==================== GET ALL APPLICATIONS ====================
export const getApplications = async (req, res) => {
    try {
        const applications = await Application.find({
            $or: [
                { deletedAt: null }, 
                { deletedAt: { $exists: false } }
            ], 
            status: { $nin: ['archived', 'deleted'] }
        })
        .populate('jobId', 'name type location salary')
        .select('-__v')
        .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            message: 'Applications retrieved successfully',
            data: applications,
            count: applications.length
        });

    } catch (error) {
        console.error('Get All Applications Error: ', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// ==================== GET VIEW APPLICATION ====================
export const getViewApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const application = await Application.findById(applicationId)
        .populate('jobId', 'name type location salary description requirements');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        res.json({
            success: true,
            message: 'Application found successfully',
            data: application
        });
        
    } catch (error) {
        console.error('Get Application Error: ', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching application',
        });
    }
};

// ==================== UPDATE APPLICATION STATUS ====================
export const updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status, notes, sendEmail, adminMessage } = req.body;
        
        // Get original application before update
        const originalApplication = await Application.findById(applicationId).populate('jobId', 'name');
        
        if (!originalApplication) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }
        
        const oldStatus = originalApplication.status;
        console.log('Old status:', oldStatus);
        console.log('New status:', status);
        
        // Update application
        const updatedApplication = await Application.findByIdAndUpdate(
            applicationId,
            { status, notes },
            { new: true, runValidators: true }
        ).populate('jobId', 'name');
        
        // Send email ONLY if sendEmail is true AND status changed
        const shouldSendEmail = sendEmail === true && oldStatus !== status;
        console.log('Should send email:', shouldSendEmail);
        
        if (shouldSendEmail) {
            try {
                await sendApplicationStatusEmail(updatedApplication, status, adminMessage);
                console.log(`✅ Email sent to ${updatedApplication.email}`);
            } catch (emailError) {
                console.error('❌ Email failed:', emailError);
            }
        } else {
            console.log(`📧 Email NOT sent - Reason: sendEmail=${sendEmail}, statusChanged=${oldStatus !== status}`);
        }
        
        res.status(200).json({
            success: true,
            message: 'Application status updated successfully',
            data: updatedApplication
        });
        
    } catch (error) {
        console.error('Update application error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// ==================== MOVE TO ARCHIVE ====================
export const moveToArchive = async (req, res) => {
    try {
        const { applicationId } = req.params;

        if (!applicationId) {
            return res.status(400).json({
                success: false,
                message: 'Application ID is required'
            });
        }

        const now = new Date();

        const movedApplication = await Application.findByIdAndUpdate(
            applicationId,
            {
                archivedAt: now,
                status: 'archived',
            },
            { new: true }
        );
        
        if (!movedApplication) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Application moved to archive successfully',
            data: {
                id: movedApplication._id,
                name: `${movedApplication.firstName} ${movedApplication.lastName}`,
                status: movedApplication.status,
                archivedAt: movedApplication.archivedAt,
            }
        });

    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid application ID format'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to move application to archive',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ==================== GET ARCHIVED APPLICATIONS ====================
export const getArchivedApplications = async (req, res) => {
    try {
        const archivedApplications = await Application.find({
            status: 'archived',
        })
        .select('-__v')
        .populate('jobId', 'name type location')
        .sort({ archivedAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Archived applications retrieved successfully',
            data: archivedApplications,
            count: archivedApplications.length
        });

    } catch (error) {
        console.error('Get Archived Applications Error: ', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// ==================== RESTORE APPLICATION ====================
export const restoreApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;

        if (!applicationId) {
            return res.status(400).json({
                success: false,
                message: 'Application ID is required'
            });
        }
        
        const restoredApplication = await Application.findByIdAndUpdate(
            applicationId, {
                $unset: { archivedAt: '' },
                status: 'pending',
            },
            { new: true }
        );

        if (!restoredApplication) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Application restored successfully',
            data: restoredApplication
        });

    } catch (error) {
        console.error('Restore Application Error: ', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// ==================== DELETE APPLICATION ====================
export const deleteApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const deletedApplication = await Application.findByIdAndDelete(applicationId);
        
        if (!deletedApplication) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }
        
        // Delete the resume file if it exists
        if (deletedApplication.resume && fs.existsSync(deletedApplication.resume)) {
            fs.unlinkSync(deletedApplication.resume);
            console.log(`✅ Deleted resume file: ${deletedApplication.resume}`);
        }

        res.status(200).json({
            success: true,
            message: 'Application deleted successfully',
            data: deletedApplication
        });

    } catch (error) {
        console.error('Delete Application Error: ', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};