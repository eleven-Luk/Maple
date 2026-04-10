import React, { useState } from 'react';
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
    faCamera,
    faMoneyBillWave,
    faImage,
    faSun,
    faCloudSun,
    faDownload,
    faTimes,
    faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons';
import ViewModal from '../../common/ViewModal';

function ViewModalApp({ isOpen, onClose, appointment }) {
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [receiptImageError, setReceiptImageError] = useState(false);

    if (!appointment) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPackageType = (type) => {
        const typeMap = {
            'newborn': 'Newborn Session',
            'maternity': 'Maternity Session'
        };
        return typeMap[type?.toLowerCase()] || type || 'N/A';
    };

    const formatPaymentMethod = (method) => {
        const methods = {
            'bank': 'Bank Transfer',
            'gcash': 'GCash',
            'none': 'Not Specified'
        };
        return methods[method] || method || 'Not Specified';
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

    const getSessionInfo = (sessionType) => {
        if (sessionType === 'morning') {
            return {
                label: 'Morning Session (10:00 AM - 12:00 PM)',
                icon: faSun,
                color: 'text-orange-500',
                bgColor: 'bg-orange-50',
                borderColor: 'border-orange-200'
            };
        } else if (sessionType === 'afternoon') {
            return {
                label: 'Afternoon Session (3:00 PM - 5:00 PM)',
                icon: faCloudSun,
                color: 'text-blue-500',
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-200'
            };
        }
        return {
            label: 'Not Specified',
            icon: faClock,
            color: 'text-gray-400',
            bgColor: 'bg-gray-50',
            borderColor: 'border-gray-200'
        };
    };

    const statusConfig = getStatusConfig(appointment.status);
    const packageDisplay = formatPackageType(appointment.packageType);
    const sessionInfo = getSessionInfo(appointment.sessionType);
    const paymentMethodDisplay = formatPaymentMethod(appointment.paymentMethod);

    // Get receipt URL
    const receiptUrl = appointment.receiptUrl 
        ? `http://localhost:5000${appointment.receiptUrl}`
        : null;

    // Handle receipt download
    const handleDownloadReceipt = async () => {
        if (!receiptUrl) return;
        
        try {
            const response = await fetch(receiptUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `receipt-${appointment.name.replace(/\s/g, '-')}-${appointment.preferredDate}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading receipt:', error);
            alert('Failed to download receipt. Please try again.');
        }
    };

    // Get file extension for display
    const getFileExtension = (url) => {
        if (!url) return 'image';
        const extension = url.split('.').pop().toLowerCase();
        if (extension === 'pdf') return 'PDF';
        if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension)) return 'Image';
        return 'File';
    };

    // Receipt Modal Component
    const ReceiptViewModal = () => {
        if (!showReceiptModal) return null;
        
        const fileType = getFileExtension(receiptUrl);
        const isPDF = receiptUrl?.toLowerCase().endsWith('.pdf');
        
        return (
            <div className="fixed inset-0 z-[60] overflow-y-auto">
                <div className="fixed inset-0 bg-black/75 transition-opacity" onClick={() => setShowReceiptModal(false)}></div>
                
                <div className="flex min-h-full items-center justify-center p-4">
                    <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FontAwesomeIcon icon={faImage} className="text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Payment Receipt</h3>
                                    <p className="text-xs text-gray-500">
                                        {appointment.name} - {formatDate(appointment.preferredDate)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleDownloadReceipt}
                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                >
                                    <FontAwesomeIcon icon={faDownload} />
                                    Download
                                </button>
                                <button
                                    onClick={() => setShowReceiptModal(false)}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <FontAwesomeIcon icon={faTimes} className="text-gray-500" />
                                </button>
                            </div>
                        </div>
                        
                        {/* Modal Body */}
                        <div className="p-6 max-h-[80vh] overflow-y-auto">
                            {isPDF ? (
                                <iframe
                                    src={`${receiptUrl}#toolbar=0`}
                                    className="w-full h-[70vh] rounded-lg border border-gray-200"
                                    title="Payment Receipt"
                                />
                            ) : (
                                <div className="flex justify-center items-center min-h-[400px] bg-gray-50 rounded-lg">
                                    <img
                                        src={receiptUrl}
                                        alt="Payment Receipt"
                                        className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                                        onError={() => setReceiptImageError(true)}
                                    />
                                </div>
                            )}
                            
                            {receiptImageError && !isPDF && (
                                <div className="text-center p-8 bg-red-50 rounded-lg">
                                    <FontAwesomeIcon icon={faTimes} className="text-red-500 text-4xl mb-2" />
                                    <p className="text-red-600">Failed to load receipt image</p>
                                    <button
                                        onClick={handleDownloadReceipt}
                                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
                                    >
                                        Download Receipt
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {/* Modal Footer */}
                        <div className="p-5 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>File type: {fileType}</span>
                                <span>Uploaded: {formatDateTime(appointment.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
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
                                    <p className="text-xs text-gray-500 mb-1">Session Type</p>
                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${sessionInfo.bgColor} ${sessionInfo.borderColor} border`}>
                                        <FontAwesomeIcon icon={sessionInfo.icon} className={sessionInfo.color} />
                                        <span className="font-semibold text-gray-900 text-sm">{sessionInfo.label}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Preferred Date</p>
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 text-xs" />
                                        <p className="font-semibold text-gray-900">{formatDate(appointment.preferredDate)}</p>
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

                    {/* Payment Information Card - Simplified */}
                    <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                        <div className="p-5">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <FontAwesomeIcon icon={faMoneyBillWave} className="text-gray-500" />
                                Payment Information
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-3 bg-white rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                                    <p className="font-medium text-gray-900 capitalize">{paymentMethodDisplay}</p>
                                </div>
                                {receiptUrl && (
                                    <div className="md:col-span-2 p-3 bg-white rounded-lg">
                                        <p className="text-xs text-gray-500 mb-2">Payment Receipt</p>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <button
                                                onClick={() => setShowReceiptModal(true)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                            >
                                                <FontAwesomeIcon icon={faImage} />
                                                View Receipt
                                            </button>
                                            <button
                                                onClick={handleDownloadReceipt}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                                            >
                                                <FontAwesomeIcon icon={faDownload} />
                                                Download Receipt
                                            </button>
                                            <a
                                                href={receiptUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                                            >
                                                <FontAwesomeIcon icon={faExternalLinkAlt} />
                                                Open in New Tab
                                            </a>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">
                                            File type: {getFileExtension(receiptUrl)} • Click to view or download
                                        </p>
                                    </div>
                                )}
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
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-3 bg-white rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">Created</p>
                                    <p className="font-medium text-gray-900">{formatDateTime(appointment.createdAt)}</p>
                                </div>
                                {appointment.updatedAt && appointment.updatedAt !== appointment.createdAt && (
                                    <div className="p-3 bg-white rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                                        <p className="font-medium text-gray-900">{formatDateTime(appointment.updatedAt)}</p>
                                    </div>
                                )}
                                {appointment.rescheduledDate && (
                                    <div className="p-3 bg-white rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Rescheduled Date</p>
                                        <p className="font-medium text-gray-900">{formatDateTime(appointment.rescheduledDate)}</p>
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
            
            {/* Receipt View Modal */}
            <ReceiptViewModal />
        </>
    );
}

export default ViewModalApp;