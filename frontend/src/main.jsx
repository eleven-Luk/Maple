import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Layout from './layout/Layout.jsx';

import './index.css';
import App from './App.jsx';
import Login from './pages/Login.jsx';
import MainPage from './pages/MainPage.jsx';

// Maple Pages
import MapleTermsOfService from './pages/Maple/MaplePrivacyPolicy.jsx';
import MaplePrivacyPolicy from './pages/Maple/MaplePrivacyPolicy.jsx';
import AboutMaple from './pages/Maple/AboutMaple.jsx';
import MDashboard from './pages/Maple/MDashboard.jsx';
import MSamples from './pages/Maple/MSamples.jsx';
import MAppointments from './pages/Maple/MAppointments.jsx';
import MConcerns from './pages/Maple/MConcerns.jsx';
import Samples from './pages/Maple/Samples.jsx';
import MCalendar from './pages/Maple/MCalendar.jsx';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute><App /></ProtectedRoute>,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/main',
    element: <MainPage />,
  },
  {
    path: '/maple-privacy-policy',
    element: <MaplePrivacyPolicy />,
  },
  {
    path: '/maple-terms-of-service',
    element: <MapleTermsOfService />,
  },
  {
    path: '/samples',
    element: <Samples />,
  },
  {
    path: '/about-maple',
    element: <AboutMaple />,
  },
  {
    path: '/maple-admin',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <MDashboard />
      },
      {
        path: 'samples',
        element: <MSamples />
      },
      {
        path: 'appointments',
        element: <MAppointments />
      },
      {
        path: 'appointments/calendar',
        element: <MCalendar />
      },
      {
        path: 'concerns',
        element: <MConcerns />
      },
    ]
  },
  {
    path: '*',
    element: (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-gray-600">Page not found</p>
          <a href="/login" className="mt-4 inline-block text-blue-500 hover:text-blue-600">
            Go to Login
          </a>
        </div>
      </div>
    )
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);