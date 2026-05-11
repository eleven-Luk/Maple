// components/modals/Maple/samples/AddSampleModal.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faImage,
    faPlus,
    faTag,
    faMapMarkerAlt,
    faCalendarAlt,
    faStar,
    faTimes,
    faImages
} from '@fortawesome/free-solid-svg-icons';
import FormModal from '../../common/FormModal';

function AddSampleModal({ isOpen, onClose, onSave }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        setupType: 'basket',
        gender: 'boy',
        locationType: 'studio',
        locationOther: '',
        date: '',
        featured: false,
        images: []
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [imagePreviews, setImagePreviews] = useState([]);

    const setupTypeOptions = [
        { value: 'basket', label: 'Basket' },
        { value: 'fur', label: 'Fur' },
        { value: 'bean&bed', label: 'Bean & Bed' },
    ];

    const locationOptions = [
        { value: 'studio', label: ' In-Studio Session' },
        { value: 'home-services', label: ' Home Services' },
    ];

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
            images: []
        });
        setImagePreviews([]);
        setError('');
        setSuccess('');
        setValidationErrors({});
        setLoading(false);
    };

    React.useEffect(() => {
        if (isOpen) {
            resetForm();
        }
    }, [isOpen]);

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

    const handleImagesChange = (e) => {
        const files = Array.from(e.target.files);
        
        if (files.length > 10) {
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

        setFormData(prev => ({ ...prev, images: files }));
        
        const previews = files.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(previews).then(setImagePreviews);
        setError('');
    };

    const removeImage = (index) => {
        const newImages = Array.from(formData.images);
        newImages.splice(index, 1);
        setFormData(prev => ({ ...prev, images: newImages }));
        
        const newPreviews = [...imagePreviews];
        newPreviews.splice(index, 1);
        setImagePreviews(newPreviews);
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
        
        // Location validation
        if (formData.locationType === 'home-services' && !formData.locationOther?.trim()) {
            errors.location = 'Please enter your location';
        }
        
        if (!formData.date) errors.date = 'Date is required';
        if (formData.images.length === 0) errors.images = 'At least one image is required';

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
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('setupType', formData.setupType);
            formDataToSend.append('gender', formData.gender);
            formDataToSend.append('location', getFinalLocation());
            formDataToSend.append('date', formData.date);
            formDataToSend.append('featured', formData.featured);
            
            formData.images.forEach((image) => {
                formDataToSend.append('images', image);
            });

            await onSave(formDataToSend);
            setSuccess('Sample added successfully!');

            setTimeout(() => {
                setSuccess('');
                resetForm();
                onClose();
            }, 2000);

        } catch (error) {
            console.error('Error adding sample:', error);
            setError(error.message || 'Failed to add sample');
            setLoading(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <FormModal
            isOpen={isOpen}
            onClose={handleClose}
            onSubmit={handleSubmit}
            title="Add New Sample"
            subtitle="Add new photos to your portfolio"
            loading={loading}
            error={error}
            success={success}
            submitText="Add Sample"
            submitIcon={faPlus}
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
                    {validationErrors.title && <p className="text-xs text-red-500 mt-1">{validationErrors.title}</p>}
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
                    {validationErrors.description && <p className="text-xs text-red-500 mt-1">{validationErrors.description}</p>}
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
                        {validationErrors.location && <p className="text-xs text-red-500 mt-1">{validationErrors.location}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-gray-400" />
                            Date *
                        </label>
                        <input 
                            type="date" 
                            name="date" 
                            value={formData.date}
                            onChange={handleChange}
                            max={getTodayDate()}
                            className={`w-full px-4 py-3 border ${validationErrors.date ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400/20 focus:border-gray-400 transition-all bg-gray-50/50`}
                            disabled={loading}
                        />
                        {validationErrors.date && <p className="text-xs text-red-500 mt-1">{validationErrors.date}</p>}
                    </div>
                </div>

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

                {/* Multiple Images Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FontAwesomeIcon icon={faImages} className="mr-2 text-gray-400" />
                        Images * (Max 10)
                    </label>
                    
                    {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className="relative">
                                    <img 
                                        src={preview} 
                                        alt={`Preview ${index + 1}`} 
                                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                    >
                                        <FontAwesomeIcon icon={faTimes} className="text-xs" />
                                    </button>
                                    {index === 0 && (
                                        <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                                            Primary
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <label className="block">
                        <div className={`flex items-center justify-center w-full px-4 py-3 border-2 border-dashed ${validationErrors.images ? 'border-red-400' : 'border-gray-300'} rounded-xl cursor-pointer hover:bg-gray-50 transition-colors`}>
                            <FontAwesomeIcon icon={faImages} className="text-gray-400 mr-2 text-xl" />
                            <span className="text-sm text-gray-600">
                                {formData.images.length > 0 
                                    ? `${formData.images.length} file(s) selected` 
                                    : 'Click to upload images (JPG, PNG, GIF, WEBP)'}
                            </span>
                            <input
                                type="file"
                                name="images"
                                onChange={handleImagesChange}
                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                className="hidden"
                                disabled={loading}
                                multiple
                            />
                        </div>
                    </label>
                    {validationErrors.images && <p className="text-xs text-red-500 mt-1">{validationErrors.images}</p>}
                    <p className="text-xs text-gray-500 mt-1">Max 10 images, 5MB each. First image will be primary.</p>
                </div>
            </div>
        </FormModal>
    );
}

export default AddSampleModal;