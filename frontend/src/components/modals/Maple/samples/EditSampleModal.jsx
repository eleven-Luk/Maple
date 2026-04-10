// components/modals/Maple/samples/EditSampleModal.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSave,
    faTag,
    faMapMarkerAlt,
    faCalendarAlt,
    faStar,
    faImage,
    faTimes
} from '@fortawesome/free-solid-svg-icons';
import FormModal from '../../common/FormModal';

function EditSampleModal({ isOpen, onClose, onSave, sample }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'newborn',
        subCategory: '',
        locationType: 'studio',
        locationOther: '',
        locationOutdoor: '',
        locationClientHome: '',
        date: '',
        featured: false,
        image: null
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [imagePreview, setImagePreview] = useState('');
    const [fileName, setFileName] = useState('');
    const [currentImage, setCurrentImage] = useState('');

    const locationOptions = [
        { value: 'studio', label: ' In-Studio Session' },
        { value: 'client-home', label: ' Client\'s Home' },
        { value: 'outdoor', label: ' Outdoor Location' },
        { value: 'other', label: ' Other Location' }
    ];

    // Helper function to extract location type from stored location string
    const getLocationTypeFromString = (locationString) => {
        if (!locationString) return 'studio';
        if (locationString.includes('In-Studio')) return 'studio';
        if (locationString.includes('Client\'s Home')) return 'client-home';
        if (locationString.includes('Outdoor')) return 'outdoor';
        return 'other';
    };

    // Helper function to extract custom location text
    const getCustomLocationText = (locationString) => {
        if (!locationString) return '';
        // If it's a standard location label, return empty
        if (locationString.includes('In-Studio') || 
            locationString.includes('Client\'s Home') || 
            locationString.includes('Outdoor Location')) {
            return '';
        }
        return locationString;
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            category: 'newborn',
            subCategory: '',
            locationType: 'studio',
            locationOther: '',
            locationOutdoor: '',
            locationClientHome: '',
            date: '',
            featured: false,
            image: null
        });
        setImagePreview('');
        setFileName('');
        setError('');
        setSuccess('');
        setValidationErrors({});
        setLoading(false);
    };

    useEffect(() => {
        if (sample && isOpen) {
            const locationType = getLocationTypeFromString(sample.location);
            const customLocation = getCustomLocationText(sample.location);
            
            setFormData({
                title: sample.title || '',
                description: sample.description || '',
                category: sample.category || 'newborn',
                subCategory: sample.subCategory || '',
                locationType: locationType,
                locationOther: locationType === 'other' ? customLocation : '',
                locationOutdoor: locationType === 'outdoor' ? customLocation : '',
                locationClientHome: locationType === 'client-home' ? customLocation : '',
                date: sample.date || '',
                featured: sample.featured || false,
                image: null
            });
            setCurrentImage(sample.image || '');
            setImagePreview(sample.image ? `http://localhost:5000${sample.image}` : '');
        } else if (!isOpen) {
            resetForm();
        }
    }, [sample, isOpen]);

    const categoryOptions = [
        { value: 'newborn', label: 'Newborn' },
        { value: 'maternity', label: 'Maternity' },
        { value: 'family', label: 'Family' },
        { value: 'toddler', label: 'Toddler' },
        { value: 'milestone', label: 'Milestone' },
        { value: 'wedding', label: 'Wedding' },
    ];

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
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Clear validation error for the field being changed
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
        
        // Reset other location fields when location type changes
        if (name === 'locationType') {
            setFormData(prev => ({
                ...prev,
                locationOther: '',
                locationOutdoor: '',
                locationClientHome: ''
            }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }
            
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setError('Only JPG, PNG, GIF, and WEBP images are allowed');
                return;
            }
            
            setFormData(prev => ({ ...prev, image: file }));
            setFileName(file.name);
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setError('');
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, image: null }));
        setImagePreview('');
        setFileName('');
    };

    const getFinalLocation = () => {
        switch (formData.locationType) {
            case 'outdoor':
                return formData.locationOutdoor.trim() || 'Outdoor Location';
            case 'client-home':
                return formData.locationClientHome.trim() || "Client's Home";
            case 'other':
                return formData.locationOther.trim() || 'Other Location';
            default:
                const location = locationOptions.find(opt => opt.value === formData.locationType);
                return location ? location.label : 'Studio Session';
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.title.trim()) errors.title = 'Title is required';
        if (!formData.description.trim()) errors.description = 'Description is required';
        if (!formData.subCategory.trim()) errors.subCategory = 'Sub-category is required';
        
        if (!formData.locationType) {
            errors.location = 'Please select a location';
        } else if (formData.locationType === 'outdoor' && !formData.locationOutdoor?.trim()) {
            errors.location = 'Please enter the outdoor location';
        } else if (formData.locationType === 'client-home' && !formData.locationClientHome?.trim()) {
            errors.location = 'Please enter the client\'s home address';
        } else if (formData.locationType === 'other' && !formData.locationOther?.trim()) {
            errors.location = 'Please enter the location';
        }

        if (!formData.date) errors.date = 'Date is required';

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
            formDataToSend.append('category', formData.category);
            formDataToSend.append('subCategory', formData.subCategory);
            formDataToSend.append('location', finalLocation);
            formDataToSend.append('date', formData.date);
            formDataToSend.append('featured', formData.featured);
            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            await onSave(formDataToSend);
            setSuccess('Sample updated successfully!');

            setTimeout(() => {
                setSuccess('');
                onClose();
            }, 2000);

        } catch (error) {
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
            icon={faImage}
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
                        placeholder="e.g., Newborn Wonder"
                        value={formData.title}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border ${validationErrors.title ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400/20 focus:border-gray-400 transition-all bg-gray-50/50`}
                        disabled={loading}
                    />
                    {validationErrors.title && <p className={`text-xs ${styles.error} mt-1`}>{validationErrors.title}</p>}
                </div>

                {/* Category and Sub-category */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                        </label>
                        <select 
                            name="category" 
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400/20 focus:border-gray-400 transition-all bg-gray-50/50"
                            disabled={loading}
                        >
                            {categoryOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sub-category *
                        </label>
                        <input 
                            type="text" 
                            name="subCategory" 
                            placeholder="e.g., Studio Session"
                            value={formData.subCategory}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border ${validationErrors.subCategory ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400/20 focus:border-gray-400 transition-all bg-gray-50/50`}
                            disabled={loading}
                        />
                        {validationErrors.subCategory && <p className={`text-xs ${styles.error} mt-1`}>{validationErrors.subCategory}</p>}
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
                            <FontAwesomeIcon icon={faMapMarkerAlt} className={`absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm z-10`} />
                            <select 
                                name='locationType' 
                                value={formData.locationType} 
                                onChange={handleChange}
                                className={`w-full pl-10 p-3 border ${validationErrors.location ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400/20 focus:border-gray-400 transition-all bg-gray-50/50 appearance-none`}
                            >
                                {locationOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Conditional input for Outdoor location */}
                        {formData.locationType === 'outdoor' && (
                            <div className="mt-2">
                                <input
                                    type='text'
                                    name='locationOutdoor'
                                    value={formData.locationOutdoor}
                                    onChange={handleChange}
                                    placeholder="Enter outdoor location (park, garden, beach, etc.)"
                                    className={`w-full p-3 border ${validationErrors.location ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400/20 focus:border-gray-400 transition-all bg-gray-50/50`}
                                />
                                <p className="text-xs text-gray-400 mt-1">Please provide specific location details</p>
                            </div>
                        )}

                        {/* Conditional input for Client's Home location */}
                        {formData.locationType === 'client-home' && (
                            <div className="mt-2">
                                <input
                                    type='text'
                                    name='locationClientHome'
                                    value={formData.locationClientHome}
                                    onChange={handleChange}
                                    placeholder="Enter client's home address"
                                    className={`w-full p-3 border ${validationErrors.location ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400/20 focus:border-gray-400 transition-all bg-gray-50/50`}
                                />
                                <p className="text-xs text-gray-400 mt-1">Full address will be shared upon booking confirmation</p>
                            </div>
                        )}
                        
                        {/* Conditional input for "Other" location */}
                        {formData.locationType === 'other' && (
                            <div className="mt-2">
                                <input
                                    type='text'
                                    name='locationOther'
                                    value={formData.locationOther}
                                    onChange={handleChange}
                                    placeholder="Enter location details"
                                    className={`w-full p-3 border ${validationErrors.location ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400/20 focus:border-gray-400 transition-all bg-gray-50/50`}
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
                        <p className="text-xs text-gray-400 mt-1">Select the date when the photo was taken</p>
                    </div>
                </div>

                {/* Current Image */}
                {currentImage && !imagePreview && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Image</label>
                        <img 
                            src={`http://localhost:5000${currentImage}`} 
                            alt="Current" 
                            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                        />
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
                        <span className="text-sm text-gray-500">(Appears in featured section)</span>
                    </label>
                </div>

                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FontAwesomeIcon icon={faImage} className="mr-2 text-gray-400" />
                        {formData.image ? 'Replace Image' : 'Update Image (Optional)'}
                    </label>
                    
                    {imagePreview ? (
                        <div className="relative inline-block">
                            <img 
                                src={imagePreview} 
                                alt="Preview" 
                                className="w-32 h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                            />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            >
                                <FontAwesomeIcon icon={faTimes} className="text-xs" />
                            </button>
                            <p className="text-xs text-green-600 mt-1">New image selected: {fileName}</p>
                        </div>
                    ) : (
                        <label className="block">
                            <div className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                <FontAwesomeIcon icon={faImage} className="text-gray-400 mr-2 text-xl" />
                                <span className="text-sm text-gray-600">
                                    {fileName || 'Click to upload new image (JPG, PNG, GIF, WEBP)'}
                                </span>
                                <input
                                    type="file"
                                    name="image"
                                    onChange={handleImageChange}
                                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                    className="hidden"
                                    disabled={loading}
                                />
                            </div>
                        </label>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Accepted formats: JPG, PNG, GIF, WEBP (Max 5MB)</p>
                </div>
            </div>
        </FormModal>
    );
}

export default EditSampleModal;