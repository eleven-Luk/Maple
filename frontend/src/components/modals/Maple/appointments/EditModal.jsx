import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUser,
    faEnvelope,
    faPhone,
    faComment,
    faSave,
    faUserCheck,
    faCalendarAlt,
    faClock,
    faMapMarkerAlt,
    faBox,
    faCamera,
    faPaperPlane,
    faEnvelope as faEnvelopeSolid,
    faCheckCircle,
    faSpinner,
    faBan,
    faCalendarWeek
} from '@fortawesome/free-solid-svg-icons';
import FormModal from '../../common/FormModal';
import PublicCalendar from '../../../calendar/PublicCalendar';

function EditModal({ isOpen, onClose, onSave, appointment }) {
    const [formData, setFormData] = useState({
        status: 'pending',
        notes: '',
        sendEmail: true,
        adminMessage: '',
        // Reschedule fields
        rescheduleDate: '',
        rescheduleTime: '',
        rescheduleDuration: '',
        showRescheduleFields: false
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Calendar states for reschedule
    const [showCalendar, setShowCalendar] = useState(false);
    const [availableTimeSlots, setAvailableTimeSlots] = useState({});
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [selectedTimeRange, setSelectedTimeRange] = useState({ start: '', end: '' });

    const resetForm = () => {
        setFormData({
            status: 'pending',
            notes: '',
            sendEmail: true,
            adminMessage: '',
            rescheduleDate: '',
            rescheduleTime: '',
            rescheduleDuration: '',
            showRescheduleFields: false
        });
        setShowCalendar(false);
        setSelectedTimeRange({ start: '', end: '' });
        setError('');
        setSuccess('');
        setLoading(false);
    };

    useEffect(() => {
        if (appointment && isOpen) {
            setFormData({
                status: appointment.status || 'pending',
                notes: appointment.notes || '',
                sendEmail: true,
                adminMessage: '',
                rescheduleDate: '',
                rescheduleTime: '',
                rescheduleDuration: appointment.durationHours || '',
                showRescheduleFields: false
            });
        } else if (!isOpen) {
            resetForm();
        }
    }, [appointment, isOpen]);

    // Fetch available time slots when reschedule date changes
    useEffect(() => {
        if (formData.showRescheduleFields && formData.rescheduleDate) {
            fetchAvailableTimeSlots(formData.rescheduleDate);
        } else {
            setAvailableTimeSlots({});
        }
    }, [formData.rescheduleDate, formData.showRescheduleFields]);

    const fetchAvailableTimeSlots = async (date) => {
        setCheckingAvailability(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/appointments/available-time-slots?date=${date}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setAvailableTimeSlots(result.data || {});
                }
            }
        } catch (error) {
            console.error('Error fetching time slots:', error);
        } finally {
            setCheckingAvailability(false);
        }
    };

    // Check time slot availability with duration
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

    // Calculate end time
    const calculateEndTime = (startTime, durationHours) => {
        if (!startTime || !durationHours) return '';
        const [hours, minutes] = startTime.split(':');
        const endHour = parseInt(hours) + parseInt(durationHours);
        return `${endHour.toString().padStart(2, '0')}:${minutes}`;
    };

    // Update time range
    useEffect(() => {
        if (formData.rescheduleTime && formData.rescheduleDuration) {
            const endTime = calculateEndTime(formData.rescheduleTime, formData.rescheduleDuration);
            setSelectedTimeRange({
                start: formData.rescheduleTime,
                end: endTime
            });
        } else {
            setSelectedTimeRange({ start: '', end: '' });
        }
    }, [formData.rescheduleTime, formData.rescheduleDuration]);

    const validateForm = () => {
        if (!formData.status) {
            setError('Status is required');
            return false;
        }
        
        // Validate reschedule fields if rescheduling
        if (formData.status === 'rescheduled' && formData.showRescheduleFields) {
            if (!formData.rescheduleDate) {
                setError('Please select a new date for rescheduling');
                return false;
            }
            if (!formData.rescheduleTime) {
                setError('Please select a new time for rescheduling');
                return false;
            }
            if (!formData.rescheduleDuration) {
                setError('Please select duration for rescheduled appointment');
                return false;
            }
        }
        
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;
        
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const appointmentData = { 
                status: formData.status,
                notes: formData.notes,
                sendEmail: formData.sendEmail,
                adminMessage: formData.adminMessage
            };
            
            // Add reschedule data if status is rescheduled
            if (formData.status === 'rescheduled' && formData.showRescheduleFields) {
                // Check availability first
                const availability = await checkTimeSlotAvailability(
                    formData.rescheduleDate, 
                    formData.rescheduleTime, 
                    formData.rescheduleDuration
                );
                
                if (!availability.isAvailable) {
                    setError(`The selected time slot is not available. ${availability.conflictingTime ? `Conflicts with booking from ${availability.conflictingTime}` : ''}`);
                    setLoading(false);
                    return;
                }
                
                appointmentData.rescheduleDate = formData.rescheduleDate;
                appointmentData.rescheduleTime = formData.rescheduleTime;
                appointmentData.rescheduleDuration = formData.rescheduleDuration;
            }

            await onSave(appointmentData);
            
            if (formData.sendEmail && formData.status !== appointment?.status) {
                setSuccess('Appointment updated and email notification sent!');
            } else {
                setSuccess('Appointment updated successfully');
            }

            setTimeout(() => {
                setSuccess('');
                onClose();
            }, 2000);

        } catch (error) {
            setError(error.message || 'Failed to update appointment');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // When status changes to rescheduled, show reschedule fields
        if (name === 'status') {
            setFormData(prev => ({
                ...prev,
                status: value,
                showRescheduleFields: value === 'rescheduled',
                rescheduleDate: '',
                rescheduleTime: '',
                rescheduleDuration: prev.rescheduleDuration
            }));
            setSelectedTimeRange({ start: '', end: '' });
            setShowCalendar(false);
        }
        
        if (error) {
            setError('');
        }
    };

    const handleDateSelect = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        
        setFormData(prev => ({ 
            ...prev, 
            rescheduleDate: dateString, 
            rescheduleTime: '' 
        }));
        setShowCalendar(false);
        setSelectedTimeRange({ start: '', end: '' });
        setError('');
    };

    const handleTimeSelect = async (time) => {
        if (!formData.rescheduleDuration) {
            setError('Please select duration first');
            return;
        }
        
        const availability = await checkTimeSlotAvailability(formData.rescheduleDate, time, formData.rescheduleDuration);
        
        if (!availability.isAvailable) {
            setError(`This time slot is not available. ${availability.conflictingTime ? `Conflicts with booking from ${availability.conflictingTime}` : ''}`);
            setTimeout(() => setError(''), 3000);
            return;
        }
        
        setFormData(prev => ({ ...prev, rescheduleTime: time }));
        if (error) setError('');
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
            completed: 'bg-green-100 text-green-800 border-green-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200',
            rescheduled: 'bg-purple-100 text-purple-800 border-purple-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatPackageType = (type) => {
        const typeMap = {
            'newborn': 'Newborn Session',
            'maternity': 'Maternity Session',
            'family': 'Family Session',
            'milestone': 'Milestone Session',
            'portrait': 'Portrait Session',
            'custom': 'Custom Package'
        };
        return typeMap[type?.toLowerCase()] || type || 'N/A';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Generate time slots
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

    return (
        <FormModal 
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={handleSubmit}
            title="Update Appointment"
            subtitle={`Client: ${appointment?.name || ''}`}
            loading={loading}
            error={error}
            success={success}
            submitText="Update & Send Notification"
            submitIcon={faPaperPlane}
            maxWidth="max-w-lg"
            icon={faCamera}
            iconColor="text-gray-500"
        >
            {/* Appointment Details */}
            {appointment && (
                <div className='mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200'>
                    <div className='flex items-center gap-3 mb-3'>
                        <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center'>
                            <FontAwesomeIcon icon={faUser} className='text-lg text-gray-500' />
                        </div>
                        <div>
                            <h3 className='font-semibold text-gray-900'>
                                {appointment.name}
                            </h3>
                            <p className='text-sm text-gray-500'>
                                {formatPackageType(appointment.packageType)}
                            </p>
                        </div>
                    </div>

                    <div className='grid grid-cols-2 gap-2 text-sm'>
                        <div className='flex items-center gap-2'>
                            <FontAwesomeIcon icon={faEnvelope} className='text-gray-400 text-xs' />
                            <span className='text-gray-600'>{appointment.email}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                            <FontAwesomeIcon icon={faPhone} className='text-gray-400 text-xs' />
                            <span className='text-gray-600'>{appointment.phone}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                            <FontAwesomeIcon icon={faCalendarAlt} className='text-gray-400 text-xs' />
                            <span className='text-gray-600'>{formatDate(appointment.preferredDate)}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                            <FontAwesomeIcon icon={faClock} className='text-gray-400 text-xs' />
                            <span className='text-gray-600'>{appointment.preferredTime} ({appointment.durationHours}h)</span>
                        </div>
                        <div className='flex items-center gap-2 col-span-2'>
                            <FontAwesomeIcon icon={faMapMarkerAlt} className='text-gray-400 text-xs' />
                            <span className='text-gray-600'>{appointment.location}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Current status display */}
            <div className='mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                        <FontAwesomeIcon icon={faUserCheck} className='text-gray-500' />
                        <span className='text-sm font-medium text-gray-700'>Current Status:</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium 
                        ${getStatusColor(appointment?.status)}`}>
                        {appointment?.status?.toUpperCase() || 'N/A'}
                    </span>
                </div>
                {appointment?.preferredDate && appointment?.status !== 'rescheduled' && (
                    <div className="mt-2 text-xs text-gray-500">
                        <FontAwesomeIcon icon={faCalendarWeek} className="mr-1" />
                        Current: {formatDate(appointment.preferredDate)} at {appointment.preferredTime}
                    </div>
                )}
            </div>

            {/* Status selection */}
            <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                    <FontAwesomeIcon icon={faUserCheck} className='mr-2 text-gray-400' />
                    Update Status *
                </label>
                <select 
                    name="status" 
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400/20 focus:border-gray-400 transition-all bg-gray-50/50"
                    disabled={loading}
                    required
                >
                    <option value="pending">📋 Pending</option>
                    <option value="confirmed">✓ Confirmed</option>
                    <option value="completed">✅ Completed</option>
                    <option value="cancelled">❌ Cancelled</option>
                    <option value="rescheduled">🔄 Rescheduled</option>
                </select>
            </div>

            {/* Reschedule Fields - Only show when status is rescheduled */}
            {formData.showRescheduleFields && (
                <div className="space-y-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                        <FontAwesomeIcon icon={faCalendarWeek} className="text-purple-600" />
                        <h4 className="font-medium text-purple-800">Reschedule Appointment</h4>
                    </div>
                    
                    {/* New Date */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                            New Date *
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowCalendar(!showCalendar)}
                            className="w-full p-3 border border-gray-300 rounded-lg text-left text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white flex items-center justify-between"
                        >
                            <span className={formData.rescheduleDate ? 'text-gray-800' : 'text-gray-400'}>
                                {formData.rescheduleDate ? new Date(formData.rescheduleDate).toLocaleDateString() : 'Select a new date'}
                            </span>
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
                        </button>
                    </div>

                    {/* Calendar Popup */}
                    {showCalendar && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                            <PublicCalendar 
                                onDateSelect={handleDateSelect}
                                selectedDate={formData.rescheduleDate}
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

                    {/* Duration */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Duration (Hours) *
                        </label>
                        <select 
                            name='rescheduleDuration' 
                            value={formData.rescheduleDuration} 
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:border-purple-400 transition-all bg-white"
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
                    </div>

                    {/* Time Selection */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                            New Time *
                        </label>
                        <div className='relative'>
                            <FontAwesomeIcon icon={faClock} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                            <select 
                                value={formData.rescheduleTime} 
                                onChange={(e) => handleTimeSelect(e.target.value)}
                                disabled={!formData.rescheduleDate || !formData.rescheduleDuration || checkingAvailability}
                                className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:border-purple-400 transition-all bg-white"
                            >
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
                        {(!formData.rescheduleDate || !formData.rescheduleDuration) && (
                            <p className="text-xs text-gray-400 mt-1">Please select a date and duration first</p>
                        )}
                    </div>

                    {/* Time Range Display */}
                    {selectedTimeRange.start && selectedTimeRange.end && (
                        <div className="mt-2 p-3 bg-purple-100 rounded-lg border border-purple-200">
                            <p className="text-xs text-purple-700 flex items-center gap-1">
                                <FontAwesomeIcon icon={faClock} className="text-xs" />
                                Rescheduled session will be from <strong>{selectedTimeRange.start}</strong> to <strong>{selectedTimeRange.end}</strong>
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Admin Notes (Internal) */}
            <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                    <FontAwesomeIcon icon={faComment} className='mr-2 text-gray-400' />
                    Internal Notes
                </label>
                <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Add internal notes about this appointment (only visible to admins)..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400/20 focus:border-gray-400 transition-all bg-gray-50/50 resize-none"
                    disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-2">
                    These notes are for internal use only
                </p>
            </div>

            {/* Send Email Notification Toggle */}
            {formData.status !== appointment?.status && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            name="sendEmail"
                            checked={formData.sendEmail}
                            onChange={handleChange}
                            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faEnvelopeSolid} className="text-blue-600" />
                                <span className="font-medium text-gray-900">Send email notification to client</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                Notify {appointment?.name} about this status change
                            </p>
                        </div>
                    </label>
                </div>
            )}

            {/* Admin Message for Email */}
            {formData.sendEmail && formData.status !== appointment?.status && (
                <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                        <FontAwesomeIcon icon={faPaperPlane} className='mr-2 text-gray-400' />
                        Personal Message to Client (Optional)
                    </label>
                    <textarea
                        name="adminMessage"
                        value={formData.adminMessage}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Add a personal message to include in the email notification..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400/20 focus:border-gray-400 transition-all bg-gray-50/50 resize-none"
                        disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        This message will be included in the email sent to the client
                    </p>
                </div>
            )}

            {/* Status Change Preview */}
            {formData.status !== appointment?.status && appointment && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-start gap-2">
                        <FontAwesomeIcon icon={faPaperPlane} className="text-blue-600 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-blue-800 mb-1">Notification Preview</p>
                            <p className="text-xs text-blue-700">
                                Status will change from <strong>{appointment?.status?.toUpperCase()}</strong> to <strong>{formData.status.toUpperCase()}</strong>
                                {formData.sendEmail && (
                                    <span className="block mt-1">
                                        📧 Email will be sent to: <strong>{appointment?.email}</strong>
                                    </span>
                                )}
                                {formData.status === 'rescheduled' && formData.rescheduleDate && (
                                    <span className="block mt-2">
                                        📅 New date: <strong>{new Date(formData.rescheduleDate).toLocaleDateString()}</strong> at <strong>{formData.rescheduleTime}</strong>
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </FormModal>
    );
}

export default EditModal;