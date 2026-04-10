import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faEye,
    faEdit,
    faTrash,
    faMapMarkerAlt,
    faClock,
    faBriefcase,
    faDollarSign,
    faCheckCircle,
    faBan,
    faHourglassHalf,
    faArchive,
} from '@fortawesome/free-solid-svg-icons';

function JobCard ({job, onView, onEdit, onArchive}) {     
    const handleView = (e) => { e.stopPropagation(); if (onView) onView(job); };
    const handleEdit = (e) => { e.stopPropagation(); if (onEdit) onEdit(job); };
    const handleArchive = (e) => { e.stopPropagation(); if (onArchive) onArchive(job); };

    const formatSalary = (salary) => salary || 'Salary not specified';
    const formatDate = (date) => {
        if (!date) return 'Recently';
        const now = new Date();
        const posted = new Date(date);
        const diffDays = Math.floor((now - posted) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return posted.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    const formatJobType = (type) => {
        if (!type) return '';
        if (type.includes('-') || type === 'Contract' || type === 'Internship') return type;
        const typeMap = { 'fulltime': 'Full-Time', 'parttime': 'Part-Time', 'contract': 'Contract', 'internship': 'Internship' };
        return typeMap[type.toLowerCase()] || type;
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            active: { color: 'bg-green-100 text-green-800', icon: faCheckCircle, label: 'Active' },
            inactive: { color: 'bg-yellow-100 text-yellow-800', icon: faHourglassHalf, label: 'Inactive' },
            deleted: { color: 'bg-red-100 text-red-800', icon: faBan, label: 'Deleted' },
            closed: { color: 'bg-gray-100 text-gray-800', icon: faBan, label: 'Closed' },
            archived: { color: 'bg-gray-100 text-gray-800', icon: faBan, label: 'Archived' }
        };
        return statusConfig[status?.toLowerCase()] || statusConfig.active;
    };

    const statusConfig = getStatusBadge(job.status);

    return (
        <div className="bg-white border border-gray-200 hover:border-orange-400 hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden cursor-pointer">
            <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                    <h3 className="text-base sm:text-lg md:text-xl font-medium text-gray-800 line-clamp-2 flex-1">
                        {job.name || 'Untitled Position'}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        <span className="text-xs px-2 sm:px-3 py-1 bg-orange-50 text-orange-600 rounded-full whitespace-nowrap">
                            {formatJobType(job.type)}
                        </span>
                        <span className={`text-xs px-2 sm:px-3 py-1 rounded-full whitespace-nowrap flex items-center gap-1 ${statusConfig.color}`}>
                            <FontAwesomeIcon icon={statusConfig.icon} className="text-xs" />
                            {statusConfig.label}
                        </span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                    <span className="flex items-center gap-1"><FontAwesomeIcon icon={faMapMarkerAlt} className="text-orange-400" />{job.location || 'Remote'}</span>
                    <span className="flex items-center gap-1"><FontAwesomeIcon icon={faClock} className="text-orange-400" />{formatDate(job.createdAt)}</span>
                    <span className="flex items-center gap-1"><FontAwesomeIcon icon={faBriefcase} className="text-orange-400" />ID: #{job._id?.slice(-4)}</span>
                </div>

                <div className="mb-3 sm:mb-4">
                    <span className="text-sm sm:text-base md:text-lg font-light text-orange-600 bg-orange-50 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full inline-block">
                        <FontAwesomeIcon icon={faDollarSign} className="text-xs sm:text-sm mr-1" />
                        {formatSalary(job.salary)}
                    </span>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 mb-3 sm:mb-4 border-t border-gray-100 pt-3 sm:pt-4">
                    {job.description || 'No description available'}
                </p>
                
                <div className="flex flex-row gap-2">
                    <button onClick={handleView} className="flex-1 py-2 text-xs sm:text-sm text-gray-500 hover:text-orange-600 border border-gray-200 rounded-lg hover:border-orange-400 transition-all flex items-center justify-center gap-2">
                        <FontAwesomeIcon icon={faEye} className="text-xs" /> View
                    </button>
                    <button onClick={handleEdit} className="flex-1 py-2 text-xs sm:text-sm text-gray-500 hover:text-blue-600 border border-gray-200 rounded-lg hover:border-blue-400 transition-all flex items-center justify-center gap-2">
                        <FontAwesomeIcon icon={faEdit} className="text-xs" /> Edit
                    </button>
                    <button onClick={handleArchive} className="flex-1 py-2 text-xs sm:text-sm text-gray-500 hover:text-gray-600 border border-gray-200 rounded-lg hover:border-gray-400 transition-all flex items-center justify-center gap-2">
                        <FontAwesomeIcon icon={faArchive} className="text-xs" /> Archive
                    </button>
                </div>
            </div>
        </div>
    );
}

export default JobCard;