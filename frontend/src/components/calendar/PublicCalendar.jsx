// components/calendar/PublicCalendar.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faChevronLeft, 
    faChevronRight, 
    faSpinner,
    faCalendarAlt,
    faBan,
    faInfoCircle
} from '@fortawesome/free-solid-svg-icons';

function PublicCalendar({ onDateSelect, selectedDate, key }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [unavailableDates, setUnavailableDates] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    // Fetch confirmed and rescheduled appointments
    const fetchAppointments = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:5000/api/appointments/public/confirmed');

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setAppointments(result.data);
                    console.log('PublicCalendar - Appointments loaded:', result.data.length);
                }
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    }, []);

    // Fetch unavailable dates
    const fetchUnavailableDates = useCallback(async () => {
        try {
            console.log('🔍 Fetching unavailable dates from public endpoint...');
            // Change this URL to use the new public endpoint
            const response = await fetch('http://localhost:5000/api/appointments/public/unavailable-dates');
            
            console.log('📡 Response status:', response.status);
            
            if (response.ok) {
                const result = await response.json();
                console.log('📦 Unavailable dates response:', result);
                
                if (result.success) {
                    setUnavailableDates(result.data);
                    console.log('✅ Unavailable dates loaded:', result.data.length);
                    // Log each unavailable date for debugging
                    result.data.forEach(u => {
                        console.log(`   - ${u.date}: ${u.reason}`);
                    });
                } else {
                    console.error('❌ API returned success=false:', result.message);
                }
            } else {
                console.error('❌ HTTP error:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('❌ Error fetching unavailable dates:', error);
        }
    }, []);


    // Load all data
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
    }, [loadData, key]);

    // Calendar helpers
    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
    };

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

    // Check if a date has any appointments (confirmed or rescheduled)
    const hasAppointments = (day) => {
        const date = new Date(currentYear, currentMonth, day);
        date.setHours(0, 0, 0, 0);
        
        const hasBooking = appointments.some(app => {
            const appDate = new Date(app.preferredDate);
            appDate.setHours(0, 0, 0, 0);
            return appDate.getTime() === date.getTime();
        });
        
        return hasBooking;
    };

    // Check if a date is completely unavailable
    const isUnavailable = (day) => {
        const date = new Date(currentYear, currentMonth, day);
        date.setHours(0, 0, 0, 0);
        
        const unavailable = unavailableDates.some(u => {
            const uDate = new Date(u.date);
            uDate.setHours(0, 0, 0, 0);
            return uDate.getTime() === date.getTime();
        });
        
        return unavailable;
    };

    const getUnavailableReason = (day) => {
        const date = new Date(currentYear, currentMonth, day);
        date.setHours(0, 0, 0, 0);
        
        const unavailable = unavailableDates.find(u => {
            const uDate = new Date(u.date);
            uDate.setHours(0, 0, 0, 0);
            return uDate.getTime() === date.getTime();
        });
        
        return unavailable?.reason || 'Not Available';
    };

    const isPastDate = (day) => {
        const date = new Date(currentYear, currentMonth, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const isAvailable = (day) => {
        if (!day) return false;
        // Date is available if it's NOT past AND NOT unavailable
        return !isPastDate(day) && !isUnavailable(day);
    };

    // Handle date selection
    const handleDateSelect = (day) => {
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

    // Check if a date is selected
    const isSelectedDate = (day) => {
        if (!selectedDate || !day) return false;
        const date = new Date(currentYear, currentMonth, day);
        date.setHours(0, 0, 0, 0);
        
        const selected = new Date(selectedDate);
        selected.setHours(0, 0, 0, 0);
        
        return date.getTime() === selected.getTime();
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

    if (loading) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                <FontAwesomeIcon icon={faSpinner} className="text-3xl text-gray-400 mb-3 animate-spin" />
                <p className="text-gray-500 text-sm">Loading calendar...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                <div className="text-red-500 mb-3">⚠️</div>
                <h3 className="text-base font-medium text-gray-700 mb-2">Error Loading Calendar</h3>
                <p className="text-gray-500 text-sm mb-3">{error}</p>
                <button 
                    onClick={loadData}
                    className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Calendar Header */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-500 text-sm" />
                    <h2 className="text-base font-semibold text-gray-800">
                        {monthNames[currentMonth]} {currentYear}
                    </h2>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={handlePrevMonth} className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                        <FontAwesomeIcon icon={faChevronLeft} className="text-gray-600 text-xs" />
                    </button>
                    <button onClick={handleToday} className="px-2 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-xs font-medium text-gray-700">
                        Today
                    </button>
                    <button onClick={handleNextMonth} className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                        <FontAwesomeIcon icon={faChevronRight} className="text-gray-600 text-xs" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-3">
                {/* Day Names */}
                <div className="grid grid-cols-7 gap-0.5 mb-2">
                    {dayNames.map(day => (
                        <div key={day} className="text-center py-1.5 text-xs font-semibold text-gray-500">
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
                        const hasBookings = day ? hasAppointments(day) : false;
                        const unavailable = day ? isUnavailable(day) : false;
                        const unavailableReasonText = day ? getUnavailableReason(day) : '';
                        const pastDate = day ? isPastDate(day) : false;
                        const available = day ? isAvailable(day) : false;
                        const selected = day ? isSelectedDate(day) : false;
                        
                        let cellBgClass = '';
                        let cursorClass = '';
                        
                        if (selected) {
                            cellBgClass = 'bg-blue-100 border-blue-400';
                            cursorClass = 'cursor-pointer';
                        } else if (unavailable) {
                            cellBgClass = 'bg-red-50 border-red-200';
                            cursorClass = 'cursor-not-allowed';
                        } else if (pastDate) {
                            cellBgClass = 'bg-gray-100 border-gray-200';
                            cursorClass = 'cursor-not-allowed opacity-50';
                        } else if (available) {
                            cellBgClass = 'bg-white border-gray-200 hover:bg-green-50 hover:border-green-300';
                            cursorClass = 'cursor-pointer';
                        } else if (!day) {
                            cellBgClass = 'bg-gray-50 border-gray-200';
                            cursorClass = 'cursor-default';
                        } else {
                            cellBgClass = 'bg-white border-gray-200';
                            cursorClass = 'cursor-pointer hover:bg-gray-50';
                        }
                        
                        return (
                            <div
                                key={index}
                                onClick={() => day && handleDateSelect(day)}
                                className={`min-h-[70px] p-1.5 border rounded-lg transition-colors ${cellBgClass} ${cursorClass}`}
                            >
                                {day && (
                                    <>
                                        <div className={`text-xs font-medium mb-1 ${isToday ? 'text-blue-600' : selected ? 'text-blue-700' : 'text-gray-700'}`}>
                                            {day}
                                            {isToday && <span className="ml-0.5 text-[10px] text-blue-500">Today</span>}
                                            {unavailable && <span className="ml-0.5 text-[10px] text-red-500"></span>}
                                            {selected && !unavailable && <span className="ml-0.5 text-[10px] text-blue-500">✓</span>}
                                            {hasBookings && !unavailable && !selected && <span className="ml-0.5 text-[10px] text-orange-500">📅</span>}
                                        </div>
                                        
                                        {/* Status indicators */}
                                        {unavailable && (
                                            <div className="text-[10px] text-red-600 mt-0.5 truncate">
                                                ❌ {unavailableReasonText}
                                            </div>
                                        )}
                                        {hasBookings && !unavailable && !selected && (
                                            <div className="text-[10px] text-orange-600 mt-0.5 flex items-center gap-0.5">
                                                <span>📅</span> Has Booking
                                            </div>
                                        )}
                                        {available && !selected && !hasBookings && (
                                            <div className="text-[10px] text-green-600 mt-0.5">
                                                ✓ Available
                                            </div>
                                        )}
                                        {pastDate && !unavailable && (
                                            <div className="text-[10px] text-gray-400 mt-0.5">
                                Past
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center gap-1 mb-1.5">
                    <FontAwesomeIcon icon={faInfoCircle} className="text-gray-400 text-[10px]" />
                    <span className="text-[10px] font-medium text-gray-500">Calendar Guide:</span>
                </div>
                <div className="flex flex-wrap gap-3 text-[10px]">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded"></div>
                        <span className="text-gray-600">📅 Has Bookings</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span className="text-gray-600">❌ Unavailable Date</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-100 border border-blue-400 rounded"></div>
                        <span className="text-gray-600">Selected Date</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-white border border-green-300 rounded"></div>
                        <span className="text-gray-600">✓ Available</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
                        <span className="text-gray-600">Past Date</span>
                    </div>
                </div>
                <div className="mt-2 pt-1 border-t border-gray-200">
                    <p className="text-[10px] text-gray-400 flex items-center gap-1">
                        <FontAwesomeIcon icon={faInfoCircle} className="text-[10px]" />
                        Click on any available date to select it. Dates with 📅 already have bookings but may still be available depending on time.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default PublicCalendar;