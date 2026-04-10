import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faChevronLeft, 
    faChevronRight, 
    faSpinner,
    faCalendarAlt,
    faBan,
    faTimes,
    faSave,
    faTrash,
    faClock,
    faInfoCircle,
    faCalendarWeek
} from '@fortawesome/free-solid-svg-icons';
import ViewModalApp from '../../components/modals/Maple/appointments/ViewModal.jsx';

function SimpleCalendar({ onAppointmentClick, onDateSelect, selectedDate }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [unavailableDates, setUnavailableDates] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [unavailableReason, setUnavailableReason] = useState('');
    const [selectedUnavailableId, setSelectedUnavailableId] = useState(null);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewError, setViewError] = useState('');

    const fetchAppointments = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            // Fetch confirmed and rescheduled appointments
            const response = await fetch('http://localhost:5000/api/appointments/confirmed', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setAppointments(result.data);
                }
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    }, []);

    const fetchUnavailableDates = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('http://localhost:5000/api/appointments/unavailable-dates', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setUnavailableDates(result.data);
                }
            }
        } catch (error) {
            console.error('Error fetching unavailable dates:', error);
        }
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await Promise.all([fetchAppointments(), fetchUnavailableDates()]);
        } catch (err) {
            setError('Failed to load calendar data');
        } finally {
            setLoading(false);
        }
    }, [fetchAppointments, fetchUnavailableDates]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const handleToday = () => {
        const today = new Date();
        setCurrentMonth(today.getMonth());
        setCurrentYear(today.getFullYear());
    };

    const getAppointmentsForDay = (day) => {
        const date = new Date(currentYear, currentMonth, day);
        return appointments.filter(app => {
            const appDate = new Date(app.preferredDate);
            return appDate.toDateString() === date.toDateString();
        });
    };

    const isUnavailable = (day) => {
        const date = new Date(currentYear, currentMonth, day);
        return unavailableDates.some(u => {
            const uDate = new Date(u.date);
            return uDate.toDateString() === date.toDateString();
        });
    };

    const getUnavailableReason = (day) => {
        const date = new Date(currentYear, currentMonth, day);
        const unavailable = unavailableDates.find(u => {
            const uDate = new Date(u.date);
            return uDate.toDateString() === date.toDateString();
        });
        return unavailable?.reason || '';
    };

    const isPastDate = (day) => {
        const date = new Date(currentYear, currentMonth, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const handleDateSelectForBooking = (day) => {
        if (!day) return;
        
        if (isPastDate(day)) {
            alert('Cannot select past dates');
            return;
        }
        
        if (isUnavailable(day)) {
            alert(`This date is unavailable. ${getUnavailableReason(day)}`);
            return;
        }
        
        const date = new Date(currentYear, currentMonth, day);
        if (onDateSelect) {
            onDateSelect(date);
        }
    };

    const handleDateClickForAdmin = (day) => {
        if (!day) return;
        
        const date = new Date(currentYear, currentMonth, day);
        const dateString = date.toDateString();
        
        const existing = unavailableDates.find(u => {
            const uDate = new Date(u.date);
            return uDate.toDateString() === dateString;
        });
        
        setSelectedDay(day);
        setSelectedMonth(currentMonth);
        setSelectedYear(currentYear);
        
        if (existing) {
            setSelectedUnavailableId(existing._id);
            setUnavailableReason(existing.reason || '');
        } else {
            setSelectedUnavailableId(null);
            setUnavailableReason('');
        }
        setModalOpen(true);
    };

    const handleAppointmentClick = (appointment) => {
        if (onAppointmentClick) {
            onAppointmentClick(appointment);
        }
    };

    const getFormattedDateString = () => {
        if (selectedDay === null || selectedMonth === null || selectedYear === null) return null;
        const year = selectedYear;
        const month = String(selectedMonth + 1).padStart(2, '0');
        const day = String(selectedDay).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const saveUnavailableDate = async () => {
        const dateString = getFormattedDateString();
        if (!dateString) {
            alert('Invalid date selected');
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login first');
                return;
            }

            const response = await fetch('http://localhost:5000/api/appointments/unavailable-dates', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    date: dateString,
                    reason: unavailableReason
                })
            });

            const result = await response.json();
            
            if (result.success) {
                await loadData();
                setModalOpen(false);
                setSelectedDay(null);
                setSelectedMonth(null);
                setSelectedYear(null);
                setUnavailableReason('');
                setSelectedUnavailableId(null);
                alert('Date marked as unavailable successfully!');
            } else {
                alert(result.message || 'Failed to save unavailable date');
            }
        } catch (error) {
            console.error('Error saving unavailable date:', error);
            alert('Failed to save unavailable date: ' + error.message);
        }
    };

    const deleteUnavailableDate = async () => {
        if (!selectedUnavailableId) return;
        
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`http://localhost:5000/api/appointments/unavailable-dates/${selectedUnavailableId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const result = await response.json();
            
            if (result.success) {
                await loadData();
                setModalOpen(false);
                setSelectedDay(null);
                setSelectedMonth(null);
                setSelectedYear(null);
                setUnavailableReason('');
                setSelectedUnavailableId(null);
                alert('Unavailable date removed successfully!');
            } else {
                alert(result.message || 'Failed to delete unavailable date');
            }
        } catch (error) {
            console.error('Error deleting unavailable date:', error);
            alert('Failed to delete unavailable date');
        }
    };

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    
    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push(i);
    }

    const formatTime = (timeString) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    const isSelectedDate = (day) => {
        if (!selectedDate || !day) return false;
        const date = new Date(currentYear, currentMonth, day);
        const selected = new Date(selectedDate);
        return date.toDateString() === selected.toDateString();
    };

    const handleViewAppointment = async (app) => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                setViewError('Please login first');
                setTimeout(() => setViewError(''), 3000);
                return;
            }

            const response = await fetch(`http://localhost:5000/api/appointments/view/${app._id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const result = await response.json();

            if (result.success) {
                setSelectedAppointment(result.data);
                setShowViewModal(true);
                setViewError('');
            } else {
                setViewError(result.message || 'Failed to view appointment');
                setTimeout(() => setViewError(''), 3000);
            }

        } catch (error) {
            console.error('Error fetching appointment details:', error);
            setViewError('Failed to fetch appointment details');
            setTimeout(() => setViewError(''), 3000);
        }
    };

    const handleViewClick = (appointment) => {
        handleViewAppointment(appointment);
    };

    // Get appointment style based on status
    const getAppointmentStyle = (appointment) => {
        if (appointment.status === 'rescheduled') {
            return {
                bgColor: 'bg-purple-500',
                hoverColor: 'hover:bg-purple-600',
                icon: faCalendarWeek,
                label: 'Rescheduled'
            };
        } else if (appointment.status === 'confirmed') {
            return {
                bgColor: 'bg-blue-500',
                hoverColor: 'hover:bg-blue-600',
                icon: faClock,
                label: 'Confirmed'
            };
        }
        return {
            bgColor: 'bg-gray-500',
            hoverColor: 'hover:bg-gray-600',
            icon: faClock,
            label: 'Appointment'
        };
    };

    if (loading) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 text-center">
                <FontAwesomeIcon icon={faSpinner} className="text-2xl sm:text-3xl text-gray-400 mb-2 sm:mb-3 animate-spin" />
                <p className="text-gray-500 text-xs sm:text-sm">Loading calendar...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 text-center">
                <div className="text-red-500 mb-2 sm:mb-3 text-2xl sm:text-3xl">⚠️</div>
                <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-2">Error Loading Calendar</h3>
                <p className="text-gray-500 text-xs sm:text-sm mb-3">{error}</p>
                <button 
                    onClick={loadData}
                    className="px-3 sm:px-4 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs sm:text-sm"
                >
                    Try Again
                </button>
            </div>
        );
    }

    const isAdmin = !!onAppointmentClick;
    const getModalDateString = () => {
        if (selectedDay === null || selectedMonth === null || selectedYear === null) return '';
        const date = new Date(selectedYear, selectedMonth, selectedDay);
        return date.toLocaleDateString();
    };

    return (
        <>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Calendar Header - Responsive */}
                <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-500 text-xs sm:text-sm" />
                        <h2 className="text-sm sm:text-base font-semibold text-gray-800">
                            {monthNames[currentMonth]} {currentYear}
                        </h2>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={handlePrevMonth} className="p-1 sm:p-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                            <FontAwesomeIcon icon={faChevronLeft} className="text-gray-600 text-[10px] sm:text-xs" />
                        </button>
                        <button onClick={handleToday} className="px-2 sm:px-3 py-1 sm:py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-[10px] sm:text-xs font-medium text-gray-700">
                            Today
                        </button>
                        <button onClick={handleNextMonth} className="p-1 sm:p-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                            <FontAwesomeIcon icon={faChevronRight} className="text-gray-600 text-[10px] sm:text-xs" />
                        </button>
                    </div>
                </div>

                {/* Calendar Grid - Responsive */}
                <div className="p-2 sm:p-3 overflow-x-auto">
                    {/* Day Names */}
                    <div className="grid grid-cols-7 gap-0.5 mb-1 sm:mb-2">
                        {dayNames.map(day => (
                            <div key={day} className="text-center py-1 text-[10px] sm:text-xs font-semibold text-gray-500">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-0.5">
                        {calendarDays.map((day, index) => {
                            const isToday = day === new Date().getDate() && 
                                           currentMonth === new Date().getMonth() && 
                                           currentYear === new Date().getFullYear();
                            const dayAppointments = day ? getAppointmentsForDay(day) : [];
                            const unavailable = day ? isUnavailable(day) : false;
                            const unavailableReasonText = day ? getUnavailableReason(day) : '';
                            const pastDate = day ? isPastDate(day) : false;
                            const selected = day ? isSelectedDate(day) : false;
                            
                            let cellBgClass = '';
                            if (selected && !unavailable) {
                                cellBgClass = 'bg-blue-100 border-blue-400';
                            } else if (unavailable) {
                                cellBgClass = 'bg-red-50 border-red-200 hover:bg-red-100';
                            } else if (pastDate) {
                                cellBgClass = 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50';
                            } else if (dayAppointments.length > 0 && isAdmin) {
                                cellBgClass = 'bg-blue-50 border-blue-200 hover:bg-blue-100';
                            } else if (!day) {
                                cellBgClass = 'bg-gray-50 border-gray-200';
                            } else {
                                cellBgClass = 'bg-white border-gray-200 hover:bg-gray-50';
                            }
                            
                            return (
                                <div
                                    key={index}
                                    onClick={() => {
                                        if (day) {
                                            if (isAdmin) {
                                                handleDateClickForAdmin(day);
                                            } else {
                                                handleDateSelectForBooking(day);
                                            }
                                        }
                                    }}
                                    className={`min-h-[60px] sm:min-h-[80px] p-1 sm:p-1.5 border rounded-lg transition-colors cursor-pointer ${cellBgClass}`}
                                >
                                    {day && (
                                        <>
                                            <div className={`text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1 ${isToday ? 'text-blue-600' : selected ? 'text-blue-700' : 'text-gray-700'}`}>
                                                {day}
                                                {isToday && <span className="ml-0.5 text-[8px] sm:text-[10px] text-blue-500">Today</span>}
                                                {selected && !unavailable && <span className="ml-0.5 text-[8px] sm:text-[10px] text-blue-500">✓</span>}
                                            </div>
                                            
                                            {dayAppointments.map(app => {
                                                const style = getAppointmentStyle(app);
                                                return (
                                                    <div
                                                        key={app._id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewClick(app);
                                                        }}
                                                        className={`text-[8px] sm:text-[10px] ${style.bgColor} text-white rounded px-0.5 sm:px-1 py-0.5 mb-0.5 truncate cursor-pointer ${style.hoverColor} transition-colors`}
                                                        title={`${app.name} - ${app.preferredTime} (${style.label})`}
                                                    >
                                                        <FontAwesomeIcon icon={style.icon} className="text-[6px] sm:text-[8px] mr-0.5" />
                                                        {formatTime(app.preferredTime)} - {app.name.split(' ')[0]}
                                                        {app.status === 'rescheduled' && <span className="ml-0.5 text-[8px]">🔄</span>}
                                                    </div>
                                                );
                                            })}
                                            
                                            {unavailable && unavailableReasonText && (
                                                <div className="text-[8px] sm:text-[10px] text-red-600 mt-0.5 truncate">❌ {unavailableReasonText.substring(0, 15)}</div>
                                            )}
                                            
                                            {pastDate && !unavailable && (
                                                <div className="text-[8px] sm:text-[10px] text-gray-400 mt-0.5">Past</div>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Legend - Responsive */}
                <div className="px-2 sm:px-3 py-1.5 sm:py-2 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-1 mb-1">
                        <FontAwesomeIcon icon={faInfoCircle} className="text-gray-400 text-[8px] sm:text-[10px]" />
                        <span className="text-[8px] sm:text-[10px] font-medium text-gray-500">Calendar Guide:</span>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3 text-[8px] sm:text-[10px]">
                        <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500 rounded"></div>
                            <span className="text-gray-600">Confirmed</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-purple-500 rounded"></div>
                            <span className="text-gray-600">Rescheduled</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded"></div>
                            <span className="text-gray-600">Unavailable</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-100 border border-blue-400 rounded"></div>
                            <span className="text-gray-600">Selected</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white border border-gray-300 rounded"></div>
                            <span className="text-gray-600">Available</span>
                        </div>
                    </div>
                    {!isAdmin && (
                        <div className="mt-1 pt-1 border-t border-gray-200">
                            <p className="text-[8px] sm:text-[10px] text-gray-400">
                                <FontAwesomeIcon icon={faInfoCircle} className="mr-0.5" />
                                Click on an available date to select it
                            </p>
                        </div>
                    )}
                    {isAdmin && (
                        <div className="mt-1 pt-1 border-t border-gray-200">
                            <p className="text-[8px] sm:text-[10px] text-gray-400">
                                <FontAwesomeIcon icon={faInfoCircle} className="mr-0.5" />
                                Click date to manage availability
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Unavailable Date Modal - Responsive */}
            {modalOpen && selectedDay !== null && isAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-[90%] sm:max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-full flex items-center justify-center">
                                    <FontAwesomeIcon icon={faBan} className="text-red-600 text-xs sm:text-sm" />
                                </div>
                                <div>
                                    <h2 className="text-sm sm:text-base font-bold text-gray-900">
                                        {selectedUnavailableId ? 'Edit' : 'Mark as Unavailable'}
                                    </h2>
                                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{getModalDateString()}</p>
                                </div>
                            </div>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <FontAwesomeIcon icon={faTimes} className="text-sm sm:text-base" />
                            </button>
                        </div>

                        <div className="p-3 sm:p-4">
                            <div className="mb-3">
                                <label className="block text-[10px] sm:text-xs font-medium text-gray-700 mb-1">Reason (Optional)</label>
                                <textarea
                                    value={unavailableReason}
                                    onChange={(e) => setUnavailableReason(e.target.value)}
                                    rows={2}
                                    placeholder="e.g., Holiday, Maintenance"
                                    className="w-full px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400/20 focus:border-red-400 transition-all resize-none"
                                    autoFocus
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                {selectedUnavailableId && (
                                    <button onClick={deleteUnavailableDate} className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium transition-colors flex items-center gap-1">
                                        <FontAwesomeIcon icon={faTrash} className="text-[10px] sm:text-xs" /> Remove
                                    </button>
                                )}
                                <button onClick={() => setModalOpen(false)} className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors">
                                    Cancel
                                </button>
                                <button onClick={saveUnavailableDate} className="px-3 sm:px-4 py-1 text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-1">
                                    <FontAwesomeIcon icon={faSave} className="text-[10px] sm:text-xs" />
                                    {selectedUnavailableId ? 'Update' : 'Mark'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ViewModalApp 
                isOpen={showViewModal}
                onClose={() => {
                    setShowViewModal(false);
                    setSelectedAppointment(null);
                }}
                appointment={selectedAppointment}
            />

            {viewError && (
                <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50 bg-red-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-lg text-[10px] sm:text-sm">
                    {viewError}
                </div>
            )}
        </>
    );
}

export default SimpleCalendar;