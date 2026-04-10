import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { validationResult } from 'express-validator';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Store OTPs temporarily
const otpStore = new Map();
// Store trusted devices (user email + device fingerprint)
const trustedDevices = new Map();

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Generate token with 1 day expiration
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '1d' // Token expires in 1 day
    });
};

// Generate device fingerprint (simple version - can be enhanced)
const generateDeviceFingerprint = (req) => {
    // Combine user agent and IP address (or use a more sophisticated method)
    return `${req.headers['user-agent'] || ''}_${req.ip || req.connection.remoteAddress}`;
};

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: `"Admin Portal Security" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔐 Your Login Verification Code',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    <div style="max-width: 500px; margin: 50px auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 24px;">Admin Portal</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Two-Factor Authentication</p>
                        </div>
                        
                        <div style="padding: 40px 30px;">
                            <h2 style="color: #333; margin-top: 0;">Verification Required</h2>
                            <p style="color: #666; line-height: 1.6;">Use the verification code below to complete your sign-in:</p>
                            
                            <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; text-align: center; margin: 30px 0;">
                                <div style="font-size: 42px; font-weight: bold; letter-spacing: 8px; color: #4f46e5; font-family: monospace;">
                                    ${otp}
                                </div>
                            </div>
                            
                            <p style="color: #666; font-size: 14px;">This code will expire in <strong>10 minutes</strong>.</p>
                            
                            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; border-radius: 8px;">
                                <p style="color: #92400e; margin: 0; font-size: 13px;">
                                    <strong>⚠️ Security Tip:</strong> Never share this code with anyone.
                                </p>
                            </div>
                        </div>
                    </div>
                </body>
            </html>
        `
    };

    await transporter.sendMail(mailOptions);
};

export const registerUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser){
            return res.status(400).json({ message: 'User already exist with this email'});
        }
        
        const user = await User.create({
            username, 
            email,
            password
        });

        const token = generateToken(user._id, user.role);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            message: 'Server error during registration'
        });
    }
};

export const loginUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
        
        const { email, password, otp, rememberDevice } = req.body;
        
        // Generate device fingerprint
        const deviceFingerprint = generateDeviceFingerprint(req);
        const trustKey = `${email}_${deviceFingerprint}`;

        const user = await User.findOne({ email }).select('+password');

        if (!user){
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const isMatchPassword = await user.comparePassword(password);
        if (!isMatchPassword){
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if device is trusted (OTP not needed for trusted devices within 1 day)
        const trustedDevice = trustedDevices.get(trustKey);
        const isDeviceTrusted = trustedDevice && trustedDevice.expires > Date.now();

        // If OTP is provided, verify it
        if (otp) {
            const storedOTP = otpStore.get(email);
            
            if (!storedOTP) {
                return res.status(401).json({
                    success: false,
                    message: 'No verification code found. Please request a new code.'
                });
            }
            
            if (storedOTP.otp !== otp) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid verification code'
                });
            }
            
            if (storedOTP.expires < Date.now()) {
                otpStore.delete(email);
                return res.status(401).json({
                    success: false,
                    message: 'Verification code has expired. Please request a new code.'
                });
            }
            
            // Clear OTP after successful verification
            otpStore.delete(email);
            
            // Trust this device for 1 day if requested
            if (rememberDevice) {
                trustedDevices.set(trustKey, {
                    email,
                    deviceFingerprint,
                    expires: Date.now() + 24 * 60 * 60 * 1000 // 1 day
                });
            }
            
            // Generate token
            const token = generateToken(user._id, user.role);
            
            return res.status(200).json({
                success: true,
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });
        }
        
        // If device is trusted and within 1 day, skip OTP
        if (isDeviceTrusted) {
            console.log(`Device trusted for ${email}, skipping OTP`);
            const token = generateToken(user._id, user.role);
            return res.status(200).json({
                success: true,
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });
        }
        
        // First step - send OTP
        const otpCode = generateOTP();
        const expires = Date.now() + 10 * 60 * 1000;
        
        otpStore.set(email, { otp: otpCode, expires });
        
        // Send email
        sendOTPEmail(email, otpCode).catch(console.error);
        
        res.status(200).json({
            success: true,
            requiresOTP: true,
            message: `Verification code sent to ${email.replace(/(.{2})(.*)(?=@)/, '$1***')}`
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

export const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        const otpCode = generateOTP();
        const expires = Date.now() + 10 * 60 * 1000;
        
        otpStore.set(email, { otp: otpCode, expires });
        sendOTPEmail(email, otpCode).catch(console.error);
        
        res.json({
            success: true,
            message: 'New verification code sent'
        });
        
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to resend code'
        });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        res.status(200).json({
            message: 'User profile retrieved successfully',
            user
        });

    } catch (error) {
        console.error('Get Profile error:', error);
        res.status(500).json({
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
};