import React, { useState, useEffect } from 'react';
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
    faShieldAlt
} from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PublicCalendar from '../../components/calendar/PublicCalendar';

function MContactModal({ isOpen, onClose, appointment }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        packageType: 'newborn',
        preferredDate: '',
        preferredTime: '',
        durationHours: '',
        locationType: 'studio',
        locationOther: '',
        message: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    
    // Calendar states
    const [showCalendar, setShowCalendar] = useState(false);
    const [availableTimeSlots, setAvailableTimeSlots] = useState({});
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [selectedTimeRange, setSelectedTimeRange] = useState({ start: '', end: '' });

    // Authorization state
    const [authorized, setAuthorized] = useState(false);

    // Location options
    const locationOptions = [
        { value: 'studio', label: ' In-Studio Session' },
        { value: 'client-home', label: ' Client\'s Home' },
        { value: 'outdoor', label: ' Outdoor Location' },
        { value: 'other', label: ' Other Location' }
    ];

    // Fetch available time slots when date changes
    useEffect(() => {
        if (formData.preferredDate) {
            fetchAvailableTimeSlots(formData.preferredDate);
        } else {
            setAvailableTimeSlots({});
        }
    }, [formData.preferredDate]);

    const fetchAvailableTimeSlots = async (date) => {
    setCheckingAvailability(true);
        try {
            console.log(`🔍 Fetching available time slots for date: ${date}`);
            const response = await fetch(`http://localhost:5000/api/appointments/available-time-slots?date=${date}`);

            if (response.ok) {
                const result = await response.json();
                console.log('📦 Available time slots response:', result);
                
                if (result.success) {
                    setAvailableTimeSlots(result.data || {});
                    
                    // Log which slots are available vs booked
                    const bookedSlots = [];
                    const availableSlotsList = [];
                    for (const [time, isAvailable] of Object.entries(result.data)) {
                        if (!isAvailable) {
                            bookedSlots.push(time);
                        } else {
                            availableSlotsList.push(time);
                        }
                    }
                    console.log('✅ Available slots:', availableSlotsList);
                    console.log('❌ Booked slots:', bookedSlots);
                }
            } else {
                console.error('❌ Failed to fetch time slots:', response.status);
            }
        } catch (error) {
            console.error('Error fetching time slots:', error);
        } finally {
            setCheckingAvailability(false);
        }
    };

    // Check time slot availability with duration (for final submission verification)
    const checkTimeSlotAvailability = async (date, time, duration) => {
        try {
            const response = await fetch(`http://localhost:5000/api/appointments/check-time-slot?date=${date}&time=${time}&durationHours=${duration}`);
            if (response.ok) {
                const result = await response.json();
                return result;
            }
            return { isAvailable: true };
        } catch (error) {
            console.error('Error checking time slot:', error);
            return { isAvailable: true };
        }
    };

    // Calculate end time based on start time and duration
    const calculateEndTime = (startTime, durationHours) => {
        if (!startTime || !durationHours) return '';
        const [hours, minutes] = startTime.split(':');
        const endHour = parseInt(hours) + parseInt(durationHours);
        return `${endHour.toString().padStart(2, '0')}:${minutes}`;
    };

    // Update time range when time or duration changes
    useEffect(() => {
        if (formData.preferredTime && formData.durationHours) {
            const endTime = calculateEndTime(formData.preferredTime, formData.durationHours);
            setSelectedTimeRange({
                start: formData.preferredTime,
                end: endTime
            });
        } else {
            setSelectedTimeRange({ start: '', end: '' });
        }
    }, [formData.preferredTime, formData.durationHours]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
        
        // Clear time selection when duration changes
        if (name === 'durationHours') {
            setFormData(prev => ({ ...prev, preferredTime: '' }));
            setSelectedTimeRange({ start: '', end: '' });
        }
        
        // Reset other location when location type changes
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
        
        setFormData(prev => ({ ...prev, preferredDate: dateString, preferredTime: '' }));
        setShowCalendar(false);
        setSelectedTimeRange({ start: '', end: '' });
        if (validationErrors.preferredDate) {
            setValidationErrors(prev => ({ ...prev, preferredDate: '' }));
        }
        setError('');
    };

    // SIMPLIFIED: No extra API call - dropdown already shows disabled options
    const handleTimeSelect = (time) => {
        if (!formData.durationHours) {
            setError('Please select duration hours first');
            return;
        }
        
        // Just set the time - no extra availability check needed
        setFormData(prev => ({ ...prev, preferredTime: time }));
        if (validationErrors.preferredTime) {
            setValidationErrors(prev => ({ ...prev, preferredTime: '' }));
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
        
        if (!formData.preferredTime) {
            errors.preferredTime = 'Please select a preferred time';
        }
        
        if (!formData.durationHours) {
            errors.durationHours = 'Please enter duration hours';
        } else if (isNaN(formData.durationHours) || formData.durationHours <= 0) {
            errors.durationHours = 'Duration must be a positive number';
        } else if (formData.durationHours > 8) {
            errors.durationHours = 'Maximum duration is 8 hours';
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
        
        // Add authorization validation
        if (!authorized) {
            errors.authorized = 'Please authorize to proceed';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        // Final verification before submission (prevents race conditions)
        const availability = await checkTimeSlotAvailability(formData.preferredDate, formData.preferredTime, formData.durationHours);
        
        if (!availability.isAvailable) {
            setError(`This time slot is no longer available. Please select another time.`);
            setFormData(prev => ({ ...prev, preferredTime: '' }));
            setSelectedTimeRange({ start: '', end: '' });
            // Refresh available time slots
            fetchAvailableTimeSlots(formData.preferredDate);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const finalLocation = getFinalLocation();
            
            const response = await fetch(`http://localhost:5000/api/appointments/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    phone: formData.phone.trim(),
                    packageType: formData.packageType,
                    preferredDate: formData.preferredDate,
                    preferredTime: formData.preferredTime,
                    durationHours: parseInt(formData.durationHours),
                    location: finalLocation,
                    specialRequests: formData.message.trim() || ''
                }),
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.message || 'Failed to create appointment');

            if (result.success) {
                setSuccess('Appointment submitted successfully! We will contact you within 24 hours.');
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
        { value: 'family', label: 'Family Session' },
        { value: 'milestone', label: 'Milestone Session' },
        { value: 'portrait', label: 'Portrait Session' },
        { value: 'custom', label: 'Custom Package' }
    ];

    // Generate time slots in 30-minute intervals
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 9; hour <= 20; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                if (timeString >= '09:00' && timeString <= '20:00') {
                    slots.push(timeString);
                }
            }
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

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

                        {/* Duration Hours */}
                        <div>
                            <label className={`block text-xs ${styles.accent} mb-1 font-medium`}>Duration (Hours) *</label>
                            <select 
                                name='durationHours' 
                                value={formData.durationHours} 
                                onChange={handleChange}
                                className={`w-full p-2.5 border ${validationErrors.durationHours ? 'border-red-400' : styles.border} rounded-lg text-sm focus:outline-none focus:ring-1 ${styles.focusRing}`}
                            >
                                <option value=''>Select duration</option>
                                <option value='1'>1 hour</option>
                                <option value='2'>2 hours</option>
                                <option value='3'>3 hours</option>
                                <option value='4'>4 hours</option>
                                <option value='5'>5 hours</option>
                                <option value='6'>6 hours</option>
                                <option value='7'>7 hours</option>
                                <option value='8'>8 hours</option>
                            </select>
                            {validationErrors.durationHours && <p className={`text-xs ${styles.error} mt-1`}>{validationErrors.durationHours}</p>}
                            <p className="text-xs text-gray-400 mt-1">Select how many hours you need for the session</p>
                        </div>

                        {/* Preferred Time */}
                        <div>
                            <label className={`block text-xs ${styles.accent} mb-1 font-medium`}>Preferred Time *</label>
                            <div className='relative'>
                                <FontAwesomeIcon icon={faClock} className={`absolute left-3 top-1/2 -translate-y-1/2 ${styles.accent} text-sm`} />
                                <select 
                                    name='preferredTime' 
                                    value={formData.preferredTime} 
                                    onChange={(e) => handleTimeSelect(e.target.value)}
                                    disabled={!formData.preferredDate || !formData.durationHours || checkingAvailability}
                                    className={`w-full pl-10 p-2.5 border ${validationErrors.preferredTime ? 'border-red-400' : styles.border} rounded-lg text-sm focus:outline-none focus:ring-1 ${styles.focusRing} ${(!formData.preferredDate || !formData.durationHours) ? 'bg-gray-100 cursor-not-allowed' : ''}`}>
                                    <option value=''>Select a time</option>
                                    {timeSlots.map(time => {
                                        const isAvailable = availableTimeSlots[time] !== false;
                                        return (
                                            <option 
                                                key={time} 
                                                value={time}
                                                disabled={!isAvailable}
                                            >
                                                {time} {!isAvailable && '(Booked)'}
                                            </option>
                                        );
                                    })}
                                </select>
                                {checkingAvailability && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-gray-400" />
                                    </div>
                                )}
                            </div>
                            {validationErrors.preferredTime && <p className={`text-xs ${styles.error} mt-1`}>{validationErrors.preferredTime}</p>}
                            {(!formData.preferredDate || !formData.durationHours) && (
                                <p className="text-xs text-gray-400 mt-1">Please select a date and duration first</p>
                            )}
                            
                            {/* Time Range Display */}
                            {selectedTimeRange.start && selectedTimeRange.end && (
                                <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-xs text-blue-700 flex items-center gap-1">
                                        <FontAwesomeIcon icon={faClock} className="text-xs" />
                                        Your session will be from <strong>{selectedTimeRange.start}</strong> to <strong>{selectedTimeRange.end}</strong>
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Location Selection - Dropdown with conditional input */}
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
                            
                            {formData.locationType === 'outdoor' && (
                                <div className="mt-2">
                                    <input
                                        type='text'
                                        name='locationOutdoor'
                                        value={formData.locationOutdoor || ''} 
                                        onChange={handleChange}
                                        placeholder="Enter your location (address, landmark, etc.)"
                                        className={`w-full p-2.5 border ${validationErrors.location ? 'border-red-400' : styles.border} rounded-lg text-sm focus:outline-none focus:ring-1 ${styles.focusRing}`}
                                    />
                                </div>
                            )}
                            
                            {formData.locationType === 'client-home' && (
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
                            
                            {/* Conditional input for "Other" location */}
                            {formData.locationType === 'other' && (
                                <div className="mt-2">
                                    <input
                                        type='text'
                                        name='locationOther'
                                        value={formData.locationOther}
                                        onChange={handleChange}
                                        placeholder="Enter your location (address, landmark, etc.)"
                                        className={`w-full p-2.5 border ${validationErrors.location ? 'border-red-400' : styles.border} rounded-lg text-sm focus:outline-none focus:ring-1 ${styles.focusRing}`}
                                    />
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
                                    Book Appointment <FontAwesomeIcon icon={faPaperPlane} className='text-sm' />
                                </>}
                            </button>
                            <div className='text-center pt-3'>
                                <p className={`text-xs ${styles.accent}`}>We'll confirm your appointment within 24 hours via email or phone.</p>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default MContactModal;