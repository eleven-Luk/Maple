import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faExclamationTriangle,
    faTrashAlt,
    faTimes,
    faBan,
    faUser,
    faEnvelope,
    faPhone,
    faFileAlt
} from '@fortawesome/free-solid-svg-icons';

function DeleteConfirmModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    item,
    title = "Delete Concern",
    subtitle = "Are you sure you want to delete this concern?",
    loading = false
}) {
    const [confirmText, setConfirmText] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleConfirm = async () => {
        if (confirmText !== 'DELETE') {
            setError('Please type "DELETE" to confirm');
            return;
        }
        
        setError('');
        try {
            await onConfirm();
            // Reset form after successful deletion
            setConfirmText('');
        } catch (err) {
            setError(err.message || 'Failed to delete concern');
        }
    };

    const handleClose = () => {
        setConfirmText('');
        setError('');
        onClose();
    };

    const getTypeIcon = (type) => {
        const icons = {
            complaint: '⚠️',
            inquiry: '❓',
            suggestion: '💡',
            support: '🛠️',
            general: '📝',
            'employer-partnership': '🤝',
            'package-information': '📦',
            others: '💬'
        };
        return icons[type] || '📋';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all animate-slideUp">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 text-xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={loading}
                    >
                        <FontAwesomeIcon icon={faTimes} className="text-xl" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Warning Message */}
                    <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200">
                        <div className="flex items-start gap-3">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-lg mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-red-800 mb-1">
                                    This action cannot be undone!
                                </p>
                                <p className="text-xs text-red-700">
                                    Deleting this concern will permanently remove all associated data and history.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Item Details */}
                    {item && item._id && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <FontAwesomeIcon icon={faFileAlt} className="text-gray-500" />
                                Concern Details
                            </h3>
                            
                            <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                    <span className="text-lg">{getTypeIcon(item.inquiryType || item.type)}</span>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{item.name || 'Unnamed'}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {item.inquiryType || item.type || 'General'}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                        <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                                        <span className="truncate">{item.email || 'No email'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                        <FontAwesomeIcon icon={faPhone} className="text-gray-400" />
                                        <span>{item.phone || 'No phone'}</span>
                                    </div>
                                </div>
                                
                                {item.status && (
                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-500">Current Status:</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                item.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                                item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                item.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {item.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Show ID for debugging (optional) */}
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                    <p className="text-xs text-gray-400">
                                        ID: {item._id}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Confirmation Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type <span className="font-mono font-bold text-red-600">"DELETE"</span> to confirm
                        </label>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => {
                                setConfirmText(e.target.value);
                                if (error) setError('');
                            }}
                            placeholder="Type DELETE here"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400/20 focus:border-red-400 transition-all"
                            disabled={loading}
                            autoFocus
                        />
                        {error && (
                            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="text-xs" />
                                {error}
                            </p>
                        )}
                    </div>

                    {/* Additional Warning */}
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-xs text-amber-800 flex items-start gap-2">
                            <FontAwesomeIcon icon={faBan} className="text-amber-600 mt-0.5" />
                            <span>
                                This will also remove any associated notes, attachments, and activity logs.
                                Please ensure you have backed up any important information.
                            </span>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={loading || confirmText !== 'DELETE'}
                        className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                            confirmText === 'DELETE' && !loading
                                ? 'bg-red-600 hover:bg-red-700 text-white shadow-md'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Deleting...</span>
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faTrashAlt} />
                                <span>Delete Permanently</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeleteConfirmModal;