import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faEnvelope, faHome, faImage, faCircleInfo, faBars, faTimes, faCalendarCheck } from '@fortawesome/free-solid-svg-icons';
import NielLogo from '../assets/NielLogo.jpg';
import UnifiedContactModal from '../components/modals/UnifiedContactModal.jsx';
import { Link, useLocation } from 'react-router-dom';

function Header({ onHomeClick }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    const navItems = [
        { icon: faImage, label: 'Samples', link: '/samples' },
        { icon: faHome, label: 'Home', action: onHomeClick },
        { icon: faCircleInfo, label: 'About', link: '/about-maple' },
        { icon: faEnvelope, label: 'Contact Us', action: () => setIsModalOpen(true) },
    ];

    const isActiveLink = (path) => {
        return location.pathname === path;
    };

    return (
        <div className='sticky top-0 bg-white z-50 shadow-md border-b border-gray-200'>
            {/* Desktop Header */}
            {!isMobile ? (
                <div className='flex items-center justify-between px-6 py-4 max-w-7xl mx-auto'>
                    {/* Logo and Brand */}
                    <Link to="/main" className='flex items-center gap-3 group cursor-pointer'>
                        <img 
                            src={NielLogo} 
                            alt="Maple Street Photography Logo" 
                            className='w-14 h-14 rounded-full border-2 border-gray-300 object-cover transition-transform duration-300 group-hover:scale-105' 
                        />
                        <div>
                            <h1 className='text-xl font-medium text-gray-700 group-hover:text-gray-900 transition-colors'>Maple Street</h1>
                            <p className='text-sm text-gray-500'>Photography</p>
                        </div>
                    </Link>

                    {/* Navigation */}
                    <div className='flex items-center gap-3'>
                        <Link to="/samples" 
                            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow-md border ${
                                isActiveLink('/samples')
                                    ? 'bg-gray-700 text-white border-gray-700'
                                    : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200'
                            }`}
                        >
                            <FontAwesomeIcon icon={faImage} />
                            <span>Samples</span>
                        </Link>
                        
                        <button 
                            onClick={onHomeClick}
                            className='flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-700 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow-md border border-gray-200'
                        >
                            <FontAwesomeIcon icon={faHome} />
                            <span>Home</span>
                        </button>

                        <Link to="/about-maple"
                            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow-md border ${
                                isActiveLink('/about-maple')
                                    ? 'bg-gray-700 text-white border-gray-700'
                                    : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200'
                            }`}
                        >
                            <FontAwesomeIcon icon={faCircleInfo} />
                            <span>About</span>
                        </Link>
                    </div>
                </div>
            ) : (
                /* Mobile Header */
                <div className='bg-white'>
                    <div className='flex items-center justify-between p-4'>
                        <Link to="/main" className='flex items-center gap-2'>
                            <img src={NielLogo} alt="Logo" className='w-10 h-10 rounded-full border border-gray-300 object-cover' />
                            <div>
                                <h1 className='text-sm font-medium text-gray-700'>Maple Street</h1>
                                <p className='text-xs text-gray-500'>Photography</p>
                            </div>
                        </Link>
                        
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                            className='p-2 rounded-lg hover:bg-gray-100 transition-colors'
                        >
                            <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} className='text-gray-600 text-xl' />
                        </button>
                    </div>
                    
                    {/* Mobile Menu */}
                    {isMobileMenuOpen && (
                        <div className='border-t border-gray-200 py-2 animate-slideDown'>
                            {navItems.map((item, index) => (
                                item.link ? (
                                    <Link 
                                        key={index} 
                                        to={item.link} 
                                        className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                                            isActiveLink(item.link)
                                                ? 'bg-gray-100 text-gray-900'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <FontAwesomeIcon icon={item.icon} className='text-gray-500 w-5' />
                                        <span>{item.label}</span>
                                    </Link>
                                ) : (
                                    <button 
                                        key={index} 
                                        onClick={() => { 
                                            item.action?.(); 
                                            setIsMobileMenuOpen(false); 
                                        }} 
                                        className='w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors'
                                    >
                                        <FontAwesomeIcon icon={item.icon} className='text-gray-500 w-5' />
                                        <span>{item.label}</span>
                                    </button>
                                )
                            ))}
                            
                            {/* Book Now Button in Mobile Menu */}
                            <button 
                                onClick={() => { 
                                    setIsModalOpen(true); 
                                    setIsMobileMenuOpen(false); 
                                }}
                                className='w-full flex items-center gap-3 px-4 py-3 mt-2 bg-gray-700 text-white hover:bg-gray-800 transition-colors'
                            >
                                <FontAwesomeIcon icon={faCalendarCheck} className='w-5' />
                                <span>Book Now</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            <UnifiedContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}

export default Header;