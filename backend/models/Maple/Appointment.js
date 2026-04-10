import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    // Personal Information
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
    
    // Appointment Details
    packageType: {
        type: String,
        enum: ['newborn', 'maternity', 'family', 'milestone', 'portrait', 'custom'],
        required: [true, 'Package type is required'],
        trim: true,
    },
    preferredDate: {
        type: Date,
        required: [true, 'Preferred date is required'],
    },
    preferredTime: {
        type: String,
        required: [true, 'Preferred time is required'],
        trim: true,
    },
    durationHours: {
        type: Number,
        default: 1,
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true,
    },
    
    // Additional Info
    specialRequests: {
        type: String,
        trim: true,
    },
    
    // Status Tracking (matches your application schema style)
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
        default: 'pending',
    },
    notes: {
        type: String,
        trim: true,
    },
    
    rescheduledDate: {
        type: Date,
        default: null,
    },


    // For calendar
    appointmentReference: {
    type: String,
    unique: true,
    default: function() {
        return 'APT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    }
    },
    confirmedDate: {
        type: Date,
        default: null
    },
    calendarEventId: {
        type: String, // For future Google Calendar integration
        default: null
    },

    
    deletedAt: {
        type: Date,
        default: null,
    },

}, {
    timestamps: true,
});

// Add indexes for better query performance
appointmentSchema.index({ email: 1 });
appointmentSchema.index({ preferredDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ createdAt: -1 });
appointmentSchema.index({ rescheduledDate: -1 });
appointmentSchema.index({ deletedAt: -1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;