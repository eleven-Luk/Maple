// components/modals/common/BaseModal.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const BaseModal = ({ 
    isOpen, 
    onClose, 
    title, 
    subtitle, 
    children, 
    maxWidth = 'max-w-2xl',
    showCloseButton = true,
    closeOnBackdrop = true,
    icon,
    iconColor = 'text-orange-500'
}) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div 
                className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} flex flex-col max-h-[90vh]`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - Fixed at top */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {icon && (
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${iconColor.replace('text-', '')}/10`}>
                                <FontAwesomeIcon icon={icon} className={iconColor} />
                            </div>
                        )}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
                            {subtitle && (
                                <p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>
                            )}
                        </div>
                    </div>
                    {showCloseButton && (
                        <button 
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-all flex-shrink-0"
                        >
                            <FontAwesomeIcon icon={faTimes} className="text-xl" />
                        </button>
                    )}
                </div>

                {/* Content - Scrollable area */}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default BaseModal;