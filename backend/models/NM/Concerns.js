// models/NM/Concern.js
import mongoose from 'mongoose';

const concernSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true,
    },

    businessType: {
        type: String,
        enum: ['maple', 'nm'],
        required: true,
        default: 'nm',
    },
    
    inquiryType: {
        type: String,
        enum: ['general', 'employer-partnership', 'package-information', 'others'],
        default: 'general',
    },
    
    // For employer-partnership inquiries
    companyName: {
        type: String,
        trim: true,
    },
    
    // For employer-partnership inquiries (optional)
    position: {
        type: String,
        trim: true,
    },

    // Fields specific to package information (for Maple)
    packageType: {
        type: String,
        trim: true,
    },

    // For Admin Use
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved', 'rejected'],
        default: 'pending',
    },

    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    },

    notes: {
        type: String,
        trim: true,
    },

    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// Add indexes for better query performance
concernSchema.index({ businessType: 1 });
concernSchema.index({ status: 1 });
concernSchema.index({ createdAt: -1 });
concernSchema.index({ email: 1 });

concernSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const Concerns = mongoose.model('Concerns', concernSchema);
export default Concerns;