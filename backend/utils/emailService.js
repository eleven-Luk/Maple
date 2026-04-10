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
        console.log('✅ Email server is ready');
    }
});

// Send admin notification for new appointment
export const sendNewAppointmentNotification = async (appointmentData) => {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    
    const mailOptions = {
        from: `"Maple Photography Website" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `📸 NEW APPOINTMENT REQUEST - ${appointmentData.name}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none; }
                    .detail-row { margin-bottom: 15px; padding: 10px; background: white; border-radius: 8px; border-left: 4px solid #667eea; }
                    .label { font-weight: bold; color: #4b5563; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
                    .value { color: #1f2937; font-size: 16px; }
                    .badge { display: inline-block; padding: 5px 12px; background: #fef3c7; color: #92400e; border-radius: 20px; font-size: 12px; font-weight: bold; }
                    .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
                    button { background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>📸 New Appointment Request</h2>
                        <p>A new appointment has been submitted on Maple Photography website</p>
                    </div>
                    <div class="content">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <span class="badge">PENDING REVIEW</span>
                        </div>
                        
                        <div class="detail-row">
                            <div class="label">👤 Client Name</div>
                            <div class="value">${appointmentData.name}</div>
                        </div>
                        
                        <div class="detail-row">
                            <div class="label">📧 Email Address</div>
                            <div class="value">${appointmentData.email}</div>
                        </div>
                        
                        <div class="detail-row">
                            <div class="label">📞 Phone Number</div>
                            <div class="value">${appointmentData.phone}</div>
                        </div>
                        
                        <div class="detail-row">
                            <div class="label">📦 Package Type</div>
                            <div class="value">${appointmentData.packageType}</div>
                        </div>
                        
                        <div class="detail-row">
                            <div class="label">📅 Preferred Date</div>
                            <div class="value">${new Date(appointmentData.preferredDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        </div>
                        
                        <div class="detail-row">
                            <div class="label">⏰ Preferred Time</div>
                            <div class="value">${appointmentData.preferredTime} (${appointmentData.durationHours} hour${appointmentData.durationHours > 1 ? 's' : ''})</div>
                        </div>
                        
                        <div class="detail-row">
                            <div class="label">📍 Location</div>
                            <div class="value">${appointmentData.location}</div>
                        </div>
                        
                        ${appointmentData.specialRequests ? `
                        <div class="detail-row">
                            <div class="label">💬 Special Requests</div>
                            <div class="value">${appointmentData.specialRequests}</div>
                        </div>
                        ` : ''}
                        
                        <div style="background: #e0e7ff; padding: 15px; border-radius: 8px; margin-top: 20px;">
                            <p style="margin: 0; color: #3730a3; font-size: 14px;">
                                <strong>⚠️ Action Required:</strong> Please review this appointment and update its status in the admin dashboard.
                            </p>
                        </div>
                    </div>
                    <div class="footer">
                        <p>Maple Photography Booking System</p>
                        <p>© ${new Date().getFullYear()} Maple Photography. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };
    
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ New appointment notification sent to admin: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('❌ Failed to send admin notification:', error);
        throw error;
    }
};

// Send confirmation email to client
export const sendClientConfirmationEmail = async (appointmentData) => {
    const mailOptions = {
        from: `"Maple Photography" <${process.env.EMAIL_USER}>`,
        to: appointmentData.email,
        subject: '📸 Appointment Request Received - Maple Photography',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none; }
                    .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>📸 Thank You for Choosing Maple Photography!</h2>
                    </div>
                    <div class="content">
                        <p>Dear ${appointmentData.name},</p>
                        <p>We have received your appointment request and are excited to work with you!</p>
                        
                        <div style="background: #e0e7ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin: 0 0 10px 0; color: #3730a3;">Appointment Details:</h3>
                            <p><strong>Package:</strong> ${appointmentData.packageType}</p>
                            <p><strong>Date:</strong> ${new Date(appointmentData.preferredDate).toLocaleDateString()}</p>
                            <p><strong>Time:</strong> ${appointmentData.preferredTime}</p>
                            <p><strong>Location:</strong> ${appointmentData.location}</p>
                        </div>
                        
                        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0; color: #92400e;">
                                <strong>📌 Next Steps:</strong><br>
                                Our team will review your request and confirm your appointment within 24 hours. 
                                You will receive another email once your appointment is confirmed.
                            </p>
                        </div>
                        
                        <p>If you have any questions, please don't hesitate to contact us.</p>
                        <p>Best regards,<br><strong>Maple Photography Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} Maple Photography. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };
    
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Confirmation email sent to ${appointmentData.email}: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('❌ Failed to send client confirmation:', error);
        throw error;
    }
};

// Send contact form notification
export const sendContactNotification = async (contactData) => {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    
    const mailOptions = {
        from: `"Maple Photography Website" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `📧 New Contact Form Message - ${contactData.name}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9fafb; }
                    .field { margin-bottom: 15px; padding: 10px; background: white; border-radius: 5px; }
                    .label { font-weight: bold; color: #374151; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>📧 New Contact Form Submission</h2>
                    </div>
                    <div class="content">
                        <div class="field">
                            <div class="label">Name:</div>
                            <div>${contactData.name}</div>
                        </div>
                        <div class="field">
                            <div class="label">Email:</div>
                            <div>${contactData.email}</div>
                        </div>
                        <div class="field">
                            <div class="label">Subject:</div>
                            <div>${contactData.subject || 'General Inquiry'}</div>
                        </div>
                        <div class="field">
                            <div class="label">Message:</div>
                            <div>${contactData.message}</div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    };
    
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Contact notification sent to admin: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('❌ Failed to send contact notification:', error);
        throw error;
    }
};

// Send job application notification
export const sendJobApplicationNotification = async (applicationData) => {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    
    const mailOptions = {
        from: `"Maple Photography Website" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `💼 New Job Application - ${applicationData.position} - ${applicationData.name}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #059669; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9fafb; }
                    .field { margin-bottom: 15px; padding: 10px; background: white; border-radius: 5px; }
                    .label { font-weight: bold; color: #374151; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>💼 New Job Application</h2>
                    </div>
                    <div class="content">
                        <div class="field">
                            <div class="label">Position Applied:</div>
                            <div>${applicationData.position}</div>
                        </div>
                        <div class="field">
                            <div class="label">Name:</div>
                            <div>${applicationData.name}</div>
                        </div>
                        <div class="field">
                            <div class="label">Email:</div>
                            <div>${applicationData.email}</div>
                        </div>
                        <div class="field">
                            <div class="label">Phone:</div>
                            <div>${applicationData.phone}</div>
                        </div>
                        <div class="field">
                            <div class="label">Experience:</div>
                            <div>${applicationData.experience}</div>
                        </div>
                        <div class="field">
                            <div class="label">Portfolio:</div>
                            <div>${applicationData.portfolio || 'Not provided'}</div>
                        </div>
                        <div class="field">
                            <div class="label">Message:</div>
                            <div>${applicationData.message}</div>
                        </div>
                        <div class="field">
                            <div class="label">Resume/CV:</div>
                            <div>Attached to this email</div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `,
        attachments: applicationData.resumePath ? [{
            filename: applicationData.resumeName,
            path: applicationData.resumePath
        }] : []
    };
    
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Job application notification sent to admin: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('❌ Failed to send job application notification:', error);
        throw error;
    }
};