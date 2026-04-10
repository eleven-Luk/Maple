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
    faSquare,
    faSun,
    faCloudSun,
    faMoneyBillWave,
    faImage,
    faUser,
    faEnvelope,
    faPhone
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
            'maternity': 'Maternity Session'
        };
        return typeMap[type?.toLowerCase()] || type || 'N/A';
    };

    // Format session type
    const formatSessionType = (sessionType) => {
        if (sessionType === 'morning') {
            return { label: 'Morning (10AM-12PM)', icon: faSun, color: 'text-orange-500' };
        } else if (sessionType === 'afternoon') {
            return { label: 'Afternoon (3PM-5PM)', icon: faCloudSun, color: 'text-blue-500' };
        }
        return { label: 'N/A', icon: faClock, color: 'text-gray-400' };
    };

    // Format payment method
    const formatPaymentMethod = (method) => {
        const methods = {
            'bank': 'Bank Transfer',
            'gcash': 'GCash',
            'none': 'Not Specified'
        };
        return methods[method] || method || 'Not Specified';
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
            if (isAllSelected) {
                appointments.forEach(app => onSelectAppointment(app._id));
            } else {
                appointments.forEach(app => onSelectAppointment(app._id));
            }
        }
    };

    return (
        <div className='bg-white border border-gray-200 rounded-lg overflow-hidden overflow-x-auto w-full'>
            <table className='min-w-[1400px] w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                    <tr>
                        {/* Selection Checkbox Column */}
                        {isSelectMode && (
                            <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12'>
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={handleSelectAll}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                />
                            </th>
                        )}
                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12'>
                            #
                        </th>
                        <th 
                            className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-[200px]'
                            onClick={() => onSort && onSort('name')}
                        >
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                                Client
                                {getSortIcon && getSortIcon('name') && (
                                    <FontAwesomeIcon icon={getSortIcon('name')} className="text-gray-400" />
                                )}
                            </div>
                        </th>
                        <th 
                            className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-[250px]'
                            onClick={() => onSort && onSort('email')}
                        >
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                                Contact
                                {getSortIcon && getSortIcon('email') && (
                                    <FontAwesomeIcon icon={getSortIcon('email')} className="text-gray-400" />
                                )}
                            </div>
                        </th>
                        <th 
                            className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-[150px]'
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
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-[180px]"
                            onClick={() => onSort && onSort('sessionType')}
                        >
                            <div className="flex items-center gap-2">
                                Session
                                {getSortIcon && getSortIcon('sessionType') && (
                                    <FontAwesomeIcon icon={getSortIcon('sessionType')} className="text-gray-400" />
                                )}
                            </div>
                        </th>
                        <th 
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-[120px]"
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
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-[180px]"
                            onClick={() => onSort && onSort('preferredDate')}
                        >
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
                                Schedule
                                {getSortIcon && getSortIcon('preferredDate') && (
                                    <FontAwesomeIcon icon={getSortIcon('preferredDate')} className="text-gray-400" />
                                )}
                            </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[250px]">
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400" />
                                Location
                            </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faMoneyBillWave} className="text-gray-400" />
                                Payment
                            </div>
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                    {appointments.map((appointment, index) => {
                        const sessionInfo = formatSessionType(appointment.sessionType);
                        const hasReceipt = appointment.receiptUrl && appointment.receiptUrl !== null;
                        
                        return (
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
                                <td className="px-4 py-4 text-sm text-gray-500">
                                    {getRowNumber(index)}
                                </td>

                                {/* Client Name */}
                                <td className="px-4 py-4">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                            <span className="text-gray-600 font-medium">
                                                {appointment.name?.charAt(0).toUpperCase() || '?'}
                                            </span>
                                        </div>
                                        <div className="ml-3">
                                            <div className="text-sm font-medium text-gray-900">
                                                {appointment.name}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Contact Info */}
                                <td className="px-4 py-4">
                                    <div className="text-sm text-gray-900 break-all">{appointment.email}</div>
                                    <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                        <FontAwesomeIcon icon={faPhone} className="text-gray-400 text-xs" />
                                        {appointment.phone}
                                    </div>
                                </td>

                                {/* Package Type */}
                                <td className="px-4 py-4">
                                    <div className="text-sm font-medium text-gray-900">
                                        {formatPackageType(appointment.packageType)}
                                    </div>
                                </td>

                                {/* Session Type */}
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={sessionInfo.icon} className={sessionInfo.color} />
                                        <span className="text-sm text-gray-700">{sessionInfo.label}</span>
                                    </div>
                                </td>

                                {/* Status */}
                                <td className="px-4 py-4">
                                    <StatusBadge status={appointment.status} />
                                    {appointment.notes && (
                                        <div className="text-xs text-gray-500 mt-1 truncate max-w-[150px]" title={appointment.notes}>
                                            📝 {appointment.notes.length > 30 ? appointment.notes.substring(0, 30) + '...' : appointment.notes}
                                        </div>
                                    )}
                                </td>

                                {/* Schedule */}
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-1 text-sm text-gray-700">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 text-xs" />
                                        <span className="font-medium">{formatDate(appointment.preferredDate)}</span>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        Booked: {formatDate(appointment.createdAt)}
                                    </div>
                                    {appointment.rescheduledDate && (
                                        <div className="text-xs text-purple-500 mt-1 flex items-center gap-1">
                                            <span>🔄</span>
                                            Rescheduled: {formatDate(appointment.rescheduledDate)}
                                        </div>
                                    )}
                                </td>

                                {/* Location */}
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400 text-xs flex-shrink-0" />
                                        <span className="break-words line-clamp-2">{appointment.location}</span>
                                    </div>
                                </td>

                                {/* Payment Info */}
                                <td className="px-4 py-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1 text-xs text-gray-600">
                                            <FontAwesomeIcon icon={faMoneyBillWave} className="text-gray-400" />
                                            <span className="font-medium">{formatPaymentMethod(appointment.paymentMethod)}</span>
                                        </div>
                                        {hasReceipt && (
                                            <div className="flex items-center gap-1 text-xs text-blue-600">
                                                <FontAwesomeIcon icon={faImage} className="text-blue-400" />
                                                <span>Receipt uploaded</span>
                                            </div>
                                        )}
                                    </div>
                                </td>

                                {/* Actions */}
                                <td className="px-4 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => onView && onView(appointment)}
                                            className="text-blue-600 hover:text-blue-900 p-1.5 hover:bg-blue-50 rounded transition-colors"
                                            title="View Details"
                                        >
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>
                                        <button
                                            onClick={() => onEdit && onEdit(appointment)}
                                            className="text-green-600 hover:text-green-900 p-1.5 hover:bg-green-50 rounded transition-colors"
                                            title="Edit Status"
                                            disabled={updatingId === appointment._id}
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        <button
                                            onClick={() => onDelete && onDelete(appointment)}
                                            className="text-red-600 hover:text-red-900 p-1.5 hover:bg-red-50 rounded transition-colors"
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
                        );
                    })}
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