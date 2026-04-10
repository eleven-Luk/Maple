// components/modals/Maple/appointments/ViewAppointmentModal.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser,
    faEnvelope,
    faPhone,
    faCalendarAlt,
    faClock,
    faMapMarkerAlt,
    faBox,
    faComment,
    faStickyNote,
    faCamera
} from '@fortawesome/free-solid-svg-icons';
import ViewModal from '../../common/ViewModal';

function ViewModalApp({ isOpen, onClose, appointment }) {
    if (!appointment) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatPackageType = (type) => {
        const typeMap = {
            'newborn': 'Newborn Session',
            'maternity': 'Maternity Session',
            'family': 'Family Session',
            'milestone': 'Milestone Session',
            'portrait': 'Portrait Session',
            'custom': 'Custom Package'
        };
        return typeMap[type?.toLowerCase()] || type || 'N/A';
    };

    const getStatusConfig = (status) => {
        const configs = {
            pending: {
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                label: 'Pending'
            },
            confirmed: {
                color: 'bg-blue-100 text-blue-800 border-blue-200',
                label: 'Confirmed'
            },
            completed: {
                color: 'bg-green-100 text-green-800 border-green-200',
                label: 'Completed'
            },
            cancelled: {
                color: 'bg-red-100 text-red-800 border-red-200',
                label: 'Cancelled'
            },
            rescheduled: {
                color: 'bg-purple-100 text-purple-800 border-purple-200',
                label: 'Rescheduled'
            }
        };
        return configs[status?.toLowerCase()] || configs.pending;
    };

    const statusConfig = getStatusConfig(appointment.status);
    const packageDisplay = formatPackageType(appointment.packageType);

    return (
        <ViewModal
            isOpen={isOpen}
            onClose={onClose}
            title="Appointment Details"
            icon={faCamera}
            iconColor="text-gray-500"
            maxWidth="max-w-3xl"
        >
            <div className="space-y-6">
                {/* Header Card */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-5">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-gray-500 to-gray-700 rounded-2xl flex items-center justify-center shadow-lg">
                                <FontAwesomeIcon icon={faUser} className="text-2xl text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 mb-1">
                                    {appointment.name}
                                </h3>
                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${statusConfig.color}`}>
                                        {statusConfig.label}
                                    </span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="text-xs" />
                                        Booked: {formatDate(appointment.createdAt)}
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                    <div className="flex items-center gap-2 p-2 bg-white/60 rounded-lg">
                                        <FontAwesomeIcon icon={faEnvelope} className="text-gray-500 text-sm" />
                                        <span className="text-sm text-gray-700 truncate">{appointment.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-white/60 rounded-lg">
                                        <FontAwesomeIcon icon={faPhone} className="text-gray-500 text-sm" />
                                        <span className="text-sm text-gray-700">{appointment.phone}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Appointment Details Card */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-5">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <FontAwesomeIcon icon={faCamera} className="text-gray-500" />
                            Session Details
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Package Type</p>
                                <p className="font-semibold text-gray-900">{packageDisplay}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Duration</p>
                                <p className="font-semibold text-gray-900">{appointment.durationHours} hour(s)</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Preferred Date</p>
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 text-xs" />
                                    <p className="font-semibold text-gray-900">{formatDate(appointment.preferredDate)}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Preferred Time</p>
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faClock} className="text-gray-400 text-xs" />
                                    <p className="font-semibold text-gray-900">{appointment.preferredTime}</p>
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-xs text-gray-500 mb-1">Location</p>
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400 text-xs" />
                                    <p className="font-semibold text-gray-900">{appointment.location}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Special Requests Card */}
                {appointment.specialRequests && (
                    <div className="bg-blue-50 rounded-xl border border-blue-200 overflow-hidden">
                        <div className="p-5">
                            <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                <FontAwesomeIcon icon={faComment} className="text-blue-500" />
                                Special Requests
                            </h3>
                            <p className="text-sm text-blue-700 whitespace-pre-wrap">
                                {appointment.specialRequests}
                            </p>
                        </div>
                    </div>
                )}

                {/* Admin Notes Card */}
                {appointment.notes && (
                    <div className="bg-purple-50 rounded-xl border border-purple-200 overflow-hidden">
                        <div className="p-5">
                            <h3 className="text-sm font-semibold text-purple-800 mb-3 flex items-center gap-2">
                                <FontAwesomeIcon icon={faStickyNote} className="text-purple-500" />
                                Admin Notes
                            </h3>
                            <p className="text-sm text-purple-700 whitespace-pre-wrap">
                                {appointment.notes}
                            </p>
                        </div>
                    </div>
                )}

                {/* Date Information Card */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-5">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-500" />
                            Date Information
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 bg-white rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Created</p>
                                <p className="font-medium text-gray-900">{formatDate(appointment.createdAt)}</p>
                            </div>
                            {appointment.updatedAt && appointment.updatedAt !== appointment.createdAt && (
                                <div className="p-3 bg-white rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                                    <p className="font-medium text-gray-900">{formatDate(appointment.updatedAt)}</p>
                                </div>
                            )}
                            {appointment.rescheduledDate && (
                                <div className="p-3 bg-white rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">Rescheduled Date</p>
                                    <p className="font-medium text-gray-900">{formatDate(appointment.rescheduledDate)}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ID for debugging */}
                <div className="text-xs text-gray-400 text-center pt-2">
                    Appointment ID: {appointment._id}
                </div>
            </div>
        </ViewModal>
    );
}

export default ViewModalApp;
