import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faEye, 
    faEdit, 
    faTrash, 
    faSort, 
    faSortUp, 
    faSortDown,
    faBriefcase,
    faMapMarkerAlt,
    faClock,
    faCalendarAlt,
    faCheckSquare,
    faSquare
} from '@fortawesome/free-solid-svg-icons';

const AppointmentTable = ({ 
    appointments, 
    onSort, 
    sortConfig,
    getSortIcon,
    onView, 
    onEdit, 
    onDelete,
    StatusBadge,
    updatingId,
    currentPage = 1,
    itemsPerPage = 10,
    // New props for bulk delete
    isSelectMode = false,
    selectedAppointments = [],
    onSelectAppointment,
    onSelectAll
}) => {
    if (appointments.length === 0) {
        return (
            <div className="bg-white border border-gray-200 p-16 text-center rounded-lg">
                <FontAwesomeIcon icon={faBriefcase} className="text-5xl text-gray-200 mb-4" />
                <p className="text-gray-500 font-light mb-2">No appointments found</p>
                <p className="text-sm text-gray-400 font-light">
                    Appointments will appear here when clients book a session
                </p>
            </div>
        );
    }

    // Format package type
    const formatPackageType = (type) => {
        const typeMap = {
            'newborn': 'Newborn Session',
            'maternity': 'Maternity Session',
            'family': 'Family Session',
            'milestone': 'Milestone Session',
            'portrait': 'Portrait Session',
            'custom': 'Custom Package',
        };
        return typeMap[type?.toLowerCase()] || type || '';
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getRowNumber = (index) => {
        return (currentPage - 1) * itemsPerPage + index + 1;
    };

    const isAllSelected = appointments.length > 0 && selectedAppointments.length === appointments.length;

    const handleSelectAll = () => {
        if (onSelectAll) {
            onSelectAll();
        } else if (onSelectAppointment) {
            // Fallback: select/deselect all one by one
            if (isAllSelected) {
                appointments.forEach(app => onSelectAppointment(app._id));
            } else {
                appointments.forEach(app => onSelectAppointment(app._id));
            }
        }
    };

    return (
        <div className='bg-white border border-gray-200 rounded-lg overflow-hidden overflow-x-auto'>
            <table className='min-w-full w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                    <tr>
                        {/* Selection Checkbox Column */}
                        {isSelectMode && (
                            <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={handleSelectAll}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                />
                            </th>
                        )}
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            #
                        </th>
                        <th 
                            className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100'
                            onClick={() => onSort && onSort('name')}
                        >
                            <div className="flex items-center gap-2">
                                Client
                                {getSortIcon && getSortIcon('name') && (
                                    <FontAwesomeIcon icon={getSortIcon('name')} className="text-gray-400" />
                                )}
                            </div>
                        </th>
                        <th 
                            className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100'
                            onClick={() => onSort && onSort('email')}
                        >
                            <div className="flex items-center gap-2">
                                Contact
                                {getSortIcon && getSortIcon('email') && (
                                    <FontAwesomeIcon icon={getSortIcon('email')} className="text-gray-400" />
                                )}
                            </div>
                        </th>
                        <th 
                            className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100'
                            onClick={() => onSort && onSort('packageType')}
                        >
                            <div className="flex items-center gap-2">
                                Package
                                {getSortIcon && getSortIcon('packageType') && (
                                    <FontAwesomeIcon icon={getSortIcon('packageType')} className="text-gray-400" />
                                )}
                            </div>
                        </th>
                        <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => onSort && onSort('status')}
                        >
                            <div className="flex items-center gap-2">
                                Status
                                {getSortIcon && getSortIcon('status') && (
                                    <FontAwesomeIcon icon={getSortIcon('status')} className="text-gray-400" />
                                )}
                            </div>
                        </th>
                        <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => onSort && onSort('preferredDate')}
                        >
                            <div className="flex items-center gap-2">
                                Schedule
                                {getSortIcon && getSortIcon('preferredDate') && (
                                    <FontAwesomeIcon icon={getSortIcon('preferredDate')} className="text-gray-400" />
                                )}
                            </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Location
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                    {appointments.map((appointment, index) => (
                        <tr key={appointment._id} className="hover:bg-gray-50 transition-colors">
                            {/* Selection Checkbox */}
                            {isSelectMode && (
                                <td className="px-4 py-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedAppointments.includes(appointment._id)}
                                        onChange={() => onSelectAppointment && onSelectAppointment(appointment._id)}
                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                    />
                                </td>
                            )}
                            
                            {/* Row Number */}
                            <td className="px-6 py-4 text-sm text-gray-500">
                                {getRowNumber(index)}
                            </td>

                            {/* Client Name */}
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                        <span className="text-gray-600 font-medium">
                                            {appointment.name?.charAt(0).toUpperCase() || '?'}
                                        </span>
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {appointment.name}
                                        </div>
                                    </div>
                                </div>
                            </td>

                            {/* Contact Info */}
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">{appointment.email}</div>
                                <div className="text-sm text-gray-500">{appointment.phone}</div>
                            </td>

                            {/* Package Type */}
                            <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">
                                    {formatPackageType(appointment.packageType)}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {appointment.durationHours} hour session
                                </div>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4">
                                <StatusBadge status={appointment.status} />
                                {appointment.notes && (
                                    <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                                        📝 {appointment.notes}
                                    </div>
                                )}
                            </td>

                            {/* Schedule */}
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-1 text-sm text-gray-700">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 text-xs" />
                                    <span>{formatDate(appointment.preferredDate)}</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                    <FontAwesomeIcon icon={faClock} className="text-gray-400 text-xs" />
                                    <span>{appointment.preferredTime}</span>
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                    Booked: {formatDate(appointment.createdAt)}
                                </div>
                            </td>

                            {/* Location */}
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400 text-xs" />
                                    <span className="truncate max-w-xs">{appointment.location}</span>
                                </div>
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => onView && onView(appointment)}
                                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                                        title="View Details"
                                    >
                                        <FontAwesomeIcon icon={faEye} />
                                    </button>
                                    <button
                                        onClick={() => onEdit && onEdit(appointment)}
                                        className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"
                                        title="Edit Status"
                                        disabled={updatingId === appointment._id}
                                    >
                                        <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                    <button
                                        onClick={() => onDelete && onDelete(appointment)}
                                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                                        title="Delete"
                                        disabled={updatingId === appointment._id}
                                    >   
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                    {updatingId === appointment._id && (
                                        <span className="text-xs text-blue-500 animate-pulse">Updating...</span>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {/* Selection Info Footer */}
            {isSelectMode && selectedAppointments.length > 0 && (
                <div className="px-6 py-3 bg-blue-50 border-t border-blue-200">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-blue-700">
                            <FontAwesomeIcon icon={faCheckSquare} className="mr-2" />
                            {selectedAppointments.length} appointment(s) selected
                        </div>
                        <button
                            onClick={() => {
                                if (onSelectAll) {
                                    onSelectAll();
                                } else if (onSelectAppointment) {
                                    appointments.forEach(app => onSelectAppointment(app._id));
                                }
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                            {isAllSelected ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentTable;