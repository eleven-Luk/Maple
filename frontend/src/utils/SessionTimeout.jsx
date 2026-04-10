import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InactivityTimer from '../utils/InActivityTimer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';

function SessionTimeout({ timeoutMinutes = 2 }) {
    const navigate = useNavigate();
    const timerRef = useRef(null);
    const [secondsRemaining, setSecondsRemaining] = useState(timeoutMinutes * 60);
    const [showTimer, setShowTimer] = useState(false);
    const intervalRef = useRef(null);

    // Function to reset the timer
    const resetTimer = () => {
        setSecondsRemaining(timeoutMinutes * 60);
        
        // Also reset the underlying timer
        if (timerRef.current) {
            timerRef.current.reset();
        }
    };

    useEffect(() => {
        // Get user from localStorage to check if logged in
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const token = localStorage.getItem('token');

        // Only start timer if user is logged in
        if (!token || !user) {
            return;
        }

        console.log('SessionTimeout started - 2 minutes timer');
        setShowTimer(true);
        setSecondsRemaining(timeoutMinutes * 60); // 120 seconds for 2 minutes

        const handleLogout = () => {
            console.log('Logging out due to 2 minutes of inactivity');
            
            // Clear interval
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            
            // Clear all storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('cart');
            
            // Navigate to login
            navigate('/login', { 
                state: { 
                    message: 'Your session has expired due to inactivity' 
                }
            });
        };

        // Create timer instance with proper 2-minute timeout
        const timer = new InactivityTimer(handleLogout, timeoutMinutes); // This uses 2 minutes
        
        // Override the reset method
        const originalReset = timer.reset;
        timer.reset = function() {
            console.log('Activity detected - resetting to 2 minutes');
            setSecondsRemaining(timeoutMinutes * 60); // Reset to 120 seconds
            originalReset.call(this);
        };
        
        timerRef.current = timer;
        timer.start();

        // Set up interval to update the displayed time
        intervalRef.current = setInterval(() => {
            setSecondsRemaining(prev => {
                if (prev <= 1) {
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Add manual event listeners
        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        const handleActivity = () => resetTimer();
        
        activityEvents.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        // Cleanup
        return () => {
            if (timerRef.current) {
                timerRef.current.stop();
            }
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            activityEvents.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [navigate, timeoutMinutes]);

    // Format time as MM:SS
    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    if (!showTimer) return null;

    return (
        <div className="fixed top-3 right-3 z-50">
            <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-3 py-1.5 shadow-sm hover:bg-white transition-all duration-200">
                <FontAwesomeIcon 
                    icon={faClock} 
                    className={`text-xs ${
                        secondsRemaining < 30 
                            ? 'text-red-400' 
                            : secondsRemaining < 60 
                                ? 'text-yellow-400' 
                                : 'text-gray-400'
                    }`} 
                />
                <span className={`font-mono text-xs font-medium ${
                    secondsRemaining < 30 
                        ? 'text-red-400' 
                        : secondsRemaining < 60 
                            ? 'text-yellow-600' 
                            : 'text-gray-500'
                }`}>
                    {formatTime(secondsRemaining)}
                </span>
            </div>
        </div>
    );
}

export default SessionTimeout;