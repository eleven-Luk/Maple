import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faEye, 
    faEdit, 
    faArchive, 
    faSort, 
    faSortUp, 
    faSortDown,
    faBriefcase
} from '@fortawesome/free-solid-svg-icons';

const ApplicantTable = ({
    applicants,
    onSort,
    sortConfig,
    getSortIcon,
    onView,
    onEdit,
    onArchive,
    updatingId,
    StatusBadge,
    currentPage = 1,
    itemsPerPage = 10
}) => {
    if (applicants.length === 0) {
        return (
            <div className="bg-white border border-gray-200 p-8 sm:p-16 text-center">
                <FontAwesomeIcon icon={faBriefcase} className="text-3xl sm:text-5xl text-gray-200 mb-3 sm:mb-4" />
                <p className="text-gray-500 font-light text-sm sm:text-base mb-2">No applicants found</p>
                <p className="text-xs sm:text-sm text-gray-400 font-light">
                    Applications will appear here when candidates apply
                </p>
            </div>
        );
    }

    const formatJobType = (type) => {
        const typeMap = {
            'fulltime': 'Full-Time', 'parttime': 'Part-Time', 'contract': 'Contract',
            'internship': 'Internship', 'Full-Time': 'Full-Time', 'Part-Time': 'Part-Time',
            'Contract': 'Contract', 'Internship': 'Internship'
        };
        return typeMap[type?.toLowerCase()] || type || '';
    };

    const getRowNumber = (index) => (currentPage - 1) * itemsPerPage + index + 1;

    return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
            <table className="min-w-[800px] lg:min-w-full w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => onSort && onSort('name')}>
                            <div className="flex items-center gap-1 sm:gap-2">
                                Applicant
                                {getSortIcon && getSortIcon('name') && <FontAwesomeIcon icon={getSortIcon('name')} className="text-gray-400 text-xs" />}
                            </div>
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => onSort && onSort('email')}>
                            <div className="flex items-center gap-1 sm:gap-2">
                                Contact
                                {getSortIcon && getSortIcon('email') && <FontAwesomeIcon icon={getSortIcon('email')} className="text-gray-400 text-xs" />}
                            </div>
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Details</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => onSort && onSort('status')}>
                            <div className="flex items-center gap-1 sm:gap-2">
                                Status
                                {getSortIcon && getSortIcon('status') && <FontAwesomeIcon icon={getSortIcon('status')} className="text-gray-400 text-xs" />}
                            </div>
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => onSort && onSort('createdAt')}>
                            <div className="flex items-center gap-1 sm:gap-2">
                                Applied
                                {getSortIcon && getSortIcon('createdAt') && <FontAwesomeIcon icon={getSortIcon('createdAt')} className="text-gray-400 text-xs" />}
                            </div>
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {applicants.map((applicant, index) => (
                        <tr key={applicant._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500">{getRowNumber(index)}</td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 bg-orange-100 rounded-full flex items-center justify-center">
                                        <span className="text-orange-600 font-medium text-xs sm:text-sm">
                                            {applicant.firstName?.[0]}{applicant.lastName?.[0]}
                                        </span>
                                    </div>
                                    <div className="text-xs sm:text-sm font-medium text-gray-900">
                                        {applicant.firstName} {applicant.middleName || ''} {applicant.lastName}
                                    </div>
                                </div>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                                <div className="text-xs sm:text-sm text-gray-900 break-all">{applicant.email}</div>
                                <div className="text-xs text-gray-500">{applicant.phone}</div>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                                <div className="text-xs sm:text-sm text-gray-900">{applicant.jobId?.name || 'N/A'}</div>
                                <div className="text-xs text-gray-500">{formatJobType(applicant.jobId?.type)}</div>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                                <StatusBadge status={applicant.status} />
                                {applicant.notes && <div className="text-xs text-gray-500 mt-1 truncate max-w-[150px] sm:max-w-xs">📝 {applicant.notes}</div>}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500">
                                <div>{new Date(applicant.createdAt).toLocaleDateString()}</div>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                                <div className="flex items-center justify-center gap-1 sm:gap-2">
                                    <button onClick={() => onView && onView(applicant)} className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors" title="View Details">
                                        <FontAwesomeIcon icon={faEye} className="text-xs sm:text-sm" />
                                    </button>
                                    <button onClick={() => onEdit && onEdit(applicant)} className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors" title="Edit Status">
                                        <FontAwesomeIcon icon={faEdit} className="text-xs sm:text-sm" />
                                    </button>
                                    <button onClick={() => onArchive && onArchive(applicant)} className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-50 rounded transition-colors disabled:opacity-50" title="Move to Archive" disabled={updatingId === applicant._id}>
                                        <FontAwesomeIcon icon={faArchive} className="text-xs sm:text-sm" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ApplicantTable;