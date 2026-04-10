import mongoose from 'mongoose';

const unavailableDateSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true
    },
    reason: {
        type: String,
        default: 'Not Available'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Create compound index for faster queries
unavailableDateSchema.index({ date: 1 });

const UnavailableDate = mongoose.model('UnavailableDate', unavailableDateSchema);
export default UnavailableDate;