import mongoose from 'mongoose';

const sampleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
    },
    setupType: {
        type: String,
        required: [true, 'Setup type is required'],
        enum: ['basket', 'fur', 'bean&bed'],
        trim: true,
    },
    gender: {
        type: String,
        required: [true, 'Gender is required'],
        enum: ['boy', 'girl'],
        trim: true,
    },
    images: [{
        url: {
            type: String,
            required: true,
        },
        filename: String,
        isPrimary: {
            type: Boolean,
            default: false,
        },
        uploadedAt: {
            type: Date,
            default: Date.now,
        }
    }],
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true,
    },
    date: {
        type: String,
        required: [true, 'Date is required'],
    },
    featured: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['active', 'archived'],
        default: 'active',
    },
    archivedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

// Add indexes for better query performance
sampleSchema.index({ setupType: 1, gender: 1 });
sampleSchema.index({ featured: 1 });
sampleSchema.index({ createdAt: -1 });

// Virtual for primary image
sampleSchema.virtual('primaryImage').get(function() {
    if (this.images && this.images.length > 0) {
        const primary = this.images.find(img => img.isPrimary);
        return primary ? primary.url : this.images[0].url;
    }
    return null;
});

// Virtual for image count
sampleSchema.virtual('imageCount').get(function() {
    return this.images ? this.images.length : 0;
});

// Ensure virtuals are included in JSON output
sampleSchema.set('toJSON', { virtuals: true });
sampleSchema.set('toObject', { virtuals: true });

const Sample = mongoose.model('Sample', sampleSchema);
export default Sample;