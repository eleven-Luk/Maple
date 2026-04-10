// pages/Maple/MCalendar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import SimpleCalendar from '../Maple/SimpleCalendar.jsx';
import ViewModalApp from '../../components/modals/Maple/appointments/ViewModal.jsx';

function MCalendar() {
    const [selectedAppointment, setSelectedAppointment] = React.useState(null);
    const [showViewModal, setShowViewModal] = React.useState(false);
    const navigate = useNavigate();

    const handleViewClick = (appointment) => {
        setSelectedAppointment(appointment);
        setShowViewModal(true);
    };

    return (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
            {/* Back Button */}
            <button
                onClick={() => navigate('/maple-admin/appointments')}
                className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
                <FontAwesomeIcon icon={faArrowLeft} />
                <span className="text-sm">Back to Appointments</span>
            </button>

            {/* Header */}
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center shadow-md">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-white text-lg" />
                    </div>
                    <div>
                        <p className="text-sm font-light text-gray-500 tracking-wider">CALENDAR MANAGEMENT</p>
                        <h1 className="text-2xl font-light text-gray-800">Manage Availability & Appointments</h1>
                    </div>
                </div>
                <div className="w-20 h-0.5 bg-gray-400"></div>
                <p className="text-sm text-gray-500 mt-3">
                    Click on any date to mark it as unavailable or manage existing appointments.
                </p>
            </header>

            {/* Simple Calendar - Admin Mode (onAppointmentClick enables admin features) */}
            <SimpleCalendar 
                onAppointmentClick={handleViewClick}
            />

            {/* View Appointment Modal */}
            <ViewModalApp 
                isOpen={showViewModal}
                onClose={() => {
                    setShowViewModal(false);
                    setSelectedAppointment(null);
                }}
                appointment={selectedAppointment}
            />
        </div>
    );
}

export default MCalendar;