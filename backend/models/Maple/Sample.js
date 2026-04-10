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
    category: {
        type: String,
        enum: ['newborn', 'maternity', 'family', 'toddler', 'milestone', 'wedding'],
        required: true,
    },
    subCategory: {
        type: String,
        required: true,
        trim: true,
    },
    image: {
        type: String,
        required: [true, 'Image is required'],
    },
    location: {
        type: String,
        required: true,
        trim: true,
    },
    date: {
        type: String,
        required: true,
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

// Add indexes
sampleSchema.index({ category: 1 });
sampleSchema.index({ featured: 1 });
sampleSchema.index({ createdAt: -1 });

const Sample = mongoose.model('Sample', sampleSchema);
export default Sample;