// components/modals/common/ViewModal.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import BaseModal from './BaseModal';

const ViewModal = ({ isOpen, onClose, title, children, icon, iconColor = 'text-blue-500', maxWidth = 'max-w-4xl' }) => {
    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            maxWidth={maxWidth}
            icon={icon}
            iconColor={iconColor}
            showCloseButton={true}
        >
            {/* Content without extra scroll - BaseModal handles scrolling */}
            <div className="p-6">
                {children}
            </div>
            {/* Footer - Fixed at bottom */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end flex-shrink-0">
                <button
                    onClick={onClose}
                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                    Close
                </button>
            </div>
        </BaseModal>
    );
};

export default ViewModal;