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
    faM
} from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PublicCalendar from '../../components/calendar/PublicCalendar';

// QR code image
import gcash from '../../assets/qr-gcash.jpg';
import bank from '../../assets/qrbank.jpg';

function MContactModal({ isOpen, onClose, appointment }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        packageType: 'newborn',
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

    // Authorization state
    const [authorized, setAuthorized] = useState(false);
    
    const [paymentMethod, setPaymentMethod] = useState('bank');

    // Session options
    const sessionOptions = [
        { value: 'morning', label: 'Morning Session', time: '10:00 AM - 12:00 PM', icon: faSun },
        { value: 'afternoon', label: 'Afternoon Session', time: '3:00 PM - 5:00 PM', icon: faCloudSun }
    ];

    // Location options
    const locationOptions = [
        { value: 'studio', label: ' In-Studio Session' },
        { value: 'home-services', label: ' Home Services' },
    ];

    // Fetch available sessions when date changes
    useEffect(() => {
        if (formData.preferredDate) {
            fetchAvailableSessions(formData.preferredDate);
        } else {
            setAvailableSessions({ morning: true, afternoon: true });
        }
    }, [formData.preferredDate]);

    // Clean up preview URL when component unmounts or modal closes
    useEffect(() => {
        if (!isOpen) {
            if (receiptPreview) {
                URL.revokeObjectURL(receiptPreview);
            }
            setReceiptFile(null);
            setReceiptPreview(null);
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

    // Check session availability for final submission verification
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

    // Handle file selection
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

    // Remove selected file
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
            if (value !== 'other') {
                setFormData(prev => ({ ...prev, locationOther: '' }));
            }
            if (value !== 'outdoor') {
                setFormData(prev => ({ ...prev, locationOutdoor: '' }));
            }
            if (value !== 'client-home') {
                setFormData(prev => ({ ...prev, locationClientHome: '' }));
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
        if (formData.locationType === 'other') {
            return formData.locationOther?.trim() || 'Other Location';
        }
        if (formData.locationType === 'outdoor') {
            return formData.locationOutdoor?.trim() || 'Outdoor Location';
        }
        if (formData.locationType === 'client-home') {
            return formData.locationClientHome?.trim() || 'Client\'s Home';
        }
        const location = locationOptions.find(opt => opt.value === formData.locationType);
        return location ? location.label : 'Studio Session';
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.name?.trim()) errors.name = 'Please enter your name';
        if (!formData.email?.trim()) errors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Please enter a valid email address';
        if (!formData.phone?.trim()) errors.phone = 'Please enter your phone number';
        if (!formData.packageType) errors.packageType = 'Please select a package type';
        
        if (!formData.preferredDate) {
            errors.preferredDate = 'Please select a preferred date';
        }
        
        if (!formData.sessionType) {
            errors.sessionType = 'Please select a session time';
        }
        
        if (!formData.locationType) {
            errors.location = 'Please select a location';
        } else if (formData.locationType === 'other' && !formData.locationOther?.trim()) {
            errors.location = 'Please enter the location';
        } else if (formData.locationType === 'outdoor' && !formData.locationOutdoor?.trim()) {
            errors.location = 'Please enter the outdoor location';
        } else if (formData.locationType === 'client-home' && !formData.locationClientHome?.trim()) {
            errors.location = 'Please enter the client home location';
        }

        if (!formData.transactionReference?.trim()) errors.transactionReference = 'Please enter the transaction reference';
        
        // Add authorization validation
        if (!authorized) {
            errors.authorized = 'Please authorize to proceed';
        }
        
        // Add receipt validation
        if (!receiptFile) {
            errors.receipt = 'Please upload your payment receipt';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const availability = await checkSessionAvailability(formData.preferredDate, formData.sessionType);
        
        if (!availability.isAvailable) {
            setError(`This session is no longer available. Please select another time.`);
            setFormData(prev => ({ ...prev, sessionType: '' }));
            fetchAvailableSessions(formData.preferredDate);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const finalLocation = getFinalLocation();
            const session = sessionOptions.find(s => s.value === formData.sessionType);
            const [startTime, endTime] = session.time.split(' - ');
            
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
                    receiptUrl = uploadResult.fileUrl;
                } else {
                    throw new Error('Failed to upload receipt');
                }
            }
            
            const response = await fetch(`http://localhost:5000/api/appointments/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    phone: formData.phone.trim(),
                    packageType: formData.packageType,
                    preferredDate: formData.preferredDate,
                    preferredTime: startTime,
                    endTime: endTime,
                    durationHours: 2,
                    location: finalLocation,
                    specialRequests: formData.message.trim() || '',
                    sessionType: formData.sessionType,    
                    transactionReference: formData.transactionReference.trim() || '',
                    paymentMethod: paymentMethod,
                    receiptUrl: receiptUrl
                }),
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.message || 'Failed to create appointment');

            if (result.success) {
                setSuccess('Appointment submitted successfully! Your receipt has been uploaded. We will verify your payment and confirm your booking within 24 hours.');
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

    const packageOptions = [
        { value: 'newborn', label: 'Newborn Session' },
        { value: 'maternity', label: 'Maternity Session' },
    ];

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

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose}></div>
            
            <div className="flex min-h-full items-center justify-center p-4">
                <div className={`relative w-full max-w-md ${styles.bg} rounded-xl shadow-2xl flex flex-col max-h-[90vh]`}>
                    {/* Header */}
                    <div className={`flex items-center justify-between p-5 ${styles.headerBg} rounded-t-xl border-b ${styles.border} flex-shrink-0`}>
                        <div className='flex items-center gap-2'>
                            <FontAwesomeIcon icon={faCalendarCheck} className={styles.accent} />
                            <h3 className={`text-lg font-light ${styles.text}`}>Book a Photography Session</h3>
                        </div>
                        <button onClick={onClose} className={`p-1 rounded-full hover:bg-gray-100 transition-colors ${styles.accent}`}>
                            <FontAwesomeIcon icon={faXmark} className='text-xl' />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
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
                                <select name='packageType' value={formData.packageType} onChange={handleChange}
                                    className={`w-full pl-10 p-2.5 border ${validationErrors.packageType ? 'border-red-400' : styles.border} rounded-lg text-sm focus:outline-none focus:ring-1 ${styles.focusRing}`}>
                                    {packageOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>
                            {validationErrors.packageType && <p className={`text-xs ${styles.error} mt-1`}>{validationErrors.packageType}</p>}
                        </div>

                        {/* Preferred Date */}
                        <div>
                            <label className={`block text-xs ${styles.accent} mb-1 font-medium`}>Preferred Date *</label>
                            <button
                                type="button"
                                onClick={() => setShowCalendar(!showCalendar)}
                                className="w-full p-2.5 border border-gray-300 rounded-lg text-left text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white flex items-center justify-between"
                            >
                                <span className={formData.preferredDate ? 'text-gray-800' : 'text-gray-400'}>
                                    {formData.preferredDate ? new Date(formData.preferredDate).toLocaleDateString() : 'Select a date'}
                                </span>
                                <FontAwesomeIcon icon={faCalendarCheck} className="text-gray-400" />
                            </button>
                            {validationErrors.preferredDate && (
                                <div className="flex items-center gap-1 mt-1">
                                    <FontAwesomeIcon icon={faBan} className="text-red-500 text-xs" />
                                    <p className={`text-xs ${styles.error}`}>{validationErrors.preferredDate}</p>
                                </div>
                            )}
                        </div>

                        {/* Calendar Popup */}
                        {showCalendar && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                                <PublicCalendar 
                                    onDateSelect={handleDateSelect}
                                    selectedDate={formData.preferredDate}
                                />
                                <div className="p-3 border-t border-gray-200 bg-gray-50">
                                    <button
                                        type="button"
                                        onClick={() => setShowCalendar(false)}
                                        className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                                    >
                                        Close Calendar
                                    </button>
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
                                        <button
                                            key={session.value}
                                            type="button"
                                            onClick={() => handleSessionSelect(session.value)}
                                            disabled={!formData.preferredDate || !isAvailable}
                                            className={`
                                                p-3 rounded-lg border-2 transition-all duration-200 text-left
                                                ${formData.sessionType === session.value 
                                                    ? 'border-gray-600 bg-gray-50' 
                                                    : 'border-gray-200 hover:border-gray-400'}
                                                ${(!formData.preferredDate || !isAvailable) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                            `}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <FontAwesomeIcon 
                                                    icon={session.icon} 
                                                    className={formData.sessionType === session.value ? 'text-gray-600' : 'text-gray-400'} 
                                                />
                                                <span className={`text-sm font-medium ${formData.sessionType === session.value ? 'text-gray-800' : 'text-gray-600'}`}>
                                                    {session.label}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500">{session.time}</p>
                                            {!isAvailable && formData.preferredDate && (
                                                <p className="text-xs text-red-500 mt-1">Fully Booked</p>
                                            )}
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
                            {!formData.preferredDate && (
                                <p className="text-xs text-gray-400 mt-1">Please select a date first</p>
                            )}
                        </div>

                        {/* Location Selection */}
                        <div>
                            <label className={`block text-xs ${styles.accent} mb-1 font-medium`}>Location *</label>
                            <div className='relative'>
                                <FontAwesomeIcon icon={faMapMarkerAlt} className={`absolute left-3 top-1/2 -translate-y-1/2 ${styles.accent} text-sm`} />
                                <select 
                                    name='locationType' 
                                    value={formData.locationType} 
                                    onChange={handleChange}
                                    className={`w-full pl-10 p-2.5 border ${validationErrors.location ? 'border-red-400' : styles.border} rounded-lg text-sm focus:outline-none focus:ring-1 ${styles.focusRing}`}
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
                                        name='locationClientHome'
                                        value={formData.locationClientHome || ''}
                                        onChange={handleChange}
                                        placeholder="Enter your location (address, landmark, etc.)"
                                        className={`w-full p-2.5 border ${validationErrors.location ? 'border-red-400' : styles.border} rounded-lg text-sm focus:outline-none focus:ring-1 ${styles.focusRing}`}
                                    />
                                </div>
                            )}
                            {validationErrors.location && <p className={`text-xs ${styles.error} mt-1`}>{validationErrors.location}</p>}
                        </div>

                        {/* Payment Method Selection */}
                        <div>
                            <label className={`block text-xs ${styles.accent} mb-1 font-medium`}>Payment Method *</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('bank')}
                                    className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                                        paymentMethod === 'bank' 
                                            ? 'border-gray-600 bg-gray-50 text-gray-800' 
                                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                    }`}
                                >
                                    Bank Transfer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('gcash')}
                                    className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                                        paymentMethod === 'gcash' 
                                            ? 'border-gray-600 bg-gray-50 text-gray-800' 
                                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                    }`}
                                >
                                    GCash
                                </button>
                            </div>
                        </div>

                        {/* Downpayment Image Section */}
                        <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                            <div className="text-center mb-4">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                                    <FontAwesomeIcon icon={faQrcode} className="text-green-600 text-xl" />
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                    A 20% downpayment is required to reserve your preferred date and time.
                                </p>
                                <div className="bg-blue-50 rounded-lg p-2 mb-2">
                                    <p className="text-xs text-blue-700 flex items-center justify-center gap-1">
                                        <FontAwesomeIcon icon={faClock} className="text-xs" />
                                        Your slot will be held for 24 hours while we verify your payment
                                    </p>
                                </div>
                            </div>
                            
                            {/* Payment Details based on selection */}
                            {paymentMethod === 'bank' && (
                                <div className="bg-white rounded-lg p-3 mb-3">
                                    <p className="text-xs font-medium text-gray-700 mb-2">Bank Transfer Details:</p>
                                    <div className="space-y-1 text-xs">
                                         <div className="flex justify-center mb-4">
                                            <div className="bg-white p-3 rounded-xl shadow-md">
                                                <img 
                                                    src={bank} 
                                                    alt="Payment QR Code" 
                                                    className="w-40 h-40 object-contain"
                                                />
                                            </div>
                                        </div>
                                        <p className="text-gray-600"><span className="font-medium">Bank:</span> UnionBank</p>
                                        <p className="text-gray-600"><span className="font-medium">Account Name:</span> Maple Street Photography</p>
                                        <p className="text-gray-600"><span className="font-medium">Account Number:</span> 1234-5678-9012</p>
                                    </div>
                                </div>
                            )}
                            
                            {paymentMethod === 'gcash' && (
                                <div className="bg-white rounded-lg p-3 mb-3">
                                    <p className="text-xs font-medium text-gray-700 mb-2">GCash Details:</p>
                                    <div className="space-y-1 text-xs">
                                         <div className="flex justify-center mb-4">
                                            <div className="bg-white p-3 rounded-xl shadow-md">
                                                <img 
                                                    src={gcash} 
                                                    alt="Payment QR Code" 
                                                    className="w-40 h-40 object-contain"
                                                />
                                            </div>
                                        </div>
                                        <p className="text-gray-600"><span className="font-medium">GCash Number:</span> 0916 170 1707</p>
                                        <p className="text-gray-600"><span className="font-medium">Account Name:</span> Maple Street Photography</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Receipt Upload Section */}
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <label className="block text-xs text-gray-600 mb-2 font-medium">
                                <FontAwesomeIcon icon={faUpload} className="mr-2" />
                                Upload Payment Receipt/Proof *
                            </label>
                            
                            <div 
                                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
                                    validationErrors.receipt ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400 bg-white'
                                }`}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                                    className="hidden"
                                />
                                
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
                                                <img src={receiptPreview} alt="Receipt preview" className="max-h-32 mx-auto rounded-lg" />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveFile();
                                                    }}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                                >
                                                    <FontAwesomeIcon icon={faTimes} className="text-xs" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                                                    <span className="text-sm text-gray-700">{receiptFile.name}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveFile();
                                                    }}
                                                    className="text-red-500 hover:text-red-600"
                                                >
                                                    <FontAwesomeIcon icon={faTimes} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            
                            {validationErrors.receipt && (
                                <p className={`text-xs ${styles.error} mt-2`}>{validationErrors.receipt}</p>
                            )}
                            
                            <div className="mt-2 p-2 bg-yellow-100 rounded-lg">
                                <p className="text-xs text-yellow-800 text-center">
                                    ⚠️ Please upload a clear screenshot or photo of your payment transaction
                                </p>
                            </div>
                             <div>
                            <label className={`block text-xs ${styles.accent} mb-1 font-medium`}>Transaction reference *</label>
                            <div className='relative'>
                                <FontAwesomeIcon icon={faMoneyBillWave} className={`absolute left-3 top-1/2 -translate-y-1/2 ${styles.accent} text-sm`} />
                                <input type='tel' name='phone' value={formData.phone} onChange={handleChange}
                                    className={`w-full pl-10 p-2.5 border ${validationErrors.phone ? 'border-red-400' : styles.border} rounded-lg text-sm focus:outline-none focus:ring-1 ${styles.focusRing}`}
                                    placeholder='Ex: TXNBK24041012345678 ' />
                            </div>
                            {validationErrors.transactionReference && <p className={`text-xs ${styles.error} mt-1`}>{validationErrors.transactionReference}</p>}
                        </div>
                        </div>

                        {/* Special Requests */}
                        <div>
                            <label className={`block text-xs ${styles.accent} mb-1 font-medium`}>Special Requests (Optional)</label>
                            <div className='relative'>
                                <FontAwesomeIcon icon={faMessage} className={`absolute left-3 top-3 ${styles.accent} text-sm`} />
                                <textarea name='message' value={formData.message} onChange={handleChange} rows='3'
                                    className={`w-full pl-10 p-2.5 border ${styles.border} rounded-lg text-sm focus:outline-none focus:ring-1 ${styles.focusRing} resize-none`}
                                    placeholder='Tell us about your vision, specific requirements, or any special requests...' />
                            </div>
                        </div>

                        {/* Authorization Agreement */}
                        <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={authorized}
                                    onChange={(e) => setAuthorized(e.target.checked)}
                                    className="mt-0.5 w-4 h-4 text-gray-600 rounded border-gray-300 focus:ring-gray-500"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faShieldAlt} className="text-gray-500 text-sm" />
                                        <span className="font-medium text-gray-900 text-sm">Authorization Agreement</span>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">
                                        I authorize Maple Street Photography to contact me regarding my appointment booking. 
                                        I confirm that the information provided is accurate and complete to the best of my knowledge.
                                    </p>
                                </div>
                            </label>
                            {validationErrors.authorized && (
                                <p className={`text-xs ${styles.error} mt-2`}>{validationErrors.authorized}</p>
                            )}
                        </div>

                        {/* Error Message */}
                        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg"><p className="text-red-600 text-sm">{error}</p></div>}
                        {success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg"><p className="text-green-600 text-sm">{success}</p></div>}

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button type='submit' disabled={loading}
                                className={`w-full ${styles.buttonBg} text-white py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}>
                                {loading ? <LoadingSpinner message="Submitting..." /> : <>
                                    Submit Booking & Receipt <FontAwesomeIcon icon={faPaperPlane} className='text-sm' />
                                </>}
                            </button>
                            <div className='text-center pt-3'>
                                <p className={`text-xs ${styles.accent}`}>We'll verify your payment and confirm your booking within 24 hours.</p>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default MContactModal;