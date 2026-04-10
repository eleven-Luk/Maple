// pages/Maple/MDashboard.jsx
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faBriefcase,
    faCalendarCheck,
    faCamera,
    faComments,
    faArrowRight,
    faCalendarDay,
    faCalendarWeek,
    faCheckCircle,
    faClock,
    faExclamationTriangle,
    faFire,
    faUserPlus,
    faMessage,
    faChartLine,
    faEye,
    faStar,
    faCheckDouble,
    faUsers,
    faDollarSign,
    faChartBar
} from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from "../../components/common/LoadingSpinner";

const MDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState({
        appointments: [],
        samples: [],
        concerns: []
    });
    const [stats, setStats] = useState({
        totalAppointments: 0,
        completedSessions: 0,
        pendingAppointments: 0,
        confirmedAppointments: 0,
        cancelledAppointments: 0,
        totalSamples: 0,
        featuredSamples: 0,
        totalConcerns: 0,
        resolvedConcerns: 0,
        pendingConcerns: 0,
        todayAppointments: 0,
        weekAppointments: 0,
        todayConcerns: 0,
        weekConcerns: 0,
        completionRate: 0,
        revenue: 0 // You can calculate based on package prices
    });
    const [timeRange, setTimeRange] = useState('week');
    const navigate = useNavigate();


    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please login first');
                navigate('/login');
                return;
            }

            // Fetch appointments
            const appointmentsResponse = await fetch('http://localhost:5000/api/appointments/get', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const appointmentsResult = await appointmentsResponse.json();
            
            // Fetch samples
            const samplesResponse = await fetch('http://localhost:5000/api/samples/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const samplesResult = await samplesResponse.json();
            
            // Fetch concerns (if you have a concerns endpoint for Maple)
            // If not, you might need to create one or use a different endpoint
            let concernsResult = { success: true, data: [] };
            try {
                const concernsResponse = await fetch('http://localhost:5000/api/concerns/business/maple', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                concernsResult = await concernsResponse.json();
            } catch (err) {
                console.log('No concerns endpoint for Maple yet');
            }

            if (appointmentsResult.success && samplesResult.success) {
                const appointments = appointmentsResult.data || [];
                const samples = samplesResult.data || [];
                const concerns = concernsResult.data || [];
                
                setDashboardData({ appointments, samples, concerns });
                
                // Calculate appointment statistics
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                
                const monthAgo = new Date(today);
                monthAgo.setDate(monthAgo.getDate() - 30);
                
                const completedSessions = appointments.filter(app => 
                    app.status === 'completed'
                ).length;
                
                const pendingAppointments = appointments.filter(app => 
                    app.status === 'pending'
                ).length;
                
                const confirmedAppointments = appointments.filter(app => 
                    app.status === 'confirmed'
                ).length;
                
                const cancelledAppointments = appointments.filter(app => 
                    app.status === 'cancelled'
                ).length;
                
                const todayAppointments = appointments.filter(app => 
                    new Date(app.createdAt) >= today
                ).length;
                
                const weekAppointments = appointments.filter(app => 
                    new Date(app.createdAt) >= weekAgo
                ).length;
                
                const todayConcerns = concerns.filter(concern => 
                    new Date(concern.createdAt) >= today
                ).length;
                
                const weekConcerns = concerns.filter(concern => 
                    new Date(concern.createdAt) >= weekAgo
                ).length;
                
                const resolvedConcerns = concerns.filter(concern => 
                    concern.status === 'resolved'
                ).length;
                
                const pendingConcerns = concerns.filter(concern => 
                    concern.status === 'pending' || concern.status === 'open'
                ).length;
                
                const featuredSamples = samples.filter(sample => 
                    sample.featured === true
                ).length;
                
                // Calculate completion rate
                const completionRate = appointments.length > 0 
                    ? Math.round((completedSessions / appointments.length) * 100)
                    : 0;
                
                // Calculate revenue (example: $200 for newborn, $150 for others)
                const calculateRevenue = (appointment) => {
                    const packagePrices = {
                        newborn: 250,
                        maternity: 200,
                        family: 300,
                        milestone: 180,
                        portrait: 150,
                        custom: 250
                    };
                    if (appointment.status === 'completed') {
                        return packagePrices[appointment.packageType] || 200;
                    }
                    return 0;
                };
                
                const revenue = appointments
                    .filter(app => app.status === 'completed')
                    .reduce((total, app) => total + calculateRevenue(app), 0);
                
                setStats({
                    totalAppointments: appointments.length,
                    completedSessions,
                    pendingAppointments,
                    confirmedAppointments,
                    cancelledAppointments,
                    totalSamples: samples.length,
                    featuredSamples,
                    totalConcerns: concerns.length,
                    resolvedConcerns,
                    pendingConcerns,
                    todayAppointments,
                    weekAppointments,
                    todayConcerns,
                    weekConcerns,
                    completionRate,
                    revenue
                });
            } else {
                throw new Error('Failed to fetch dashboard data');
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError(error.message || 'Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const getRecentItems = (items, count = 5) => {
        return [...items]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, count);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        const now = new Date();
        
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        const diffTime = today - targetDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: new Date().getFullYear() !== date.getFullYear() ? 'numeric' : undefined
            });
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
            rescheduled: 'bg-purple-100 text-purple-800',
            resolved: 'bg-green-100 text-green-800',
            'in-progress': 'bg-orange-100 text-orange-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const RecentItemCard = ({ item, type, onClick }) => {
        const getIcon = () => {
            if (type === 'appointment') return faCalendarCheck;
            if (type === 'concern') return faComments;
            return faCamera;
        };
        
        const getTitle = () => {
            if (type === 'appointment') return item.name;
            if (type === 'concern') return item.name;
            return item.title;
        };
        
        const getSubtitle = () => {
            if (type === 'appointment') return `${item.packageType} - ${item.preferredDate}`;
            if (type === 'concern') return item.inquiryType || 'General Inquiry';
            return item.category;
        };
        
        const getStatus = () => {
            if (type === 'appointment') return item.status;
            if (type === 'concern') return item.status;
            return null;
        };
        
        return (
            <div 
                onClick={onClick}
                className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors last:border-b-0"
            >
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <FontAwesomeIcon icon={getIcon()} className="text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{getTitle()}</p>
                        <p className="text-xs text-gray-500 mt-1 truncate">{getSubtitle()}</p>
                        {getStatus() && (
                            <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(getStatus())}`}>
                                {getStatus().toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div className="text-xs text-gray-400 flex-shrink-0">
                        {formatDate(item.createdAt)}
                    </div>
                </div>
            </div>
        );
    };

    const getDisplayCount = () => {
        if (timeRange === 'day') {
            return {
                appointments: stats.todayAppointments,
                concerns: stats.todayConcerns
            };
        }
        return {
            appointments: stats.weekAppointments,
            concerns: stats.weekConcerns
        };
    };

    const displayCount = getDisplayCount();
    const recentAppointments = getRecentItems(dashboardData.appointments, 5);
    const recentSamples = getRecentItems(dashboardData.samples, 5);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner message="Loading dashboard..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-4xl mb-4" />
                    <p className="text-red-600 mb-4">{error}</p>
                    <button 
                        onClick={fetchDashboardData}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
            {/* Header */}
            <header className="mb-8">
                <p className="text-sm font-light text-orange-500 mb-2 tracking-wider">DASHBOARD</p>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Maple Photography Dashboard</h1>
                        <p className="text-gray-500 mt-1">Overview of your photography business</p>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setTimeRange('day')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                timeRange === 'day' 
                                    ? 'bg-white text-orange-600 shadow-sm' 
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <FontAwesomeIcon icon={faCalendarDay} className="mr-2" />
                            Today
                        </button>
                        <button
                            onClick={() => setTimeRange('week')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                timeRange === 'week' 
                                    ? 'bg-white text-orange-600 shadow-sm' 
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <FontAwesomeIcon icon={faCalendarWeek} className="mr-2" />
                            This Week
                        </button>
                    </div>
                </div>
            </header>

            {/* Stats Cards Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Total Appointments Card */}
                <div 
                    onClick={() => navigate('/maple-admin/appointments')}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 cursor-pointer hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FontAwesomeIcon icon={faCalendarCheck} className="text-blue-600 text-xl" />
                        </div>
                        <span className="text-2xl font-bold text-blue-600">{stats.totalAppointments}</span>
                    </div>
                    <p className="text-sm text-gray-600">Total Appointments</p>
                    <div className="mt-3 flex items-center gap-2 text-xs">
                        <FontAwesomeIcon icon={faChartLine} className="text-blue-500" />
                        <span className="text-gray-500">
                            {stats.pendingAppointments} pending, {stats.confirmedAppointments} confirmed
                        </span>
                    </div>
                    <div className="mt-2">
                        <span className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                            View All Appointments <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                        </span>
                    </div>
                </div>

                {/* Completed Sessions Card */}
                <div 
                    onClick={() => navigate('/maple-admin/appointments?status=completed')}
                    className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 cursor-pointer hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <FontAwesomeIcon icon={faCheckDouble} className="text-green-600 text-xl" />
                        </div>
                        <span className="text-2xl font-bold text-green-600">{stats.completedSessions}</span>
                    </div>
                    <p className="text-sm text-gray-600">Completed Sessions</p>
                    <div className="mt-3 flex items-center gap-2 text-xs">
                        <FontAwesomeIcon icon={faStar} className="text-green-500" />
                        <span className="text-gray-500">
                            Completion Rate: {stats.completionRate}%
                        </span>
                    </div>
                    <div className="mt-2">
                        <span className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                            View Completed <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                        </span>
                    </div>
                </div>

                {/* Portfolio Samples Card */}
                <div 
                    onClick={() => navigate('/maple-admin/samples')}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 cursor-pointer hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <FontAwesomeIcon icon={faCamera} className="text-purple-600 text-xl" />
                        </div>
                        <span className="text-2xl font-bold text-purple-600">{stats.totalSamples}</span>
                    </div>
                    <p className="text-sm text-gray-600">Portfolio Samples</p>
                    <div className="mt-3 flex items-center gap-2 text-xs">
                        <FontAwesomeIcon icon={faStar} className="text-purple-500" />
                        <span className="text-gray-500">
                            {stats.featuredSamples} featured in portfolio
                        </span>
                    </div>
                    <div className="mt-2">
                        <span className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
                            Manage Samples <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Cards Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* New Appointments Card */}
                <div 
                    onClick={() => navigate('/maple-admin/appointments')}
                    className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200 cursor-pointer hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <FontAwesomeIcon icon={faUserPlus} className="text-orange-600 text-xl" />
                        </div>
                        <span className="text-2xl font-bold text-orange-600">{displayCount.appointments}</span>
                    </div>
                    <p className="text-sm text-gray-600">New Appointments ({timeRange === 'day' ? 'Today' : 'This Week'})</p>
                    <div className="mt-3 flex items-center gap-2 text-xs">
                        <FontAwesomeIcon icon={faFire} className="text-orange-500" />
                        <span className="text-gray-500">
                            {displayCount.appointments} new {timeRange === 'day' ? 'today' : 'this week'}
                        </span>
                    </div>
                    <div className="mt-2">
                        <span className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
                            View All <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                        </span>
                    </div>
                </div>

                {/* Concerns Card */}
                <div 
                    onClick={() => navigate('/maple-admin/concerns')}
                    className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <FontAwesomeIcon icon={faComments} className="text-gray-600 text-xl" />
                        </div>
                        <span className="text-2xl font-bold text-gray-600">{stats.totalConcerns}</span>
                    </div>
                    <p className="text-sm text-gray-600">Total Concerns</p>
                    <div className="mt-3 flex items-center gap-2 text-xs">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                        <span className="text-gray-500">
                            {stats.resolvedConcerns} resolved, {stats.pendingConcerns} pending
                        </span>
                    </div>
                    <div className="mt-2">
                        <span className="text-xs text-gray-600 hover:text-gray-700 font-medium flex items-center gap-1">
                            View Concerns <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                        </span>
                    </div>
                </div>

                {/* New Concerns Card */}
                <div 
                    onClick={() => navigate('/maple-admin/concerns')}
                    className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-200 cursor-pointer hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                            <FontAwesomeIcon icon={faMessage} className="text-teal-600 text-xl" />
                        </div>
                        <span className="text-2xl font-bold text-teal-600">{displayCount.concerns}</span>
                    </div>
                    <p className="text-sm text-gray-600">New Concerns ({timeRange === 'day' ? 'Today' : 'This Week'})</p>
                    <div className="mt-3 flex items-center gap-2 text-xs">
                        <FontAwesomeIcon icon={faFire} className="text-teal-500" />
                        <span className="text-gray-500">
                            {displayCount.concerns} new {timeRange === 'day' ? 'today' : 'this week'}
                        </span>
                    </div>
                    <div className="mt-2">
                        <span className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
                            View All <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                        </span>
                    </div>
                </div>

                {/* Appointment Breakdown Card */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <FontAwesomeIcon icon={faChartBar} className="text-indigo-600" />
                        </div>
                        <h3 className="font-semibold text-gray-800">Status Breakdown</h3>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Pending</span>
                            <span className="font-medium text-yellow-600">{stats.pendingAppointments}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Confirmed</span>
                            <span className="font-medium text-blue-600">{stats.confirmedAppointments}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Completed</span>
                            <span className="font-medium text-green-600">{stats.completedSessions}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Cancelled</span>
                            <span className="font-medium text-red-600">{stats.cancelledAppointments}</span>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-indigo-100">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Completion Rate</span>
                            <span className="font-medium text-indigo-600">{stats.completionRate}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Appointments */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faCalendarCheck} className="text-orange-500" />
                                <h3 className="font-semibold text-gray-900">Recent Appointments</h3>
                            </div>
                            <button 
                                onClick={() => navigate('/maple-admin/appointments')}
                                className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
                            >
                                View All <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Latest 5 appointment requests</p>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {recentAppointments.length > 0 ? (
                            recentAppointments.map(appointment => (
                                <RecentItemCard 
                                    key={appointment._id}
                                    item={appointment}
                                    type="appointment"
                                    onClick={() => navigate('/maple-admin/appointments')}
                                />
                            ))
                        ) : (
                            <div className="p-8 text-center">
                                <FontAwesomeIcon icon={faCalendarCheck} className="text-gray-300 text-4xl mb-3" />
                                <p className="text-gray-500">No appointments yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Samples */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faCamera} className="text-orange-500" />
                                <h3 className="font-semibold text-gray-900">Recent Portfolio Additions</h3>
                            </div>
                            <button 
                                onClick={() => navigate('/maple-admin/samples')}
                                className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
                            >
                                View All <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Latest 5 samples added</p>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {recentSamples.length > 0 ? (
                            recentSamples.map(sample => (
                                <RecentItemCard 
                                    key={sample._id}
                                    item={sample}
                                    type="sample"
                                    onClick={() => navigate('/maple-admin/samples')}
                                />
                            ))
                        ) : (
                            <div className="p-8 text-center">
                                <FontAwesomeIcon icon={faCamera} className="text-gray-300 text-4xl mb-3" />
                                <p className="text-gray-500">No samples added yet</p>
                                <button 
                                    onClick={() => navigate('/maple-admin/samples')}
                                    className="mt-2 text-sm text-orange-600 hover:text-orange-700"
                                >
                                    Add your first sample →
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MDashboard;