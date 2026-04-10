// components/modals/common/FormModal.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import BaseModal from './BaseModal';
import LoadingSpinner from '../../common/LoadingSpinner';

const FormModal = ({
    isOpen,
    onClose,
    title,
    subtitle,
    onSubmit,
    children,
    loading = false,
    error = '',
    success = '',
    submitText = 'Submit',
    cancelText = 'Cancel',
    submitIcon = faPlus,
    maxWidth = 'max-w-2xl',
    icon,
    iconColor = 'text-orange-500',
    onSuccessClose = true,
    successDelay = 2000
}) => {
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (onSubmit) {
            await onSubmit(e);
            if (success && onSuccessClose) {
                setTimeout(onClose, successDelay);
            }
        }
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            subtitle={subtitle}
            maxWidth={maxWidth}
            icon={icon}
            iconColor={iconColor}
        >
            <form onSubmit={handleSubmit} className="px-8 py-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {/* Status Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FontAwesomeIcon icon={faExclamationCircle} className="text-red-500" />
                        </div>
                        <div>
                            <h4 className="font-medium text-red-800">Error</h4>
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    </div>
                )}
                
                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                        </div>
                        <div>
                            <h4 className="font-medium text-green-800">Success!</h4>
                            <p className="text-green-600 text-sm">{success}</p>
                        </div>
                    </div>
                )}

                {/* Form Content */}
                <div className="space-y-6">
                    {children}
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 text-gray-600 hover:text-gray-800 font-medium rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50"
                        disabled={loading}
                    >
                        {cancelText}
                    </button>
                    <button 
                        type="submit" 
                        className="px-6 py-2.5 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-500/25"
                        disabled={loading}
                    >
                        {loading ? (
                            <LoadingSpinner message={`${submitText}...`} />
                        ) : (
                            <>
                                <FontAwesomeIcon icon={submitIcon} />
                                {submitText}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </BaseModal>
    );
};

export default FormModal;