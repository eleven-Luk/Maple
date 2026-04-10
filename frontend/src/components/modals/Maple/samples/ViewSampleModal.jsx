// components/modals/Maple/samples/ViewSampleModal.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faImage,
    faTag,
    faMapMarkerAlt,
    faCalendarAlt,
    faStar,
    faEye,
    faClock
} from '@fortawesome/free-solid-svg-icons';
import ViewModal from '../../common/ViewModal';

function ViewSampleModal({ isOpen, onClose, sample }) {
    if (!sample) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getCategoryLabel = (category) => {
        const labels = {
            newborn: 'Newborn',
            maternity: 'Maternity',
            family: 'Family',
            toddler: 'Toddler',
            milestone: 'Milestone',
            wedding: 'Wedding'
        };
        return labels[category] || category;
    };

    return (
        <ViewModal
            isOpen={isOpen}
            onClose={onClose}
            title="Sample Details"
            icon={faImage}
            iconColor="text-gray-500"
            maxWidth="max-w-3xl"
        >
            <div className="space-y-6">
                {/* Image Header */}
                <div className="group bg-white border border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden">

                    <img 
                        src={`http://localhost:5000${sample.image}`} 
                        alt={sample.title}
                        className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                </div>

                {/* Title and Featured Badge */}
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{sample.title}</h3>
                        <p className="text-sm text-gray-500">
                            {getCategoryLabel(sample.category)} • {sample.subCategory}
                        </p>
                    </div>
                    {sample.featured && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <FontAwesomeIcon icon={faStar} className="text-xs" />
                            Featured
                        </span>
                    )}
                </div>

                {/* Description */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                    <p className="text-gray-700 text-sm leading-relaxed">
                        {sample.description}
                    </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-500" />
                        <div>
                            <p className="text-xs text-gray-500">Location</p>
                            <p className="font-medium text-gray-800">{sample.location}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-500" />
                        <div>
                            <p className="text-xs text-gray-500">Date</p>
                            <p className="font-medium text-gray-800">{sample.date}</p>
                        </div>
                    </div>
                </div>

                {/* Date Information */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <FontAwesomeIcon icon={faClock} className="text-gray-500" />
                            Date Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 bg-white rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Created</p>
                                <p className="font-medium text-gray-900">{formatDate(sample.createdAt)}</p>
                            </div>
                            {sample.updatedAt && sample.updatedAt !== sample.createdAt && (
                                <div className="p-3 bg-white rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                                    <p className="font-medium text-gray-900">{formatDate(sample.updatedAt)}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ID */}
                <div className="text-xs text-gray-400 text-center pt-2">
                    Sample ID: {sample._id}
                </div>
            </div>
        </ViewModal>
    );
}

export default ViewSampleModal;