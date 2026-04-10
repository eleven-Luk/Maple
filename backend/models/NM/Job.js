import mongoose from "mongoose";


const jobSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    salary: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'closed', 'archived'],
        default: 'active',
    },
    deletedAt: {
        type: Date,
        default: null,
    },
    archivedAt: {
        type: Date,
        default: null,
    }
}, {
    timestamps: true,
});

const Job = mongoose.model('Job', jobSchema);
export default Job;