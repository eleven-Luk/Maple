import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEnvelope,
    faPaperPlane,
    faUser,
    faMessage,
    faXmark,
    faCalendarCheck,
    faPhone,
    faClock,
    faMapMarkerAlt,
    faBox,
    faBan,
    faSpinner,
    faShieldAlt,
    faSun,
    faCloudSun,
    faMoneyBillWave,
    faQrcode,
    faUpload,
    faFileImage,
    faTimes,
    faCheckCircle,
    faArrowRight,
    faArrowLeft,
    faCreditCard,
    faUserEdit,
    faChevronRight,
    faChevronLeft
} from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PublicCalendar from '../../components/calendar/PublicCalendar';

import gcash from '../../assets/gcash-1.jpg';

function MContactModal({ isOpen, onClose, appointment }) {
    // Step management
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        packageType: 'coral',
        preferredDate: '',
        sessionType: 'morning',
        durationHours: '2',
        locationType: 'studio',
        locationOther: '',
        transactionReference: '',
        message: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    
    // File upload states
    const [receiptFile, setReceiptFile] = useState(null);
    const [receiptPreview, setReceiptPreview] = useState(null);
    const fileInputRef = useRef(null);
    
    // Calendar states
    const [showCalendar, setShowCalendar] = useState(false);
    const [availableSessions, setAvailableSessions] = useState({
        morning: true,
        afternoon: true
    });
    const [checkingAvailability, setCheckingAvailability] = useState(false);

    const [authorized, setAuthorized] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('gcash');

    const sessionOptions = [
        { value: 'morning', label: 'Morning Session', time: '10:00 AM - 12:00 PM', icon: faSun },
        { value: 'afternoon', label: 'Afternoon Session', time: '3:00 PM - 5:00 PM', icon: faCloudSun }
    ];

    const locationOptions = [
        { value: 'studio', label: ' In-Studio Session' },
        { value: 'home-services', label: ' Home Services' },
    ];


    useEffect(() => {
        if (formData.preferredDate) {
            fetchAvailableSessions(formData.preferredDate);
        } else {
            setAvailableSessions({ morning: true, afternoon: true });
        }
    }, [formData.preferredDate]);

    useEffect(() => {
        if (!isOpen) {
            if (receiptPreview) {
                URL.revokeObjectURL(receiptPreview);
            }
            setReceiptFile(null);
            setReceiptPreview(null);
            setCurrentStep(1);
        }
    }, [isOpen, receiptPreview]);

    const fetchAvailableSessions = async (date) => {
        setCheckingAvailability(true);
        try {
            const response = await fetch(`http://localhost:5000/api/appointments/available-sessions?date=${date}`);
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setAvailableSessions(result.data || { morning: true, afternoon: true });
                }
            }
        } catch (error) {
            console.error('Error fetching sessions:', error);
        } finally {
            setCheckingAvailability(false);
        }
    };

    const checkSessionAvailability = async (date, sessionType) => {
        try {
            const response = await fetch(`http://localhost:5000/api/appointments/check-session?date=${date}&session=${sessionType}`);
            if (response.ok) {
                const result = await response.json();
                return result;
            }
            return { isAvailable: true };
        } catch (error) {
            console.error('Error checking session:', error);
            return { isAvailable: true };
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            setError('Please upload a valid file (JPEG, PNG, WEBP, or PDF)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        setReceiptFile(file);
        
        if (file.type.startsWith('image/')) {
            const previewUrl = URL.createObjectURL(file);
            setReceiptPreview(previewUrl);
        } else {
            setReceiptPreview(null);
        }
        
        setError('');
    };

    const handleRemoveFile = () => {
        if (receiptPreview) {
            URL.revokeObjectURL(receiptPreview);
        }
        setReceiptFile(null);
        setReceiptPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
        
        if (name === 'locationType') {
            if (value === 'studio') {
                setFormData(prev => ({ ...prev, locationOther: '' }));
            }
        }
    };

    const handleDateSelect = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        
        setFormData(prev => ({ ...prev, preferredDate: dateString, sessionType: 'morning' }));
        setShowCalendar(false);
        if (validationErrors.preferredDate) {
            setValidationErrors(prev => ({ ...prev, preferredDate: '' }));
        }
        setError('');
    };

    const handleSessionSelect = (sessionType) => {
        if (!formData.preferredDate) {
            setError('Please select a date first');
            return;
        }
        
        setFormData(prev => ({ ...prev, sessionType }));
        if (validationErrors.sessionType) {
            setValidationErrors(prev => ({ ...prev, sessionType: '' }));
        }
        setError('');
    };

    const getFinalLocation = () => {
        if (formData.locationType === 'home-services') {
            return formData.locationOther?.trim() || 'Home Services';
        }
        const location = locationOptions.find(opt => opt.value === formData.locationType);
        return location ? location.label.trim() : 'Studio Session';
    };

    // Validate Step 1 (Personal Details)
    const validateStep1 = () => {
        const errors = {};

        if (!formData.name?.trim()) errors.name = 'Please enter your name';
        if (!formData.email?.trim()) errors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Please enter a valid email address';
        if (!formData.phone?.trim()) errors.phone = 'Please enter your phone number';
        if (!formData.packageType) errors.packageType = 'Please select a package type';
        if (!formData.preferredDate) errors.preferredDate = 'Please select a preferred date';
        if (!formData.sessionType) errors.sessionType = 'Please select a session time';
        
        if (!formData.locationType) {
            errors.location = 'Please select a location';
        } else if (formData.locationType === 'home-services' && !formData.locationOther?.trim()) {
            errors.location = 'Please enter your location';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Validate Step 2 (Payment)
    const validateStep2 = () => {
        const errors = {};

        if (!formData.transactionReference?.trim()) errors.transactionReference = 'Please enter the transaction reference';
        if (!receiptFile) errors.receipt = 'Please upload your payment receipt';
        if (!authorized) errors.authorized = 'Please authorize to proceed';

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const nextStep = () => {
        setError('');
        if (currentStep === 1) {
            if (validateStep1()) {
                setCurrentStep(2);
            }
        }
    };

    const prevStep = () => {
        setError('');
        setCurrentStep(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep2()) return;

        setLoading(true);
        setError('');

        try {
            // Upload receipt first
            let receiptUrl = null;
            if (receiptFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('receipt', receiptFile);
                
                const uploadResponse = await fetch('http://localhost:5000/api/appointments/upload-receipt', {
                    method: 'POST',
                    body: uploadFormData,
                });
                
                if (uploadResponse.ok) {
                    const uploadResult = await uploadResponse.json();
                    receiptUrl = uploadResult.fileUrl || uploadResult.url;
                    console.log('✅ Receipt uploaded:', receiptUrl);
                } else {
                    const errorResult = await uploadResponse.json();
                    throw new Error(errorResult.message || 'Failed to upload receipt');
                }
            }
            
            // Create appointment data
            const appointmentData = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                packageType: formData.packageType,
                preferredDate: formData.preferredDate,
                sessionType: formData.sessionType,
                location: getFinalLocation(),
                specialRequests: formData.message?.trim() || '',
                transactionReference: formData.transactionReference?.trim() || '',
                paymentMethod: paymentMethod,
                receiptUrl: receiptUrl
            };

            console.log('📤 Sending appointment data:', JSON.stringify(appointmentData, null, 2));
            
            const response = await fetch(`http://localhost:5000/api/appointments/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(appointmentData),
            });

            const result = await response.json();
            console.log('📥 Server response:', result);

            if (!response.ok) {
                const errorMsg = result.errors 
                    ? result.errors.join(', ') 
                    : result.message || 'Failed to create appointment';
                throw new Error(errorMsg);
            }

            if (result.success) {
                // Reset the form
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    packageType: 'coral',
                    preferredDate: '',
                    sessionType: 'morning',
                    durationHours: '2',
                    locationType: 'studio',
                    locationOther: '',
                    transactionReference: '',
                    message: '',
                });
                
                // Reset receipt
                if (receiptPreview) {
                    URL.revokeObjectURL(receiptPreview);
                }
                setReceiptFile(null);
                setReceiptPreview(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                
                // Reset authorization
                setAuthorized(false);
                
                // Reset payment method
                setPaymentMethod('gcash');
                
                // Reset calendar
                setAvailableSessions({ morning: true, afternoon: true });
                
                // Go back to step 1
                setCurrentStep(1);
                
                // Clear validation errors
                setValidationErrors({});
                
                // Show success message
                setSuccess('Appointment submitted successfully! We will verify your payment and confirm your booking within 24 hours.');
                
                // Close modal after delay
                setTimeout(() => {
                    setSuccess('');
                    onClose();
                }, 3000);
            } else {
                throw new Error(result.message || 'Failed to create appointment');
            }

        } catch (error) {
            console.error('Error submitting appointment:', error);
            setError(error.message || 'Failed to submit appointment. Please try again.');
        } finally {
            setLoading(false);
        }
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

    if (!isOpen) return null;

    // Step labels
    const stepLabels = ['Personal Details', 'Payment', 'Confirmation'];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose}></div>
            
            <div className="flex min-h-full items-center justify-center p-4">
                <div className={`relative w-full max-w-md ${styles.bg} rounded-xl shadow-2xl flex flex-col max-h-[90vh]`}>
                    {/* Header */}
                    <div className={`flex items-center justify-between p-5 ${styles.headerBg} rounded-t-xl border-b ${styles.border} flex-shrink-0`}>
                        <div className='flex items-center gap-2'>
                            <FontAwesomeIcon icon={faCalendarCheck} className={styles.accent} />
                            <h3 className={`text-lg font-light ${styles.text}`}>Book a Session</h3>
                        </div>
                        <button onClick={onClose} className={`p-1 rounded-full hover:bg-gray-100 transition-colors ${styles.accent}`}>
                            <FontAwesomeIcon icon={faXmark} className='text-xl' />
                        </button>
                    </div>

                    {/* Progress Steps */}
                    <div className="px-6 pt-4">
                        <div className="flex items-center justify-between mb-2">
                            {stepLabels.map((label, index) => (
                                <div key={index} className="flex items-center">
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-all ${
                                        currentStep > index + 1 
                                            ? 'bg-green-500 text-white' 
                                            : currentStep === index + 1 
                                                ? 'bg-gray-900 text-white' 
                                                : 'bg-gray-200 text-gray-500'
                                    }`}>
                                        {currentStep > index + 1 ? <FontAwesomeIcon icon={faCheckCircle} /> : index + 1}
                                    </div>
                                    <span className={`text-xs ml-2 hidden sm:block ${
                                        currentStep === index + 1 ? 'text-gray-900 font-medium' : 'text-gray-400'
                                    }`}>
                                        {label}
                                    </span>
                                    {index < stepLabels.length - 1 && (
                                        <div className={`w-8 sm:w-12 h-0.5 mx-2 ${
                                            currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-200'
                                        }`}></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                        
                        {/* ==================== STEP 1: Personal Details ==================== */}
                        {currentStep === 1 && (
                            <>
                                {/* Name */}
                                <div>
                                    <label className={`block text-xs ${styles.accent} mb-1 font-medium`}>Full Name *</label>
                                    <div className='relative'>
                                        <FontAwesomeIcon icon={faUser} className={`absolute left-3 top-1/2 -translate-y-1/2 ${styles.accent} text-sm`} />
                                        <input type='text' name='name' value={formData.name} onChange={handleChange}
                                            className={`w-full pl-10 p-2.5 border ${validationErrors.name ? 'border-red-400' : styles.border} rounded-lg text-sm focus:outline-none focus:ring-1 ${styles.focusRing}`}
                                            placeholder='John Doe' />
                                    </div>
                                    {validationErrors.name && <p className={`text-xs ${styles.error} mt-1`}>{validationErrors.name}</p>}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className={`block text-xs ${styles.accent} mb-1 font-medium`}>Email Address *</label>
                                    <div className='relative'>
                                        <FontAwesomeIcon icon={faEnvelope} className={`absolute left-3 top-1/2 -translate-y-1/2 ${styles.accent} text-sm`} />
                                        <input type='email' name='email' value={formData.email} onChange={handleChange}
                                            className={`w-full pl-10 p-2.5 border ${validationErrors.email ? 'border-red-400' : styles.border} rounded-lg text-sm focus:outline-none focus:ring-1 ${styles.focusRing}`}
                                            placeholder='john@example.com' />
                                    </div>
                                    {validationErrors.email && <p className={`text-xs ${styles.error} mt-1`}>{validationErrors.email}</p>}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className={`block text-xs ${styles.accent} mb-1 font-medium`}>Phone Number *</label>
                                    <div className='relative'>
                                        <FontAwesomeIcon icon={faPhone} className={`absolute left-3 top-1/2 -translate-y-1/2 ${styles.accent} text-sm`} />
                                        <input type='tel' name='phone' value={formData.phone} onChange={handleChange}
                                            className={`w-full pl-10 p-2.5 border ${validationErrors.phone ? 'border-red-400' : styles.border} rounded-lg text-sm focus:outline-none focus:ring-1 ${styles.focusRing}`}
                                            placeholder='+63 912 345 6789' />
                                    </div>
                                    {validationErrors.phone && <p className={`text-xs ${styles.error} mt-1`}>{validationErrors.phone}</p>}
                                </div>

                                {/* Package Type */}
                                <div>
                                    <label className={`block text-xs ${styles.accent} mb-1 font-medium`}>Package Type *</label>
                                    <div className='relative'>
                                        <FontAwesomeIcon icon={faBox} className={`absolute left-3 top-1/2 -translate-y-1/2 ${styles.accent} text-sm`} />
                                        <select 
                                            name='packageType' 
                                            value={formData.packageType} 
                                            onChange={handleChange}
                                            className={`w-full pl-10 p-2.5 border ${validationErrors.packageType ? 'border-red-400' : styles.border} rounded-lg text-sm focus:outline-none focus:ring-1 ${styles.focusRing}`}
                                        >
                                            <option value="coral">Coral Package</option>
                                            <option value="crimson">Crimson Package (Best Seller)</option>
                                            <option value="gold">Gold Package</option>
                                        </select>
                                    </div>
                                    {validationErrors.packageType && <p className={`text-xs ${styles.error} mt-1`}>{validationErrors.packageType}</p>}
                                    
                                    {/* Show package details based on selection */}
                                    {formData.packageType === 'coral' && (
                                        <div className="mt-2 p-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                                            <p className="text-xs text-amber-700 flex items-center gap-1">
                                                <span>💝</span> 1 Setup • 20-30 Edited Pictures
                                            </p>
                                        </div>
                                    )}
                                    {formData.packageType === 'crimson' && (
                                        <div className="mt-2 p-2 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
                                            <p className="text-xs text-red-700 flex items-center gap-1">
                                                <span>🔥</span> Most Popular Choice - Best Value! • 2 Setups • 30-40 Edited Pictures
                                            </p>
                                        </div>
                                    )}
                                    {formData.packageType === 'gold' && (
                                        <div className="mt-2 p-2 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                                            <p className="text-xs text-yellow-700 flex items-center gap-1">
                                                <span>👑</span> 3 Setups • 30-40 Edited Pictures
                                            </p>
                                        </div>
                                    )}
                                </div>


                                {/* Preferred Date */}
                                <div>
                                    <label className={`block text-xs ${styles.accent} mb-1 font-medium`}>Preferred Date *</label>
                                    <button type="button" onClick={() => setShowCalendar(!showCalendar)}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg text-left text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white flex items-center justify-between">
                                        <span className={formData.preferredDate ? 'text-gray-800' : 'text-gray-400'}>
                                            {formData.preferredDate ? new Date(formData.preferredDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Select a date'}
                                        </span>
                                        <FontAwesomeIcon icon={faCalendarCheck} className="text-gray-400" />
                                    </button>
                                    {validationErrors.preferredDate && <p className={`text-xs ${styles.error} mt-1`}>{validationErrors.preferredDate}</p>}
                                </div>

                                {/* Calendar Popup */}
                                {showCalendar && (
                                    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                                        <PublicCalendar onDateSelect={handleDateSelect} selectedDate={formData.preferredDate} />
                                        <div className="p-3 border-t border-gray-200 bg-gray-50">
                                            <button type="button" onClick={() => setShowCalendar(false)}
                                                className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Close Calendar</button>
                                        </div>
                                    </div>
                                )}

                                {/* Session Selection */}
                                <div>
                                    <label className={`block text-xs ${styles.accent} mb-1 font-medium`}>Select Session Time *</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {sessionOptions.map((session) => {
                                            const isAvailable = !formData.preferredDate || availableSessions[session.value] !== false;
                                            return (
                                                <button key={session.value} type="button"
                                                    onClick={() => handleSessionSelect(session.value)}
                                                    disabled={!formData.preferredDate || !isAvailable}
                                                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-left
                                                        ${formData.sessionType === session.value ? 'border-gray-600 bg-gray-50' : 'border-gray-200 hover:border-gray-400'}
                                                        ${(!formData.preferredDate || !isAvailable) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <FontAwesomeIcon icon={session.icon} className={formData.sessionType === session.value ? 'text-gray-600' : 'text-gray-400'} />
                                                        <span className={`text-sm font-medium ${formData.sessionType === session.value ? 'text-gray-800' : 'text-gray-600'}`}>{session.label}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">{session.time}</p>
                                                    {!isAvailable && formData.preferredDate && <p className="text-xs text-red-500 mt-1">Fully Booked</p>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {checkingAvailability && (
                                        <div className="flex items-center justify-center mt-2">
                                            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-gray-400" />
                                            <span className="text-xs text-gray-400 ml-2">Checking availability...</span>
                                        </div>
                                    )}
                                    {validationErrors.sessionType && <p className={`text-xs ${styles.error} mt-1`}>{validationErrors.sessionType}</p>}
                                </div>

                                {/* Location */}
                                <div>
                                    <label className={`block text-xs ${styles.accent} mb-1 font-medium`}>Location *</label>
                                    <div className='relative'>
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className={`absolute left-3 top-1/2 -translate-y-1/2 ${styles.accent} text-sm`} />
                                        <select name='locationType' value={formData.locationType} onChange={handleChange}
                                            className={`w-full pl-10 p-2.5 border ${validationErrors.location ? 'border-red-400' : styles.border} rounded-lg text-sm focus:outline-none focus:ring-1 ${styles.focusRing}`}>
                                            {locationOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                                        </select>
                                    </div>
                                    {formData.locationType === 'home-services' && (
                                        <div className="mt-2">
                                            <input type='text' name='locationOther' value={formData.locationOther} onChange={handleChange}
                                                placeholder="Enter your location (address, landmark, etc.)"
                                                className={`w-full p-2.5 border ${validationErrors.location ? 'border-red-400' : styles.border} rounded-lg text-sm focus:outline-none focus:ring-1 ${styles.focusRing}`} />
                                        </div>
                                    )}
                                    {validationErrors.location && <p className={`text-xs ${styles.error} mt-1`}>{validationErrors.location}</p>}
                                </div>

                                {/* Special Requests */}
                                <div>
                                    <label className={`block text-xs ${styles.accent} mb-1 font-medium`}>Special Requests (Optional)</label>
                                    <div className='relative'>
                                        <FontAwesomeIcon icon={faMessage} className={`absolute left-3 top-3 ${styles.accent} text-sm`} />
                                        <textarea name='message' value={formData.message} onChange={handleChange} rows='3'
                                            className={`w-full pl-10 p-2.5 border ${styles.border} rounded-lg text-sm focus:outline-none focus:ring-1 ${styles.focusRing} resize-none`}
                                            placeholder='Tell us about your vision, specific requirements...' />
                                    </div>
                                </div>

                                {/* Next Button */}
                                <div className="pt-2">
                                    <button type="button" onClick={nextStep}
                                        className={`w-full ${styles.buttonBg} text-white py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2`}>
                                        Continue to Payment <FontAwesomeIcon icon={faArrowRight} className='text-sm' />
                                    </button>
                                </div>
                            </>
                        )}

                        {/* ==================== STEP 2: Payment ==================== */}
                        {currentStep === 2 && (
                            <>
                                {/* Payment Method Selection */}
                                <div>
                                    <label className={`block text-xs ${styles.accent} mb-1 font-medium`}>Payment Method *</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['gcash', 'metrobank', 'securityBank'].map(method => (
                                            <button key={method} type="button"
                                                onClick={() => setPaymentMethod(method)}
                                                className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                                                    paymentMethod === method ? 'border-gray-600 bg-gray-50 text-gray-800' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                                }`}>
                                                {method === 'gcash' ? 'GCash' : method === 'metrobank' ? 'Metrobank' : 'Security Bank'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment Details */}
                                <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                                    <div className="text-center mb-4">
                                        <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                                            <FontAwesomeIcon icon={faQrcode} className="text-green-600 text-xl" />
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">20% downpayment required to reserve your slot.</p>
                                    </div>
                                    
                                    {paymentMethod === 'gcash' && (
                                        <div className="bg-white rounded-lg p-3 mb-3">
                                            <p className="text-xs font-medium text-gray-700 mb-2">GCash Details:</p>
                                            <div className="flex justify-center mb-3">
                                                <img src={gcash} alt="GCash QR" className="w-32 h-32 object-contain rounded-lg border" />
                                            </div>
                                            <p className="text-xs text-gray-600"><span className="font-medium">GCash:</span> 09161701707</p>
                                            <p className="text-xs text-gray-600"><span className="font-medium">Name:</span> Neil Aaron R. Tupaz</p>
                                        </div>
                                    )}

                                    {paymentMethod === 'metrobank' && (
                                        <div className="bg-white rounded-lg p-3 mb-3">
                                            <p className="text-xs font-medium text-gray-700 mb-2">Metrobank Details:</p>
                                            <p className="text-xs text-gray-600"><span className="font-medium">Bank:</span> Metrobank</p>
                                            <p className="text-xs text-gray-600"><span className="font-medium">Account Name:</span> Neil Aaron R. Tupaz</p>
                                            <p className="text-xs text-gray-600"><span className="font-medium">Account Number:</span> 4373437602671</p>
                                        </div>
                                    )}

                                    {paymentMethod === 'securityBank' && (
                                        <div className="bg-white rounded-lg p-3 mb-3">
                                            <p className="text-xs font-medium text-gray-700 mb-2">Security Bank Details:</p>
                                            <p className="text-xs text-gray-600"><span className="font-medium">Bank:</span> Security Bank</p>
                                            <p className="text-xs text-gray-600"><span className="font-medium">Account Name:</span> Neil Aaron R. Tupaz</p>
                                            <p className="text-xs text-gray-600"><span className="font-medium">Account Number:</span> 0000064133559</p>
                                        </div>
                                    )}
                                </div>

                                {/* Transaction Reference */}
                               <div>
                                    <label className={`block text-xs ${styles.accent} mb-1 font-medium`}>Transaction Reference *</label>
                                    <div className='relative'>
                                        <FontAwesomeIcon icon={faMoneyBillWave} className={`absolute left-3 top-1/2 -translate-y-1/2 ${styles.accent} text-sm`} />
                                        <input 
                                            type='text' 
                                            name='transactionReference'  // ← THIS WAS 'phone' - FIXED!
                                            value={formData.transactionReference} 
                                            onChange={handleChange}
                                            className={`w-full pl-10 p-2.5 border ${validationErrors.transactionReference ? 'border-red-400' : styles.border} rounded-lg text-sm focus:outline-none focus:ring-1 ${styles.focusRing}`}
                                            placeholder='Ex: TXNBK24041012345678' 
                                        />
                                    </div>
                                    {validationErrors.transactionReference && <p className={`text-xs ${styles.error} mt-1`}>{validationErrors.transactionReference}</p>}
                                </div>

                                {/* Receipt Upload */}
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <label className="block text-xs text-gray-600 mb-2 font-medium">
                                        <FontAwesomeIcon icon={faUpload} className="mr-2" />
                                        Upload Payment Receipt *
                                    </label>
                                    
                                    <div onClick={() => fileInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
                                            validationErrors.receipt ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400 bg-white'
                                        }`}>
                                        <input type="file" ref={fileInputRef} onChange={handleFileSelect}
                                            accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf" className="hidden" />
                                        
                                        {!receiptFile ? (
                                            <div>
                                                <FontAwesomeIcon icon={faFileImage} className="text-gray-400 text-3xl mb-2" />
                                                <p className="text-sm text-gray-600">Click to upload receipt</p>
                                                <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WEBP, or PDF (Max 5MB)</p>
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                {receiptPreview ? (
                                                    <div className="relative">
                                                        <img src={receiptPreview} alt="Receipt" className="max-h-32 mx-auto rounded-lg" />
                                                        <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600">
                                                            <FontAwesomeIcon icon={faTimes} className="text-xs" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                                                            <span className="text-sm text-gray-700">{receiptFile.name}</span>
                                                        </div>
                                                        <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}
                                                            className="text-red-500 hover:text-red-600">
                                                            <FontAwesomeIcon icon={faTimes} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {validationErrors.receipt && <p className={`text-xs ${styles.error} mt-2`}>{validationErrors.receipt}</p>}
                                </div>

                                {/* Authorization */}
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input type="checkbox" checked={authorized} onChange={(e) => setAuthorized(e.target.checked)}
                                            className="mt-0.5 w-4 h-4 text-gray-600 rounded border-gray-300 focus:ring-gray-500" />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faShieldAlt} className="text-gray-500 text-sm" />
                                                <span className="font-medium text-gray-900 text-sm">Authorization Agreement</span>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">
                                                I authorize Maple Street Photography to contact me regarding my appointment. 
                                                I confirm the information provided is accurate.
                                            </p>
                                        </div>
                                    </label>
                                    {validationErrors.authorized && <p className={`text-xs ${styles.error} mt-2`}>{validationErrors.authorized}</p>}
                                </div>

                                {/* Messages */}
                                {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg"><p className="text-red-600 text-sm">{error}</p></div>}
                                {success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg"><p className="text-green-600 text-sm">{success}</p></div>}

                                {/* Navigation Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={prevStep}
                                        className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                        <FontAwesomeIcon icon={faArrowLeft} className='text-sm' /> Back
                                    </button>
                                    <button type='submit' disabled={loading}
                                        className={`flex-1 ${styles.buttonBg} text-white py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}>
                                        {loading ? <><FontAwesomeIcon icon={faSpinner} className="animate-spin" /> Submitting...</> : <>
                                            Submit Booking <FontAwesomeIcon icon={faPaperPlane} className='text-sm' />
                                        </>}
                                    </button>
                                </div>
                            </>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}

export default MContactModal;