import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    // Personal Information
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
    },
    middleName: {
        type: String,
        trim: true,
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
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
    
    // Job Details - Just jobId is enough!
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
    },
 
    // Files
    resume: {
        type: String,
        required: [true, 'Resume is required'],
    },
    message: {
        type: String,
        trim: true,
        maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    
    // Status Tracking
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'interviewed', 'hired', 'rejected', 'deleted', 'archived'],
        default: 'pending',
    },
    notes: {
        type: String,
        trim: true,
    },
        
    archivedAt: {
        type: Date,
        default: null,
    },
    
    deletedAt: {
        type: Date,
        default: null,
    },

}, {
    timestamps: true,
});

// Add indexes for better query performance
applicationSchema.index({ email: 1 });
applicationSchema.index({ jobId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ createdAt: -1 });
applicationSchema.index({ archivedAt: -1 });
applicationSchema.index({ deletedAt: -1 });

const Application = mongoose.model('Application', applicationSchema);
export default Application;