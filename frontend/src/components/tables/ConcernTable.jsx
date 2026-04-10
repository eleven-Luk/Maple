import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faEye, 
    faEdit, 
    faTrashAlt,
    faEnvelopesBulk
} from '@fortawesome/free-solid-svg-icons';

const ConcernTable = ({
    concerns,
    onSort,
    getSortIcon,
    onView,
    onEdit,
    onDelete,
    StatusBadge,
    updatingId,
    currentPage = 1,
    itemsPerPage = 10,
    isSelectMode = false,
    selectedConcerns = [],
    onSelectConcern,
    onSelectAll
}) => {
    if (!concerns || concerns.length === 0) {
        return (
            <div className="bg-white border border-gray-200 p-8 sm:p-16 text-center">
                <FontAwesomeIcon icon={faEnvelopesBulk} className="text-3xl sm:text-5xl text-gray-200 mb-3 sm:mb-4" />
                <p className="text-gray-500 font-light text-sm sm:text-base mb-2">No concerns found</p>
                <p className="text-xs sm:text-sm text-gray-400 font-light">
                    Concerns will appear here when someone submits a concern through the application.
                </p>
            </div>
        );
    }

    const formatConcernType = (type) => {
        const typeMap = {
            'general': 'General Inquiry',
            'employer-partnership': 'Employer Partnership',
            'package-information': 'Package Information',
            'others': 'Others'
        };
        return typeMap[type?.toLowerCase()] || type || '';
    };

    const getRowNumber = (index) => (currentPage - 1) * itemsPerPage + index + 1;
    const allSelected = concerns.length > 0 && selectedConcerns.length === concerns.length;

    const getAdditionalInfo = (concern) => {
        if (concern.inquiryType === 'employer-partnership') return concern.companyName ? `Company: ${concern.companyName}` : '';
        if (concern.inquiryType === 'package-information') return concern.packageType ? `Package: ${concern.packageType}` : '';
        return '';
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
            <table className="min-w-[900px] lg:min-w-full w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {isSelectMode && (
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={(e) => onSelectAll && onSelectAll(e.target.checked ? concerns.map(c => c._id) : [])}
                                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-400 w-3.5 h-3.5 sm:w-4 sm:h-4"
                                />
                            </th>
                        )}
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => onSort && onSort('name')}>
                            <div className="flex items-center gap-1 sm:gap-2">
                                Name
                                {getSortIcon && getSortIcon('name') && <FontAwesomeIcon icon={getSortIcon('name')} className="text-gray-400 text-xs" />}
                            </div>
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
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
                                Created At
                                {getSortIcon && getSortIcon('createdAt') && <FontAwesomeIcon icon={getSortIcon('createdAt')} className="text-gray-400 text-xs" />}
                            </div>
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {concerns.map((concern, index) => {
                        const additionalInfo = getAdditionalInfo(concern);
                        return (
                            <tr key={concern._id} className="hover:bg-gray-50 transition-colors">
                                {isSelectMode && (
                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedConcerns.includes(concern._id)}
                                            onChange={() => onSelectConcern && onSelectConcern(concern._id)}
                                            className="rounded border-gray-300 text-orange-500 focus:ring-orange-400 w-3.5 h-3.5 sm:w-4 sm:h-4"
                                        />
                                    </td>
                                )}
                                <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500">{getRowNumber(index)}</td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 bg-orange-100 rounded-full flex items-center justify-center">
                                            <span className="text-orange-600 font-medium text-xs sm:text-sm">{concern.name?.[0]?.toUpperCase() || '?'}</span>
                                        </div>
                                        <div className="text-xs sm:text-sm font-medium text-gray-900">{concern.name}</div>
                                    </div>
                                 </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4">
                                    <div className="text-xs sm:text-sm text-gray-900 break-all">{concern.email}</div>
                                    <div className="text-xs text-gray-500">{concern.phone}</div>
                                    {additionalInfo && <div className="text-xs text-gray-400 mt-1">{additionalInfo}</div>}
                                 </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4">
                                    <div className="text-xs sm:text-sm text-gray-900">{formatConcernType(concern.inquiryType)}</div>
                                    {concern.position && <div className="text-xs text-gray-500 mt-1">Position: {concern.position}</div>}
                                    {concern.packageType && concern.inquiryType === 'package-information' && <div className="text-xs text-gray-500 mt-1">Package: {concern.packageType}</div>}
                                 </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4">
                                    <StatusBadge status={concern.status} />
                                    {concern.notes && <div className="text-xs text-gray-500 mt-1 truncate max-w-[150px] sm:max-w-xs">📝 {concern.notes}</div>}
                                 </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500">
                                    <div>{new Date(concern.createdAt).toLocaleDateString()}</div>
                                 </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                                        <button onClick={() => onView && onView(concern)} className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors" title="View Details">
                                            <FontAwesomeIcon icon={faEye} className="text-xs sm:text-sm" />
                                        </button>
                                        <button onClick={() => onEdit && onEdit(concern)} className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors" title="Edit Status" disabled={updatingId === concern._id}>
                                            <FontAwesomeIcon icon={faEdit} className="text-xs sm:text-sm" />
                                        </button>
                                        <button onClick={() => onDelete && onDelete(concern)} className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors" title="Delete" disabled={updatingId === concern._id}>
                                            <FontAwesomeIcon icon={faTrashAlt} className="text-xs sm:text-sm" />
                                        </button>
                                    </div>
                                 </td>
                             </tr>
                        );
                    })}
                </tbody>
             </table>
        </div>
    );
};

export default ConcernTable;