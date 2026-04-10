import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faEye,
    faTrash,
    faMapMarkerAlt,
    faClock,
    faBriefcase,
    faDollarSign,
    faBan,
    faUndo,
    faArchive,
    faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';

function ArchivedJobCard({ job, onView, onRestore, onDelete }) {     

    const handleView = (e) => {
        e.stopPropagation();
        if (onView) {
            onView(job);
        }
    };

    const handleRestore = (e) => {
        e.stopPropagation();
        if (onRestore) {
            onRestore(job);
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (onDelete) {
            onDelete(job);
        }
    };

    // Format salary display
    const formatSalary = (salary) => {
        if (!salary) return 'Salary not specified';
        return salary;
    };

    // Format date
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

    const formatArchivedDate = (date) => {
        if (!date) return 'Recently';
        return new Date(date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatJobType = (type) => {
        if (!type) return '';
        
        if (type.includes('-') || type === 'Contract' || type === 'Internship') {
            return type;
        }
        
        const typeMap = {
            'fulltime': 'Full-Time',
            'parttime': 'Part-Time',
            'contract': 'Contract',
            'internship': 'Internship'
        };
        return typeMap[type.toLowerCase()] || type;
    };

    return (
        <div 
            className="bg-white border border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden opacity-90"
        >
            <div className="p-6">
                {/* Header with title and type */}
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-medium text-gray-800 line-clamp-1 flex-1">
                        {job.name || 'Untitled Position'}
                    </h3>
                    <div className="flex gap-2 ml-2">
                        <span className="text-xs px-3 py-1 bg-orange-50 text-orange-600 rounded-full whitespace-nowrap">
                            {formatJobType(job.type)}
                        </span>
                        {/* Archived Badge */}
                        <span className="text-xs px-3 py-1 rounded-full whitespace-nowrap flex items-center gap-1 bg-gray-100 text-gray-600">
                            <FontAwesomeIcon icon={faArchive} className="text-xs" />
                            Archived
                        </span>
                    </div>
                </div>

                {/* Quick info row - 3 items */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-orange-400" />
                        {job.location || 'Remote'}
                    </span>
                    <span className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faClock} className="text-orange-400" />
                        Posted: {formatDate(job.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faBriefcase} className="text-orange-400" />
                        ID: #{job._id?.slice(-4)}
                    </span>
                </div>

                {/* Archived Date */}
                {job.archivedAt && (
                    <div className="mb-3">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
                            Archived: {formatArchivedDate(job.archivedAt)}
                        </span>
                    </div>
                )}

                {/* Salary highlight */}
                <div className="mb-4">
                    <span className="text-lg font-light text-orange-600 bg-orange-50 px-4 py-1.5 rounded-full inline-block">
                        <FontAwesomeIcon icon={faDollarSign} className="text-sm mr-1" />
                        {formatSalary(job.salary)}
                    </span>
                </div>

                {/* Description - 2 lines max */}
                <p className="text-sm text-gray-600 line-clamp-5 mb-4 border-t border-gray-100 pt-4">
                    {job.description || 'No description available'}
                </p>
                
                {/* Action Buttons - Only View, Restore, and Delete */}
                <div className="flex flex-row gap-2">
                    <button 
                        onClick={handleView}
                        className="flex-1 py-2.5 text-sm text-gray-500 hover:text-orange-600 border border-gray-200 rounded-lg hover:border-orange-400 transition-all flex items-center justify-center gap-2"
                    >
                        <FontAwesomeIcon icon={faEye} className="text-xs" />
                        View
                    </button>
                    <button 
                        onClick={handleRestore}
                        className="flex-1 py-2.5 text-sm text-gray-500 hover:text-green-600 border border-gray-200 rounded-lg hover:border-green-400 transition-all flex items-center justify-center gap-2"
                    >
                        <FontAwesomeIcon icon={faUndo} className="text-xs" />
                        Restore
                    </button>
                    <button 
                        onClick={handleDelete}
                        className="flex-1 py-2.5 text-sm text-gray-500 hover:text-red-600 border border-gray-200 rounded-lg hover:border-red-400 transition-all flex items-center justify-center gap-2"
                    >
                        <FontAwesomeIcon icon={faTrash} className="text-xs" />
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ArchivedJobCard;