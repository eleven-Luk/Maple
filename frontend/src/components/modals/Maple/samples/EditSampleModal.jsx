// components/modals/Maple/samples/EditSampleModal.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSave,
    faTag,
    faMapMarkerAlt,
    faCalendarAlt,
    faStar,
    faImages,
    faTimes,
    faPlus
} from '@fortawesome/free-solid-svg-icons';
import FormModal from '../../common/FormModal';

function EditSampleModal({ isOpen, onClose, onSave, sample }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        setupType: 'basket',
        gender: 'boy',
        locationType: 'studio',
        locationOther: '',
        date: '',
        featured: false,
        newImages: [],
        existingImages: [],
        deletedImages: []
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [newImagePreviews, setNewImagePreviews] = useState([]);

    const setupTypeOptions = [
        { value: 'basket', label: 'Basket' },
        { value: 'fur', label: 'Fur' },
        { value: 'bean&bed', label: 'Bean & Bed' },
    ];

    const locationOptions = [
        { value: 'studio', label: ' In-Studio Session' },
        { value: 'home-services', label: ' Home Services' },
    ];

    // Helper function to extract location type from stored location string
    const getLocationTypeFromString = (locationString) => {
        if (!locationString) return 'studio';
        if (locationString.toLowerCase().includes('home services') || 
            locationString.toLowerCase().includes('home')) return 'home-services';
        return 'studio';
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            setupType: 'basket',
            gender: 'boy',
            locationType: 'studio',
            locationOther: '',
            date: '',
            featured: false,
            newImages: [],
            existingImages: [],
            deletedImages: []
        });
        setNewImagePreviews([]);
        setError('');
        setSuccess('');
        setValidationErrors({});
        setLoading(false);
    };

    useEffect(() => {
        if (sample && isOpen) {
            const locationType = getLocationTypeFromString(sample.location);
            const existingImages = sample.images || (sample.image ? [{ url: sample.image, isPrimary: true }] : []);
            
            setFormData({
                title: sample.title || '',
                description: sample.description || '',
                setupType: sample.setupType || 'basket',
                gender: sample.gender || 'boy',
                locationType: locationType,
                locationOther: locationType === 'home-services' ? sample.location : '',
                date: sample.date || '',
                featured: sample.featured || false,
                newImages: [],
                existingImages: existingImages,
                deletedImages: []
            });
        } else if (!isOpen) {
            resetForm();
        }
    }, [sample, isOpen]);

    // Format date for display
    const formatDateForDisplay = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        return dateString;
    };

    // Handle date change from native picker
    const handleDateChange = (e) => {
        const dateValue = e.target.value;
        if (dateValue) {
            const formattedDate = formatDateForDisplay(dateValue);
            setFormData(prev => ({ ...prev, date: formattedDate }));
        } else {
            setFormData(prev => ({ ...prev, date: '' }));
        }
        if (validationErrors.date) {
            setValidationErrors(prev => ({ ...prev, date: '' }));
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        // Reset locationOther when switching to studio
        if (name === 'locationType') {
            if (value === 'studio') {
                setFormData(prev => ({
                    ...prev,
                    locationType: value,
                    locationOther: ''
                }));
                return;
            }
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleNewImagesChange = (e) => {
        const files = Array.from(e.target.files);
        const totalImages = formData.existingImages.length - formData.deletedImages.length + files.length;
        
        if (totalImages > 10) {
            setError('Maximum 10 images allowed');
            return;
        }

        for (const file of files) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Each file must be less than 5MB');
                return;
            }
            
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setError('Only JPG, PNG, GIF, and WEBP images are allowed');
                return;
            }
        }

        setFormData(prev => ({ ...prev, newImages: [...prev.newImages, ...files] }));
        
        const previews = files.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(previews).then(newPreviews => {
            setNewImagePreviews(prev => [...prev, ...newPreviews]);
        });
        setError('');
    };

    const removeNewImage = (index) => {
        const newImages = [...formData.newImages];
        newImages.splice(index, 1);
        setFormData(prev => ({ ...prev, newImages }));
        
        const newPreviews = [...newImagePreviews];
        newPreviews.splice(index, 1);
        setNewImagePreviews(newPreviews);
    };

    const removeExistingImage = (imageUrl) => {
        setFormData(prev => ({
            ...prev,
            deletedImages: [...prev.deletedImages, imageUrl],
            existingImages: prev.existingImages.filter(img => img.url !== imageUrl)
        }));
    };

    const setPrimaryImage = (imageUrl) => {
        setFormData(prev => ({
            ...prev,
            existingImages: prev.existingImages.map(img => ({
                ...img,
                isPrimary: img.url === imageUrl
            }))
        }));
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://via.placeholder.com/400x300?text=No+Image';
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:5000${imagePath}`;
    };

    const getFinalLocation = () => {
        if (formData.locationType === 'home-services') {
            return formData.locationOther?.trim() || 'Home Services';
        }
        const location = locationOptions.find(opt => opt.value === formData.locationType);
        return location ? location.label.trim() : 'Studio Session';
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.title.trim()) errors.title = 'Title is required';
        if (!formData.description.trim()) errors.description = 'Description is required';
        
        if (formData.locationType === 'home-services' && !formData.locationOther?.trim()) {
            errors.location = 'Please enter your location';
        }
        
        if (!formData.date) errors.date = 'Date is required';

        const totalImages = formData.existingImages.length + formData.newImages.length;
        if (totalImages === 0) errors.images = 'At least one image is required';

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const finalLocation = getFinalLocation();
            
            const formDataToSend = new FormData();
            formDataToSend.append('id', sample._id);
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('setupType', formData.setupType);
            formDataToSend.append('gender', formData.gender);
            formDataToSend.append('location', finalLocation);
            formDataToSend.append('date', formData.date);
            formDataToSend.append('featured', formData.featured);

            // Send existing images with their isPrimary status
            const existingImagesData = formData.existingImages.map(img => ({
                url: img.url,
                filename: img.filename,
                isPrimary: img.isPrimary,
                uploadedAt: img.uploadedAt
            }));
            formDataToSend.append('existingImages', JSON.stringify(existingImagesData));
            
            // Handle deleted images
            if (formData.deletedImages.length > 0) {
                formDataToSend.append('deletedImages', JSON.stringify(formData.deletedImages));
            }

            // Append new images
            formData.newImages.forEach((image) => {
                formDataToSend.append('images', image);
            });

            await onSave(formDataToSend);
            setSuccess('Sample updated successfully!');

            setTimeout(() => {
                setSuccess('');
                onClose();
            }, 2000);

        } catch (error) {
            console.error('Error updating sample:', error);
            setError(error.message || 'Failed to update sample');
            setLoading(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    // Convert formData.date to YYYY-MM-DD for the date input
    const getDateValue = () => {
        if (!formData.date) return '';
        try {
            const date = new Date(formData.date);
            if (!isNaN(date.getTime())) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }
        } catch (e) {
            return '';
        }
        return '';
    };

    // Get today's date for max attribute
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const styles = {
        bg: 'bg-white',
        headerBg: 'bg-gray-50',
        buttonBg: 'bg-gray-600 hover:bg-gray-700',
        focusRing: 'focus:ring-gray-400',
        border: 'border-gray-200',
        text: 'text-gray-800',
        accent: 'text-gray-500',
        error: 'text-red-500'
    };

    return (
        <FormModal
            isOpen={isOpen}
            onClose={handleClose}
            onSubmit={handleSubmit}
            title="Edit Sample"
            subtitle={`Editing: ${sample?.title || 'Sample'}`}
            loading={loading}
            error={error}
            success={success}
            submitText="Update Sample"
            submitIcon={faSave}
            maxWidth="max-w-2xl"
            icon={faImages}
            iconColor="text-gray-500"
        >
            <div className="space-y-4">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FontAwesomeIcon icon={faTag} className="mr-2 text-gray-400" />
                        Title *
                    </label>
                    <input 
                        type="text" 
                        name="title" 
                        placeholder="e.g., Baby Boy in Basket"
                        value={formData.title}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border ${validationErrors.title ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400/20 focus:border-gray-400 transition-all bg-gray-50/50`}
                        disabled={loading}
                    />
                    {validationErrors.title && <p className={`text-xs ${styles.error} mt-1`}>{validationErrors.title}</p>}
                </div>

                {/* Setup Type and Gender */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Setup Type *
                        </label>
                        <select 
                            name="setupType" 
                            value={formData.setupType}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400/20 focus:border-gray-400 transition-all bg-gray-50/50"
                            disabled={loading}
                        >
                            {setupTypeOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gender *
                        </label>
                        <select 
                            name="gender" 
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400/20 focus:border-gray-400 transition-all bg-gray-50/50"
                            disabled={loading}
                        >
                            <option value="boy">Boy</option>
                            <option value="girl">Girl</option>
                        </select>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                    </label>
                    <textarea 
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Describe the photo session..."
                        className={`w-full px-4 py-3 border ${validationErrors.description ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400/20 focus:border-gray-400 transition-all bg-gray-50/50 resize-none`}
                        disabled={loading}
                    />
                    {validationErrors.description && <p className={`text-xs ${styles.error} mt-1`}>{validationErrors.description}</p>}
                </div>

                {/* Location and Date */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-gray-400" />
                            Location *
                        </label>
                        <div className='relative'>
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm z-10" />
                            <select 
                                name='locationType' 
                                value={formData.locationType} 
                                onChange={handleChange}
                                className={`w-full pl-10 py-3 border ${validationErrors.location ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400/20 focus:border-gray-400 transition-all bg-gray-50/50 appearance-none`}
                                disabled={loading}
                            >
                                {locationOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {formData.locationType === 'home-services' && (
                            <div className="mt-2">
                                <input
                                    type='text'
                                    name='locationOther'
                                    value={formData.locationOther}
                                    onChange={handleChange}
                                    placeholder="Enter your location (address, landmark, etc.)"
                                    className={`w-full px-4 py-3 border ${validationErrors.location ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400/20 focus:border-gray-400 transition-all bg-gray-50/50`}
                                    disabled={loading}
                                />
                            </div>
                        )}
                        {validationErrors.location && <p className={`text-xs ${styles.error} mt-1`}>{validationErrors.location}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-gray-400" />
                            Date *
                        </label>
                        <input 
                            type="date" 
                            name="date" 
                            value={getDateValue()}
                            onChange={handleDateChange}
                            max={getTodayDate()}
                            className={`w-full px-4 py-3 border ${validationErrors.date ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400/20 focus:border-gray-400 transition-all bg-gray-50/50`}
                            disabled={loading}
                        />
                        {validationErrors.date && <p className={`text-xs ${styles.error} mt-1`}>{validationErrors.date}</p>}
                    </div>
                </div>

                {/* Existing Images */}
                {formData.existingImages.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Existing Images
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {formData.existingImages.map((img, index) => (
                                <div key={img.url || index} className="relative">
                                    <img 
                                        src={getImageUrl(img.url)} 
                                        alt={`Existing ${index + 1}`}
                                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                    />
                                    {/* Delete button */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeExistingImage(img.url);
                                        }}
                                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                    >
                                        <FontAwesomeIcon icon={faTimes} className="text-xs" />
                                    </button>
                                    
                                    {/* Primary badge or Set Primary button */}
                                    {img.isPrimary ? (
                                        <span className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">
                                            Primary
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPrimaryImage(img.url);
                                            }}
                                            className="absolute bottom-1 left-1 bg-white/90 hover:bg-white text-gray-700 text-xs px-1.5 py-0.5 rounded border border-gray-300 hover:border-gray-400 transition-colors"
                                        >
                                            Set Primary
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Featured Checkbox */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <input
                        type="checkbox"
                        name="featured"
                        id="featured"
                        checked={formData.featured}
                        onChange={handleChange}
                        className="w-5 h-5 text-gray-500 rounded border-gray-300 focus:ring-gray-400"
                    />
                    <label htmlFor="featured" className="flex items-center gap-2 text-gray-700 cursor-pointer">
                        <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
                        <span className="font-medium">Feature this sample</span>
                    </label>
                </div>

                {/* New Images Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FontAwesomeIcon icon={faImages} className="mr-2 text-gray-400" />
                        Add More Images (Optional)
                    </label>
                    
                    {newImagePreviews.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
                            {newImagePreviews.map((preview, index) => (
                                <div key={index} className="relative">
                                    <img 
                                        src={preview} 
                                        alt={`New ${index + 1}`} 
                                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeNewImage(index)}
                                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                    >
                                        <FontAwesomeIcon icon={faTimes} className="text-xs" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <label className="block">
                        <div className={`flex items-center justify-center w-full px-4 py-3 border-2 border-dashed ${validationErrors.images ? 'border-red-400' : 'border-gray-300'} rounded-xl cursor-pointer hover:bg-gray-50 transition-colors`}>
                            <FontAwesomeIcon icon={faPlus} className="text-gray-400 mr-2 text-xl" />
                            <span className="text-sm text-gray-600">
                                {formData.newImages.length > 0 
                                    ? `${formData.newImages.length} new file(s) selected` 
                                    : 'Click to add more images'}
                            </span>
                            <input
                                type="file"
                                name="newImages"
                                onChange={handleNewImagesChange}
                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                className="hidden"
                                disabled={loading}
                                multiple
                            />
                        </div>
                    </label>
                    {validationErrors.images && <p className="text-xs text-red-500 mt-1">{validationErrors.images}</p>}
                </div>
            </div>
        </FormModal>
    );
}

export default EditSampleModal;