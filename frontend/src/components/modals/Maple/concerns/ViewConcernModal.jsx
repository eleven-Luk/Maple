import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUser,
    faEnvelope,
    faPhone,
    faFileAlt,
    faComment,
    faClock,
    faCheckCircle,
    faTimesCircle,
    faEye,
    faFlag,
    faExclamationTriangle,
    faTag,
    faCalendarAlt,
    faArrowLeft,
    faReply,
    faPrint
} from '@fortawesome/free-solid-svg-icons';
import FormModal from '../../common/FormModal';

function ViewConcernModal({ isOpen, onClose, concern }) {
    if (!concern) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusConfig = (status) => {
        const configs = {
            pending: {
                color: 'bg-amber-50 text-amber-700 border-amber-200',
                icon: faClock,
                label: 'Pending',
                bgLight: 'bg-amber-50'
            },
            reviewed: {
                color: 'bg-blue-50 text-blue-700 border-blue-200',
                icon: faEye,
                label: 'Reviewed',
                bgLight: 'bg-blue-50'
            },
            resolved: {
                color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                icon: faCheckCircle,
                label: 'Resolved',
                bgLight: 'bg-emerald-50'
            },
            rejected: {
                color: 'bg-rose-50 text-rose-700 border-rose-200',
                icon: faTimesCircle,
                label: 'Rejected',
                bgLight: 'bg-rose-50'
            }
        };
        return configs[status] || configs.pending;
    };

    const getPriorityConfig = (priority) => {
        const configs = {
            high: {
                color: 'text-rose-600 bg-rose-50',
                icon: faExclamationTriangle,
                label: 'High Priority',
                border: 'border-rose-200',
                bgLight: 'bg-rose-50'
            },
            medium: {
                color: 'text-amber-600 bg-amber-50',
                icon: faFlag,
                label: 'Medium Priority',
                border: 'border-amber-200',
                bgLight: 'bg-amber-50'
            },
            low: {
                color: 'text-emerald-600 bg-emerald-50',
                icon: faTag,
                label: 'Low Priority',
                border: 'border-emerald-200',
                bgLight: 'bg-emerald-50'
            }
        };
        return configs[priority] || configs.medium;
    };

    const getInquiryTypeLabel = (type) => {
        const types = {
            'general': 'General Inquiry',
            'employer-partnership': 'Employer Partnership Request',
            'package-information': 'Package Information',
            'others': 'Others'
        };
        return types[type] || type || 'N/A';
    };

    const statusConfig = getStatusConfig(concern.status);
    const priorityConfig = getPriorityConfig(concern.priority || 'medium');

    return (
        <FormModal
            isOpen={isOpen}
            onClose={onClose}
            title="Concern Details"
            subtitle={`Reference: ${concern.reference || concern._id?.slice(-6) || 'N/A'}`}
            maxWidth="max-w-3xl"
            icon={faFileAlt}
            iconColor="text-orange-600"
            showSubmitButton={false}
            showCancelButton={true}
            cancelText="Close"
        >
            {/* Header with Status and Priority */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Card */}
                <div className={`p-4 rounded-xl border ${statusConfig.color}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${statusConfig.bgLight}`}>
                            <FontAwesomeIcon icon={statusConfig.icon} className="text-xl" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Current Status</p>
                            <p className="font-semibold text-gray-900">{statusConfig.label}</p>
                        </div>
                    </div>
                </div>

                {/* Priority Card */}
                <div className={`p-4 rounded-xl border ${priorityConfig.border}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${priorityConfig.bgLight}`}>
                            <FontAwesomeIcon icon={priorityConfig.icon} className={`text-xl ${priorityConfig.color}`} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Priority Level</p>
                            <p className={`font-semibold ${priorityConfig.color}`}>{priorityConfig.label}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Concern Information */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FontAwesomeIcon icon={faUser} className="text-orange-500" />
                    Concern Information
                </h3>
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Full Name</label>
                            <p className="text-gray-900 font-medium">{concern.name || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Email Address</label>
                            <p className="text-gray-900">{concern.email || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Phone Number</label>
                            <p className="text-gray-900">{concern.phone || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Inquiry Type</label>
                            <p className="text-gray-900">{getInquiryTypeLabel(concern.inquiryType)}</p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs text-gray-500 block mb-1">Submitted Date</label>
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 text-xs" />
                                <p className="text-gray-900">{formatDate(concern.createdAt)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Concern Message */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FontAwesomeIcon icon={faComment} className="text-orange-500" />
                    Concern Message
                </h3>
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{concern.message || 'No message provided'}</p>
                </div>
            </div>

            {/* Admin Notes */}
            {concern.notes && (
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <FontAwesomeIcon icon={faReply} className="text-orange-500" />
                        Admin Notes
                    </h3>
                    <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
                        <p className="text-gray-700 whitespace-pre-wrap">{concern.notes}</p>
                        {concern.updatedAt && (
                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                <FontAwesomeIcon icon={faClock} className="text-xs" />
                                Last updated: {formatDate(concern.updatedAt)}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Timeline (Optional) */}
            {concern.createdAt && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faClock} />
                            <span>Created: {formatDate(concern.createdAt)}</span>
                        </div>
                        {concern.updatedAt && concern.updatedAt !== concern.createdAt && (
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faEye} />
                                <span>Last modified: {formatDate(concern.updatedAt)}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </FormModal>
    );
}

export default ViewConcernModal;