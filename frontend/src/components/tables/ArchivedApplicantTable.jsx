import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faEye, 
    faTrashRestore, 
    faSort, 
    faSortUp, 
    faSortDown,
    faBriefcase,
    faUser,
    faTrash
} from '@fortawesome/free-solid-svg-icons';

const ArchivedApplicantTable = ({
    applicants,
    onSort,
    sortConfig,
    getSortIcon,
    onView,
    onRestore,
    onDelete,
    restoringId,
    updatingId,
    StatusBadge,
    currentPage = 1,
    itemsPerPage = 10,
    isSelectMode = false,
    selectedApplications = [],
    onSelectApplication,
    onSelectAll
}) => {
    if (applicants.length === 0) {
        return (
            <div className="bg-white border border-gray-200 p-8 sm:p-16 text-center">
                <FontAwesomeIcon icon={faBriefcase} className="text-3xl sm:text-5xl text-gray-200 mb-3 sm:mb-4" />
                <p className="text-gray-500 font-light text-sm sm:text-base mb-2">No archived applicants found</p>
                <p className="text-xs sm:text-sm text-gray-400 font-light">
                    Archived applications will appear here
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
    const allSelected = applicants.length > 0 && selectedApplications.length === applicants.length;

    return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
            <table className="min-w-[800px] lg:min-w-full w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {isSelectMode && (
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={(e) => onSelectAll && onSelectAll(e.target.checked ? applicants.map(a => a._id) : [])}
                                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-400 w-3.5 h-3.5 sm:w-4 sm:h-4"
                                />
                            </th>
                        )}
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => onSort('name')}>
                            <div className="flex items-center gap-1 sm:gap-2">
                                Applicant
                                <FontAwesomeIcon icon={getSortIcon('name')} className="text-gray-400 text-xs" />
                            </div>
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Details</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => onSort('status')}>
                            <div className="flex items-center gap-1 sm:gap-2">
                                Status
                                <FontAwesomeIcon icon={getSortIcon('status')} className="text-gray-400 text-xs" />
                            </div>
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => onSort('deletedAt')}>
                            <div className="flex items-center gap-1 sm:gap-2">
                                Archived Date
                                <FontAwesomeIcon icon={getSortIcon('deletedAt')} className="text-gray-400 text-xs" />
                            </div>
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {applicants.map((applicant, index) => (
                        <tr key={applicant._id} className="hover:bg-gray-50 transition-colors">
                            {isSelectMode && (
                                <td className="px-3 sm:px-6 py-3 sm:py-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedApplications.includes(applicant._id)}
                                        onChange={() => onSelectApplication && onSelectApplication(applicant._id)}
                                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-400 w-3.5 h-3.5 sm:w-4 sm:h-4"
                                    />
                                 </td>
                            )}
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
                                <div>{applicant.archivedAt ? new Date(applicant.archivedAt).toLocaleDateString() : 'N/A'}</div>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                                <div className="flex items-center justify-end gap-1 sm:gap-2">
                                    <button onClick={() => onView(applicant)} className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors" title="View Details">
                                        <FontAwesomeIcon icon={faEye} className="text-xs sm:text-sm" />
                                    </button>
                                    <button onClick={() => onRestore(applicant)} className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors" title="Restore Application" disabled={restoringId === applicant._id}>
                                        <FontAwesomeIcon icon={faTrashRestore} className="text-xs sm:text-sm" />
                                    </button>
                                    <button onClick={() => onDelete && onDelete(applicant)} className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors" title="Delete Application" disabled={updatingId === applicant._id}>
                                        <FontAwesomeIcon icon={faTrash} className="text-xs sm:text-sm" />
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

export default ArchivedApplicantTable;