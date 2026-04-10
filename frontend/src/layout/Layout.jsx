import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from '../components/Sidebar.jsx';
import SessionTimeout from '../utils/SessionTimeout.jsx'; 

function Layout ({ children }) {
    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Session Timeout - applies to all admin pages */}
            <SessionTimeout timeoutMinutes={60} />
            
            <div className="sticky top-0 h-screen w-64 flex-shrink-0">
                <Sidebar />
            </div>

            {/* MAIN CONTENT AREA - Scrollable and Full Width */}
            <main className="flex-1 overflow-x-auto">
                <div className="min-w-[1200px]">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}

export default Layout;