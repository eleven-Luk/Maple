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
    faCalendarWeek,
    faSun,
    faCloudSun,
    faMoneyBillWave,
    faImage,
    faInfoCircle,
    faPercentage
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
        rescheduleSession: '',
        showRescheduleFields: false,
        // Payment fields
        downpaymentAmount: '',
        remainingAmount: '',
        totalAmount: '',
        paymentCompleted: false
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Calendar states for reschedule
    const [showCalendar, setShowCalendar] = useState(false);
    const [availableSessions, setAvailableSessions] = useState({
        morning: true,
        afternoon: true
    });
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [selectedSessionInfo, setSelectedSessionInfo] = useState(null);

    // Session options
    const sessionOptions = [
        { value: 'morning', label: 'Morning Session', time: '10:00 AM - 12:00 PM', icon: faSun },
        { value: 'afternoon', label: 'Afternoon Session', time: '3:00 PM - 5:00 PM', icon: faCloudSun }
    ];

    const resetForm = () => {
        setFormData({
            status: 'pending',
            notes: '',
            sendEmail: true,
            adminMessage: '',
            rescheduleDate: '',
            rescheduleSession: '',
            showRescheduleFields: false,
            downpaymentAmount: '',
            remainingAmount: '',
            totalAmount: '',
            paymentCompleted: false
        });
        setShowCalendar(false);
        setSelectedSessionInfo(null);
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
                rescheduleSession: '',
                showRescheduleFields: false,
                downpaymentAmount: appointment.downpaymentAmount || '',
                remainingAmount: appointment.remainingAmount || '',
                totalAmount: appointment.totalAmount || '',
                paymentCompleted: appointment.paymentCompleted || false
            });
        } else if (!isOpen) {
            resetForm();
        }
    }, [appointment, isOpen]);

    // Fetch available sessions when reschedule date changes
    useEffect(() => {
        if (formData.showRescheduleFields && formData.rescheduleDate) {
            fetchAvailableSessions(formData.rescheduleDate);
        } else {
            setAvailableSessions({ morning: true, afternoon: true });
        }
    }, [formData.rescheduleDate, formData.showRescheduleFields]);

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

    // Check session availability
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
            if (!formData.rescheduleSession) {
                setError('Please select a session (Morning or Afternoon)');
                return false;
            }
        }
        
        // Validate downpayment when confirming
        if (formData.status === 'confirmed' && !formData.downpaymentAmount) {
            setError('Please enter the downpayment amount before confirming');
            return false;
        }
        
        // Validate remaining amount when completing
        if (formData.status === 'completed' && !formData.remainingAmount && !formData.paymentCompleted) {
            setError('Please enter the remaining amount or mark payment as completed');
            return false;
        }
        
        return true;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        // When downpayment amount changes, calculate total (downpayment is 20% of total)
        if (name === 'downpaymentAmount') {
            const downpayment = parseFloat(value) || 0;
            const total = downpayment * 5; // Since downpayment is 20%, total = downpayment * 5
            const remaining = total - downpayment;
            
            setFormData(prev => ({
                ...prev,
                downpaymentAmount: downpayment,
                totalAmount: total,
                remainingAmount: remaining,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
        // When remaining amount changes (for completion)
        else if (name === 'remainingAmount') {
            const remaining = parseFloat(value) || 0;
            const downpayment = parseFloat(formData.downpaymentAmount) || 0;
            const total = downpayment + remaining;
            
            setFormData(prev => ({
                ...prev,
                remainingAmount: remaining,
                totalAmount: total,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
        else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
        
        // When status changes
        if (name === 'status') {
            setFormData(prev => ({
                ...prev,
                status: value,
                showRescheduleFields: value === 'rescheduled',
                rescheduleDate: '',
                rescheduleSession: ''
            }));
            setSelectedSessionInfo(null);
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
            rescheduleSession: '' 
        }));
        setShowCalendar(false);
        setSelectedSessionInfo(null);
        setError('');
    };

    const handleSessionSelect = async (sessionType) => {
        if (!formData.rescheduleDate) {
            setError('Please select a date first');
            return;
        }
        
        // Check availability
        const availability = await checkSessionAvailability(formData.rescheduleDate, sessionType);
        
        if (!availability.isAvailable) {
            setError(`This session is not available. Please choose another session or date.`);
            setTimeout(() => setError(''), 3000);
            return;
        }
        
        const session = sessionOptions.find(s => s.value === sessionType);
        setSelectedSessionInfo(session);
        setFormData(prev => ({ ...prev, rescheduleSession: sessionType }));
        if (error) setError('');
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
                adminMessage: formData.adminMessage,
                // Payment data
                downpaymentAmount: formData.downpaymentAmount,
                remainingAmount: formData.remainingAmount,
                totalAmount: formData.totalAmount,
                paymentCompleted: formData.paymentCompleted
            };
            
            // Add reschedule data if status is rescheduled
            if (formData.status === 'rescheduled' && formData.showRescheduleFields) {
                const availability = await checkSessionAvailability(
                    formData.rescheduleDate, 
                    formData.rescheduleSession
                );
                
                if (!availability.isAvailable) {
                    setError(`The selected session is not available. Please choose another session or date.`);
                    setLoading(false);
                    return;
                }
                
                appointmentData.rescheduleDate = formData.rescheduleDate;
                appointmentData.rescheduleSession = formData.rescheduleSession;
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
            'maternity': 'Maternity Session'
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

    const formatPaymentMethod = (method) => {
        const methods = {
            'bank': 'Bank Transfer',
            'gcash': 'GCash',
            'none': 'Not Specified'
        };
        return methods[method] || method || 'Not Specified';
    };

    const getSessionDisplay = (sessionType) => {
        if (sessionType === 'morning') {
            return 'Morning Session (10AM-12PM)';
        } else if (sessionType === 'afternoon') {
            return 'Afternoon Session (3PM-5PM)';
        }
        return 'Not Specified';
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₱0';
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0
        }).format(amount);
    };

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
                            <span className='text-gray-600'>{getSessionDisplay(appointment.sessionType)}</span>
                        </div>
                        <div className='flex items-center gap-2 col-span-2'>
                            <FontAwesomeIcon icon={faMapMarkerAlt} className='text-gray-400 text-xs' />
                            <span className='text-gray-600'>{appointment.location}</span>
                        </div>
                    </div>

                    {/* Payment Info Summary */}
                    <div className='mt-3 pt-3 border-t border-gray-200'>
                        <div className='flex items-center justify-between text-xs'>
                            <div className='flex items-center gap-2'>
                                <FontAwesomeIcon icon={faMoneyBillWave} className='text-gray-400' />
                                <span className='text-gray-500'>Payment Method:</span>
                                <span className='font-medium text-gray-700'>{formatPaymentMethod(appointment.paymentMethod)}</span>
                            </div>
                            {appointment.receiptUrl && (
                                <div className='flex items-center gap-1'>
                                    <FontAwesomeIcon icon={faImage} className='text-blue-500' />
                                    <span className='text-blue-500'>Receipt Uploaded</span>
                                </div>
                            )}
                        </div>
                        {appointment.downpaymentAmount && (
                            <div className='mt-2 text-xs'>
                                <span className='text-gray-500'>Downpayment Paid:</span>
                                <span className='font-medium text-green-600 ml-2'>{formatCurrency(appointment.downpaymentAmount)}</span>
                            </div>
                        )}
                        {appointment.totalAmount && (
                            <div className='mt-1 text-xs'>
                                <span className='text-gray-500'>Total Package:</span>
                                <span className='font-medium text-gray-700 ml-2'>{formatCurrency(appointment.totalAmount)}</span>
                            </div>
                        )}
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
                        Current: {formatDate(appointment.preferredDate)} - {getSessionDisplay(appointment.sessionType)}
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

            {/* DOWNPAYMENT SECTION - Only show when status is being changed to confirmed */}
            {formData.status === 'confirmed' && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                        <FontAwesomeIcon icon={faMoneyBillWave} className="text-blue-600" />
                        <h4 className="font-medium text-blue-800">Downpayment Information</h4>
                    </div>
                    
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Downpayment Amount (20%) - Already Paid Online (₱) *
                            </label>
                            <input
                                type="number"
                                name="downpaymentAmount"
                                value={formData.downpaymentAmount || ''}
                                onChange={handleChange}
                                placeholder="e.g., 1000"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                            />
                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                                Client already paid this amount online (receipt uploaded)
                            </p>
                        </div>
                        
                        {formData.downpaymentAmount > 0 && (
                            <div className="mt-2 p-2 bg-green-50 rounded-lg">
                                <p className="text-xs text-green-700 flex items-center gap-1">
                                    <FontAwesomeIcon icon={faInfoCircle} className="text-xs" />
                                    Total package will be calculated as: {formatCurrency(formData.downpaymentAmount)} × 5 = {formatCurrency(formData.downpaymentAmount * 5)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Remaining balance (80%): {formatCurrency((formData.downpaymentAmount * 5) - formData.downpaymentAmount)}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* REMAINING PAYMENT SECTION - Only show when status is being changed to completed */}
            {formData.status === 'completed' && (
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                        <FontAwesomeIcon icon={faMoneyBillWave} className="text-green-600" />
                        <h4 className="font-medium text-green-800">Final Payment Information</h4>
                    </div>
                    
                    <div className="space-y-3">
                        {/* Show existing downpayment info */}
                        {formData.downpaymentAmount > 0 && (
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <p className="text-xs text-blue-700">
                                    <span className="font-medium">Downpayment already paid:</span> {formatCurrency(formData.downpaymentAmount)}
                                </p>
                                <p className="text-xs text-blue-700 mt-1">
                                    <span className="font-medium">Total package price:</span> {formatCurrency(formData.totalAmount || formData.downpaymentAmount * 5)}
                                </p>
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Remaining Balance (80%) - Paid in Person (₱)
                            </label>
                            <input
                                type="number"
                                name="remainingAmount"
                                value={formData.remainingAmount || ''}
                                onChange={handleChange}
                                placeholder="e.g., 4000"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                            />
                            <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                                <FontAwesomeIcon icon={faClock} className="text-xs" />
                                Client paid this amount in person after the session
                            </p>
                        </div>
                        
                        {/* Payment Completion Checkbox */}
                        <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="paymentCompleted"
                                    checked={formData.paymentCompleted}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                                        <span className="font-medium text-gray-900">Mark Payment as Fully Completed</span>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Check this box when the client has paid the remaining balance in full
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Summary Preview - Shows when both downpayment and remaining are entered */}
            {formData.downpaymentAmount > 0 && formData.remainingAmount > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-2">Payment Summary:</p>
                    <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Downpayment (20%):</span>
                            <span className="font-medium text-green-600">{formatCurrency(formData.downpaymentAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Remaining Balance (80%):</span>
                            <span className="font-medium text-orange-600">{formatCurrency(formData.remainingAmount)}</span>
                        </div>
                        <div className="border-t border-gray-200 mt-2 pt-2">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Total Package:</span>
                                <span className="font-medium text-gray-800">{formatCurrency(formData.totalAmount)}</span>
                            </div>
                        </div>
                        {formData.paymentCompleted && (
                            <div className="flex justify-between mt-1">
                                <span className="text-gray-500">Payment Status:</span>
                                <span className="font-medium text-green-600">Fully Paid ✓</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

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

                    {/* Session Selection */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Select Session *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {sessionOptions.map((session) => {
                                const isAvailable = !formData.rescheduleDate || availableSessions[session.value] !== false;
                                return (
                                    <button
                                        key={session.value}
                                        type="button"
                                        onClick={() => handleSessionSelect(session.value)}
                                        disabled={!formData.rescheduleDate || !isAvailable}
                                        className={`
                                            p-3 rounded-lg border-2 transition-all duration-200 text-left
                                            ${formData.rescheduleSession === session.value 
                                                ? 'border-purple-600 bg-purple-50' 
                                                : 'border-gray-200 hover:border-purple-400'}
                                            ${(!formData.rescheduleDate || !isAvailable) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                        `}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <FontAwesomeIcon 
                                                icon={session.icon} 
                                                className={formData.rescheduleSession === session.value ? 'text-purple-600' : 'text-gray-400'} 
                                            />
                                            <span className={`text-sm font-medium ${formData.rescheduleSession === session.value ? 'text-purple-800' : 'text-gray-600'}`}>
                                                {session.label}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500">{session.time}</p>
                                        {!isAvailable && formData.rescheduleDate && (
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
                        {!formData.rescheduleDate && (
                            <p className="text-xs text-gray-400 mt-1">Please select a date first</p>
                        )}
                    </div>

                    {/* Selected Session Display */}
                    {selectedSessionInfo && formData.rescheduleSession && (
                        <div className="mt-2 p-3 bg-purple-100 rounded-lg border border-purple-200">
                            <p className="text-xs text-purple-700 flex items-center gap-1">
                                <FontAwesomeIcon icon={selectedSessionInfo.icon} className="text-xs" />
                                Rescheduled session: <strong>{selectedSessionInfo.label}</strong> ({selectedSessionInfo.time})
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
                                {formData.status === 'rescheduled' && formData.rescheduleDate && formData.rescheduleSession && (
                                    <span className="block mt-2">
                                        📅 New date: <strong>{new Date(formData.rescheduleDate).toLocaleDateString()}</strong> - <strong>{getSessionDisplay(formData.rescheduleSession)}</strong>
                                    </span>
                                )}
                                {formData.status === 'confirmed' && formData.downpaymentAmount > 0 && (
                                    <span className="block mt-2">
                                        💰 Downpayment received: <strong>{formatCurrency(formData.downpaymentAmount)}</strong>
                                    </span>
                                )}
                                {formData.status === 'completed' && formData.remainingAmount > 0 && (
                                    <span className="block mt-2">
                                        💰 Final payment received: <strong>{formatCurrency(formData.remainingAmount)}</strong>
                                        {formData.paymentCompleted && <span> - Payment Fully Completed ✓</span>}
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