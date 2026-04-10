import Job from "../../models/NM/Job.js";


// Create job
export const createJob = async (req, res) => {
    try {
        const { name, description, type, salary, location } = req.body;

        // Validation
        if (!name || !description || !type || !salary || !location) {
            return res.status(400).json({
                success: false,
                message: 'Name, Description, Type, Salary, and Location are required'
            });
        }

        // Check for duplicate Job
        const existingJob = await Job.findOne({ name }); 
        if (existingJob) {
            return res.status(400).json({
                success: false,
                message: 'Job with this name already exists'
            });
        }

        const newJob = await Job.create({
            name: name.trim(),
            description: description.trim(),
            type: type.trim(),
            salary: salary.trim(),
            location: location.trim(),
        });

        res.status(201).json({
            success: true,
            message: 'Job posted successfully',
            data: newJob
        })

    } catch (error) {
        console.error('Create Job Error: ', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        if (error.code === 11000){
            return res.status(400).json({
                success: false,
                message: 'Job with this name already exists'
            })
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Update job
export const updateJob = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, type, salary, location, status } = req.body;

        // Find existing job
        const existingJob = await Job.findById(id);
        if (!existingJob) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }


        // Update job data
        const updatedJob = await Job.findByIdAndUpdate(
            id,
            {
                name: name?.trim(),
                description: description?.trim(),
                type: type?.trim(),
                salary: salary?.trim(),
                location: location?.trim(),
                status: status?.trim(),
                updatedAt: new Date(),
            },
            { new: true, runValidators: true } // This returns the updated document
        );

        res.json({
            success: true,
            message: 'Job updated successfully',
            data: updatedJob
        });

    } catch (error) {
        console.error('Update Job Error: ', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors
            });
        }
        
        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Product with this name already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error updating product',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

export const getViewJob = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await Job.findById(id);

        if (!job){
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        res.json({
            success: true,
            message: 'Job found successfully',
            data: job
        })
        
    } catch (error) {
        console.error('Get Job Error: ', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching job',
        })
    }
}


export const getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find({
            status: { $ne: 'archived' }
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: jobs,
            count: jobs.length,
            message: `Found ${jobs.length} active jobs`
        })
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching jobs',
        });
    }
};

export const moveToArchive = async (req, res) => {
    try {
        const { jobId } = req.params;
        
        // Validation
        if (!jobId) {
            return res.status(400).json({
                success: false,
                message: 'Job ID is required'
            });
        }

        const now = new Date();

        const movedJob = await Job.findByIdAndUpdate(
            jobId,
            {
                archivedAt: now,
                status: 'archived'
            },
            { new: true }
        );

        if (!movedJob){
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Job moved to archive successfully',
            data: {
                id: movedJob._id,
                name: movedJob.name,
                status: movedJob.status,
                archivedAt: movedJob.archivedAt,
            }
        });
 } catch (error) {
        console.error('Move to Archive Error: ', error);
        res.status(500).json({
            success: false,
            message: 'Server error moving job to archive',
        });
    }
}

export const getArchivedJobs = async (req, res) => {
    try {
        const archivedJobs = await Job.find({ 
            status: 'archived' })
            .sort({ archivedAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Archived jobs retrieved successfully',
            data: archivedJobs,
            count: archivedJobs.length,
        });

    } catch (error) {
         console.error('Get Archived Jobs Error: ', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
}

export const restoreJob = async (req, res) => {
    try {
        const { jobId } = req.params;

        if (!jobId) {
            return res.status(400).json({
                success: false,
                message: 'Job ID is required'
            });
        }
        
        const restoredJob = await Job.findByIdAndUpdate(
            jobId, {
                $unset: { deletedAt: ''},
                status: 'pending',
            },
            { new: true }
        );
        
        if (!restoredJob) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Job restored successfully',
            data: restoredJob
        });
        
    } catch (error) {
        console.error('Restore Job Error: ', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
}

export const viewArchivedJob = async (req, res) => {
    try {
        const { jobId } = req.params;

        if (!jobId) {
            return res.status(400).json({
                success: false,
                message: 'Job ID is required'
            });
        }

        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        if (job.status !== 'archived') {
            return res.status(400).json({
                success: false,
                message: 'This job is not archived'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Archived job retrieved successfully',
            data: job
        });

    } catch (error) {
        console.error('View Archived Job Error: ', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

export const deleteArchivedJob = async (req, res) => {
    try {
        const { jobId } = req.params;

        const deletedJob = await Job.findByIdAndDelete(jobId);

        if (!deletedJob) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Archived job deleted permanently',    
            data: deletedJob
        });
    } catch (error) {
        console.error('Delete Archived Job Error: ', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
}