// components/modals/Maple/samples/ViewSampleModal.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faImage,
    faTag,
    faMapMarkerAlt,
    faCalendarAlt,
    faStar,
    faClock,
    faImages,
    faMars,
    faVenus,
    faChevronLeft,
    faChevronRight,
    faTimes
} from '@fortawesome/free-solid-svg-icons';
import ViewModal from '../../common/ViewModal';

function ViewSampleModal({ isOpen, onClose, sample }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!sample) return null;

    const getCategoryLabel = (category) => {
        const labels = {
            basket: 'Basket',
            fur: 'Fur',
            gold: 'Gold'
        };
        return labels[category] || category;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://via.placeholder.com/400x300?text=No+Image';
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:5000${imagePath}`;
    };

    const images = sample.images || (sample.image ? [{ url: sample.image, isPrimary: true }] : []);
    const currentImage = images[currentImageIndex];

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <ViewModal
            isOpen={isOpen}
            onClose={onClose}
            title="Sample Details"
            icon={faImages}
            iconColor="text-gray-500"
            maxWidth="max-w-3xl"
        >
            <div className="space-y-6">
                {/* Image Gallery */}
                <div className="relative bg-gray-100 rounded-xl overflow-hidden">
                    <img 
                        src={getImageUrl(currentImage?.url)} 
                        alt={sample.title}
                        className="w-full h-72 object-cover"
                    />
                    
                    {/* Image Navigation */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                            >
                                <FontAwesomeIcon icon={faChevronLeft} className="text-sm" />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                            >
                                <FontAwesomeIcon icon={faChevronRight} className="text-sm" />
                            </button>
                            
                            {/* Image Counter */}
                            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                                {currentImageIndex + 1} / {images.length}
                            </div>
                            
                            {/* Dot Indicators */}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                {images.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                                            index === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'
                                        }`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Title and Badges */}
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{sample.title}</h3>
                        <div className="flex items-center gap-3 text-sm">
                            <span className="text-gray-500">
                                {getCategoryLabel(sample.category)}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-500">
                                {sample.setupType?.replace('-', ' ')}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className={`flex items-center gap-1 ${sample.gender === 'boy' ? 'text-blue-500' : 'text-pink-500'}`}>
                                <FontAwesomeIcon icon={sample.gender === 'boy' ? faMars : faVenus} className="text-xs" />
                                {sample.gender?.charAt(0).toUpperCase() + sample.gender?.slice(1)}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {sample.featured && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <FontAwesomeIcon icon={faStar} className="text-xs" />
                                Featured
                            </span>
                        )}
                        {images.length > 1 && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                <FontAwesomeIcon icon={faImages} className="text-xs" />
                                {images.length} images
                            </span>
                        )}
                    </div>
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

                {/* Image Thumbnails */}
                {images.length > 1 && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">All Images</h3>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {images.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                                        index === currentImageIndex ? 'border-gray-900' : 'border-transparent hover:border-gray-300'
                                    }`}
                                >
                                    <img 
                                        src={getImageUrl(img.url)} 
                                        alt={`${sample.title} ${index + 1}`}
                                        className="w-full h-16 object-cover"
                                    />
                                    {img.isPrimary && (
                                        <span className="absolute bottom-0.5 left-0.5 bg-black/60 text-white text-xs px-1 rounded">
                                            Primary
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Timestamps */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <FontAwesomeIcon icon={faClock} className="text-gray-500" />
                            Date Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 bg-white rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Created (Uploaded)</p>
                                <p className="font-medium text-gray-900">{formatDate(sample.createdAt)}</p>
                            </div>
                            <div className="p-3 bg-white rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                                {sample.createdAt === sample.updatedAt ? (
                                    <p className="font-medium text-gray-400 italic">Not updated yet</p>
                                ) : (
                                    <p className="font-medium text-gray-900">{formatDate(sample.updatedAt)}</p>
                                )}
                            </div>
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