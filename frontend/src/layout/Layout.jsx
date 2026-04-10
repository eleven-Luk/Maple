import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from '../components/Sidebar.jsx';
import SessionTimeout from '../utils/SessionTimeout.jsx'; 

function Layout ({ children }) {
    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Session Timeout - applies to all admin pages */}
            <SessionTimeout timeoutMinutes={60} />
            
            <div className="sticky top-0 h-screen">
                <Sidebar />
            </div>

            {/* MAIN CONTENT AREA - Scrollable */}
            <main className="flex-1 overflow-hidden">
                <Outlet />
            </main>
        </div>
    )
}

export default Layout;