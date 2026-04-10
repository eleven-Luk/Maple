// // components/CalendarView.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
// import { format, parse, startOfWeek, getDay, isSameDay } from 'date-fns';
// import enUS from 'date-fns/locale/en-US';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { 
//     faSpinner, 
//     faChevronLeft, 
//     faChevronRight, 
//     faCalendarAlt,
//     faBan,
//     faTimes,
//     faSave,
//     faTrash
// } from '@fortawesome/free-solid-svg-icons';
// import 'react-big-calendar/lib/css/react-big-calendar.css';

// const locales = {
//   'en-US': enUS,
// };

// const localizer = dateFnsLocalizer({
//   format,
//   parse,
//   startOfWeek,
//   getDay,
//   locales,
// });

// function CalendarView({ onAppointmentClick }) {
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [events, setEvents] = useState([]);
//     const [unavailableDates, setUnavailableDates] = useState([]);
//     const [currentDate, setCurrentDate] = useState(new Date());
    
//     // Modal states
//     const [modalOpen, setModalOpen] = useState(false);
//     const [selectedDate, setSelectedDate] = useState(null);
//     const [unavailableReason, setUnavailableReason] = useState('');
//     const [selectedUnavailableId, setSelectedUnavailableId] = useState(null);

//     // Fetch confirmed appointments
//     const fetchConfirmedAppointments = useCallback(async () => {
//         try {
//             const token = localStorage.getItem('token');
//             if (!token) {
//                 setError('Please login first');
//                 setLoading(false);
//                 return;
//             }

//             const response = await fetch('http://localhost:5000/api/appointments/confirmed', {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             });

//             if (!response.ok) {
//                 throw new Error('Failed to fetch confirmed appointments');
//             }

//             const result = await response.json();

//             if (result.success) {
//                 const calendarEvents = result.data.map(appointment => {
//                     const [hours, minutes] = appointment.preferredTime.split(':');
//                     const startDateTime = new Date(appointment.preferredDate);
//                     startDateTime.setHours(parseInt(hours), parseInt(minutes), 0);
                    
//                     const endDateTime = new Date(startDateTime);
//                     endDateTime.setHours(startDateTime.getHours() + appointment.durationHours);
                    
//                     return {
//                         id: appointment._id,
//                         title: `${appointment.name} - ${appointment.packageType}`,
//                         start: startDateTime,
//                         end: endDateTime,
//                         resource: appointment,
//                         allDay: false,
//                         type: 'appointment'
//                     };
//                 });
//                 setEvents(calendarEvents);
//             }
//         } catch (error) {
//             console.error('Error fetching confirmed appointments:', error);
//             setError(error.message);
//         }
//     }, []);

//     // Fetch unavailable dates
//     const fetchUnavailableDates = useCallback(async () => {
//         try {
//             const token = localStorage.getItem('token');
//             if (!token) return;

//             const response = await fetch('http://localhost:5000/api/appointments/unavailable-dates', {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             });

//             if (response.ok) {
//                 const result = await response.json();
//                 if (result.success) {
//                     setUnavailableDates(result.data);
//                     const unavailableEvents = result.data.map(date => ({
//                         id: `unavailable-${date._id}`,
//                         title: `❌ ${date.reason || 'Not Available'}`,
//                         start: new Date(date.date),
//                         end: new Date(date.date),
//                         allDay: true,
//                         type: 'unavailable',
//                         resource: date
//                     }));
//                     setEvents(prev => [...prev.filter(e => e.type !== 'unavailable'), ...unavailableEvents]);
//                 }
//             }
//         } catch (error) {
//             console.error('Error fetching unavailable dates:', error);
//         }
//     }, []);

//     // Load all data
//     const loadAllData = useCallback(async () => {
//         setLoading(true);
//         setError(null);
//         await Promise.all([fetchConfirmedAppointments(), fetchUnavailableDates()]);
//         setLoading(false);
//     }, [fetchConfirmedAppointments, fetchUnavailableDates]);

//     useEffect(() => {
//         loadAllData();
//     }, [loadAllData]);

//     // Open modal for a specific date
//     const openModalForDate = useCallback((date, existingUnavailable = null) => {
//         setSelectedDate(date);
//         if (existingUnavailable) {
//             setSelectedUnavailableId(existingUnavailable.resource?._id || existingUnavailable._id);
//             setUnavailableReason(existingUnavailable.reason || existingUnavailable.resource?.reason || '');
//         } else {
//             setSelectedUnavailableId(null);
//             setUnavailableReason('');
//         }
//         setModalOpen(true);
//     }, []);

//     // Handle date click - This is the main fix
//     const handleDateClick = useCallback((date) => {
//         // Find if this date is already marked as unavailable
//         const existing = unavailableDates.find(u => 
//             isSameDay(new Date(u.date), date)
//         );
//         openModalForDate(date, existing);
//     }, [unavailableDates, openModalForDate]);

//     // Handle "Mark as Unavailable" button click
//     const handleMarkUnavailable = useCallback(() => {
//         const today = new Date();
//         openModalForDate(today);
//     }, [openModalForDate]);

//     // Save unavailable date
//     const saveUnavailableDate = useCallback(async () => {
//         if (!selectedDate) return;
        
//         try {
//             const token = localStorage.getItem('token');
//             if (!token) {
//                 setError('Please login first');
//                 return;
//             }

//             const response = await fetch('http://localhost:5000/api/appointments/unavailable-dates', {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                     date: selectedDate,
//                     reason: unavailableReason
//                 })
//             });

//             const result = await response.json();
            
//             if (result.success) {
//                 await loadAllData();
//                 setModalOpen(false);
//                 setSelectedDate(null);
//                 setUnavailableReason('');
//                 setSelectedUnavailableId(null);
//             } else {
//                 throw new Error(result.message || 'Failed to save unavailable date');
//             }
//         } catch (error) {
//             console.error('Error saving unavailable date:', error);
//             setError(error.message);
//             setTimeout(() => setError(null), 3000);
//         }
//     }, [selectedDate, unavailableReason, loadAllData]);

//     // Delete unavailable date
//     const deleteUnavailableDate = useCallback(async () => {
//         if (!selectedUnavailableId) return;
        
//         try {
//             const token = localStorage.getItem('token');
//             if (!token) return;

//             const response = await fetch(`http://localhost:5000/api/appointments/unavailable-dates/${selectedUnavailableId}`, {
//                 method: 'DELETE',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             });

//             const result = await response.json();
            
//             if (result.success) {
//                 await loadAllData();
//                 setModalOpen(false);
//                 setSelectedDate(null);
//                 setUnavailableReason('');
//                 setSelectedUnavailableId(null);
//             } else {
//                 throw new Error(result.message || 'Failed to delete unavailable date');
//             }
//         } catch (error) {
//             console.error('Error deleting unavailable date:', error);
//             setError(error.message);
//             setTimeout(() => setError(null), 3000);
//         }
//     }, [selectedUnavailableId, loadAllData]);

//     // Close modal
//     const closeModal = useCallback(() => {
//         setModalOpen(false);
//         setSelectedDate(null);
//         setUnavailableReason('');
//         setSelectedUnavailableId(null);
//     }, []);

//     // Custom event component
//     const EventComponent = useCallback(({ event }) => {
//         if (event.type === 'unavailable') {
//             return (
//                 <div className="p-1 text-xs bg-red-500 text-white rounded cursor-pointer hover:bg-red-600 transition-colors">
//                     <div className="font-semibold truncate">❌ {event.title}</div>
//                 </div>
//             );
//         }
        
//         return (
//             <div className="p-1 text-xs bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 transition-colors">
//                 <div className="font-semibold truncate">{event.title}</div>
//                 <div className="text-xs opacity-90">
//                     {event.resource?.preferredTime} • {event.resource?.durationHours}h
//                 </div>
//             </div>
//         );
//     }, []);

//     // Custom toolbar
//     const CustomToolbar = useCallback(({ label, onNavigate, onView, view }) => {
//         return (
//             <div className="flex flex-wrap items-center justify-between gap-3 mb-4 p-4 bg-white border border-gray-200 rounded-lg">
//                 <div className="flex items-center gap-2">
//                     <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-500" />
//                     <span className="text-lg font-semibold text-gray-800">{label}</span>
//                 </div>
//                 <div className="flex flex-wrap items-center gap-2">
//                     <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
//                         <button
//                             onClick={() => onView('month')}
//                             className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
//                                 view === 'month' 
//                                     ? 'bg-gray-600 text-white' 
//                                     : 'text-gray-600 hover:bg-gray-200'
//                             }`}
//                         >
//                             Month
//                         </button>
//                         <button
//                             onClick={() => onView('week')}
//                             className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
//                                 view === 'week' 
//                                     ? 'bg-gray-600 text-white' 
//                                     : 'text-gray-600 hover:bg-gray-200'
//                             }`}
//                         >
//                             Week
//                         </button>
//                         <button
//                             onClick={() => onView('day')}
//                             className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
//                                 view === 'day' 
//                                     ? 'bg-gray-600 text-white' 
//                                     : 'text-gray-600 hover:bg-gray-200'
//                             }`}
//                         >
//                             Day
//                         </button>
//                     </div>
//                     <div className="flex items-center gap-1">
//                         <button
//                             onClick={() => onNavigate('PREV')}
//                             className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                         >
//                             <FontAwesomeIcon icon={faChevronLeft} className="text-gray-600" />
//                         </button>
//                         <button
//                             onClick={() => onNavigate('TODAY')}
//                             className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
//                         >
//                             Today
//                         </button>
//                         <button
//                             onClick={() => onNavigate('NEXT')}
//                             className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                         >
//                             <FontAwesomeIcon icon={faChevronRight} className="text-gray-600" />
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         );
//     }, []);

//     if (loading) {
//         return (
//             <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
//                 <FontAwesomeIcon icon={faSpinner} className="text-4xl text-gray-400 mb-4 animate-spin" />
//                 <p className="text-gray-500">Loading calendar...</p>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
//                 <div className="text-red-500 mb-4">⚠️</div>
//                 <h3 className="text-lg font-medium text-gray-700 mb-2">Error Loading Calendar</h3>
//                 <p className="text-gray-500 mb-4">{error}</p>
//                 <button 
//                     onClick={loadAllData}
//                     className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
//                 >
//                     Try Again
//                 </button>
//             </div>
//         );
//     }

//     return (
//         <>
//             <div className="bg-white rounded-xl border border-gray-200 overflow-hidden p-4">
//                 <Calendar
//                     localizer={localizer}
//                     events={events}
//                     startAccessor="start"
//                     endAccessor="end"
//                     style={{ height: 700 }}
//                     onSelectEvent={(event) => {
//                         if (event.type === 'appointment') {
//                             onAppointmentClick(event.resource);
//                         }
//                     }}
//                     onSelectSlot={({ start }) => handleDateClick(start)}
//                     selectable={true}
//                     components={{
//                         event: EventComponent,
//                         toolbar: CustomToolbar,
//                     }}
//                     defaultView="month"
//                     views={['month', 'week', 'day']}
//                     date={currentDate}
//                     onNavigate={(date) => setCurrentDate(date)}
//                     messages={{
//                         next: "Next",
//                         previous: "Previous",
//                         today: "Today",
//                         month: "Month",
//                         week: "Week",
//                         day: "Day",
//                     }}
//                     className="react-calendar-custom"
//                     eventPropGetter={(event) => ({
//                         style: {
//                             backgroundColor: event.type === 'unavailable' ? '#ef4444' : '#3b82f6',
//                             borderRadius: '6px',
//                             border: 'none',
//                             fontSize: '12px',
//                         }
//                     })}
//                 />
                
//                 {/* Legend */}
//                 <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-4 text-xs text-gray-500">
//                     <div className="flex items-center gap-2">
//                         <div className="w-3 h-3 bg-blue-500 rounded"></div>
//                         <span>Confirmed Appointment</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                         <div className="w-3 h-3 bg-red-500 rounded"></div>
//                         <span>Unavailable Date</span>
//                     </div>
//                     <button 
//                         onClick={handleMarkUnavailable}
//                         className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors"
//                     >
//                         <FontAwesomeIcon icon={faBan} className="text-red-500" />
//                         <span>Mark Date as Unavailable</span>
//                     </button>
//                 </div>
//             </div>

//             {/* Unavailable Date Modal */}
//             {modalOpen && selectedDate && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
//                     <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
//                         <div className="flex items-center justify-between p-6 border-b border-gray-200">
//                             <div className="flex items-center gap-3">
//                                 <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
//                                     <FontAwesomeIcon icon={faBan} className="text-red-600" />
//                                 </div>
//                                 <div>
//                                     <h2 className="text-xl font-bold text-gray-900">
//                                         {selectedUnavailableId ? 'Edit Unavailable Date' : 'Mark Date as Unavailable'}
//                                     </h2>
//                                     <p className="text-sm text-gray-500 mt-0.5">
//                                         {selectedDate.toLocaleDateString()}
//                                     </p>
//                                 </div>
//                             </div>
//                             <button
//                                 onClick={closeModal}
//                                 className="text-gray-400 hover:text-gray-600 transition-colors"
//                             >
//                                 <FontAwesomeIcon icon={faTimes} className="text-xl" />
//                             </button>
//                         </div>

//                         <div className="p-6">
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Reason (Optional)
//                                 </label>
//                                 <textarea
//                                     value={unavailableReason}
//                                     onChange={(e) => setUnavailableReason(e.target.value)}
//                                     rows="3"
//                                     placeholder="e.g., Holiday, Studio Maintenance, Fully Booked, etc."
//                                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400/20 focus:border-red-400 transition-all resize-none"
//                                     autoFocus
//                                 />
//                             </div>

//                             <div className="flex justify-end gap-3">
//                                 {selectedUnavailableId && (
//                                     <button
//                                         onClick={deleteUnavailableDate}
//                                         className="px-4 py-2 text-red-600 hover:text-red-700 font-medium transition-colors flex items-center gap-2"
//                                     >
//                                         <FontAwesomeIcon icon={faTrash} />
//                                         Remove
//                                     </button>
//                                 )}
//                                 <button
//                                     onClick={closeModal}
//                                     className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     onClick={saveUnavailableDate}
//                                     className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
//                                 >
//                                     <FontAwesomeIcon icon={faSave} />
//                                     {selectedUnavailableId ? 'Update' : 'Mark as Unavailable'}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// }

// export default CalendarView;