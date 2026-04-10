import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPhone,
    faEnvelope,
    faHeart,
    faCamera,
    faClock,
    faLocationDot,
    faArrowUp
} from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { Link } from 'react-router-dom';

function Footer() {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <div className='w-full bg-gray-900'>
            <div className='max-w-6xl mx-auto px-4 py-12'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-8'>
                    {/* Brand Section */}
                    <div>
                        <div className='flex items-center gap-3 mb-4'>
                            <div className='w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center'>
                                <FontAwesomeIcon icon={faCamera} className='text-gray-300 text-lg' />
                            </div>
                            <h3 className='text-white font-medium text-lg'>Maple Street Photography</h3>
                        </div>
                        <p className='text-gray-400 text-sm leading-relaxed mb-4'>
                            Capturing life's most beautiful moments with authenticity and artistry. 
                            Specializing in newborn, maternity, and family milestones.
                        </p>
                        <div className='flex items-center gap-3'>
                            <a 
                                href="https://www.facebook.com/maplestreetphoto" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className='w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110'
                                aria-label="Facebook"
                            >
                                <FontAwesomeIcon icon={faFacebook} className='text-gray-400 text-sm' />
                            </a>
                            <a 
                                href="https://www.instagram.com/maplestreetphotography" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className='w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110'
                                aria-label="Instagram"
                            >
                                <FontAwesomeIcon icon={faInstagram} className='text-gray-400 text-sm' />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className='text-white text-sm font-medium mb-4'>Quick Links</h4>
                        <ul className='space-y-2'>
                            <li>
                                <Link to="/main" className='text-gray-400 hover:text-white text-sm transition-colors duration-200 inline-flex items-center gap-1 group'>
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/about-maple" className='text-gray-400 hover:text-white text-sm transition-colors duration-200 inline-flex items-center gap-1 group'>
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link to="/samples" className='text-gray-400 hover:text-white text-sm transition-colors duration-200 inline-flex items-center gap-1 group'>
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    Samples
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className='text-gray-400 hover:text-white text-sm transition-colors duration-200 inline-flex items-center gap-1 group'>
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className='text-white text-sm font-medium mb-4'>Contact Info</h4>
                        <div className='space-y-3'>
                            <p className='text-gray-400 text-sm flex items-center gap-2 group'>
                                <FontAwesomeIcon icon={faPhone} className='text-gray-500 text-xs w-4 group-hover:text-gray-300 transition-colors' />
                                <a href="tel:+639161701707" className="hover:text-white transition-colors">
                                    0916 170 1707
                                </a>
                            </p>
                            <p className='text-gray-400 text-sm flex items-center gap-2 break-all group'>
                                <FontAwesomeIcon icon={faEnvelope} className='text-gray-500 text-xs w-4 group-hover:text-gray-300 transition-colors' />
                                <a href="mailto:neilaaronmaplephoto@gmail.com" className="hover:text-white transition-colors">
                                    neilaaronmaplephoto@gmail.com
                                </a>
                            </p>
                            <p className='text-gray-400 text-sm flex items-center gap-2 group'>
                                <FontAwesomeIcon icon={faLocationDot} className='text-gray-500 text-xs w-4 group-hover:text-gray-300 transition-colors' />
                                <span>Quezon City, Philippines</span>
                            </p>
                            <p className='text-gray-400 text-sm flex items-center gap-2 group'>
                                <FontAwesomeIcon icon={faClock} className='text-gray-500 text-xs w-4 group-hover:text-gray-300 transition-colors' />
                                <span>Mon-Sat: 10AM-5PM | Sun: By Appointment</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className='pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4'>
                    <p className='text-gray-500 text-xs text-center sm:text-left'>
                        © {new Date().getFullYear()} Maple Street Photography. All rights reserved.
                    </p>
                    <div className='flex items-center gap-4'>
                        <Link to="/maple-privacy-policy" className='text-gray-500 hover:text-gray-300 text-xs transition-colors'>
                            Privacy Policy
                        </Link>
                        <Link to="/maple-terms-of-service" className='text-gray-500 hover:text-gray-300 text-xs transition-colors'>
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
            
            {/* Back to Top Button */}
            <button
                onClick={scrollToTop}
                className='fixed bottom-8 right-8 bg-gray-700 hover:bg-gray-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 z-40'
                aria-label="Back to top"
            >
                <FontAwesomeIcon icon={faArrowUp} className='text-sm' />
            </button>
        </div>
    );
}

export default Footer;