// components/modals/common/ConfirmModal.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faExclamationTriangle, 
    faTrash, 
    faArchive, 
    faCheck,
    faTimes 
} from '@fortawesome/free-solid-svg-icons';
import BaseModal from './BaseModal';
import LoadingSpinner from '../../common/LoadingSpinner';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    itemName,
    itemDetails = null,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger', // 'danger', 'warning', 'info', 'success'
    icon = null,
    isLoading = false
}) => {
    const config = {
        danger: {
            buttonClass: 'bg-red-500 hover:bg-red-600',
            iconColor: 'text-red-600',
            bgColor: 'bg-red-100',
            icon: faExclamationTriangle
        },
        warning: {
            buttonClass: 'bg-amber-500 hover:bg-amber-600',
            iconColor: 'text-amber-600',
            bgColor: 'bg-amber-100',
            icon: faExclamationTriangle
        },
        info: {
            buttonClass: 'bg-blue-500 hover:bg-blue-600',
            iconColor: 'text-blue-600',
            bgColor: 'bg-blue-100',
            icon: faCheck
        },
        success: {
            buttonClass: 'bg-green-500 hover:bg-green-600',
            iconColor: 'text-green-600',
            bgColor: 'bg-green-100',
            icon: faCheck
        }
    };

    const style = config[type];
    const displayIcon = icon || style.icon;

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            maxWidth="max-w-md"
            showCloseButton={false}
        >
            <div className="p-6">
                {/* Icon */}
                <div className="flex items-center justify-center mb-4">
                    <div className={`h-16 w-16 ${style.bgColor} rounded-full flex items-center justify-center`}>
                        <FontAwesomeIcon icon={displayIcon} className={`${style.iconColor} text-2xl`} />
                    </div>
                </div>
                
                {/* Message */}
                <p className="text-gray-600 text-center mb-4">{message}</p>
                
                {/* Item Name */}
                {itemName && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                        <p className="font-medium text-gray-900 text-center">{itemName}</p>
                        {itemDetails && (
                            <div className="mt-2 text-sm text-gray-500 space-y-1">
                                {Object.entries(itemDetails).map(([key, value]) => (
                                    <div key={key} className="flex justify-between">
                                        <span className="capitalize">{key}:</span>
                                        <span>{value}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${style.buttonClass}`}
                    >
                        {isLoading ? (
                            <LoadingSpinner message="" />
                        ) : (
                            <>
                                <FontAwesomeIcon icon={confirmText === 'Archive' ? faArchive : faTrash} />
                                {confirmText}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </BaseModal>
    );
};

export default ConfirmModal;