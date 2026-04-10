import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPhone,
    faEnvelope,
    faLocationDot,
    faClock,
    faMessage,
    faCamera,
    faMapLocationDot,
    faDirections,
    faChevronRight,
    faCalendarCheck,
    faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import UnifiedContactModal from '../components/modals/UnifiedContactModal';

function CenteredContact() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className='w-full bg-gradient-to-b from-gray-50 to-white py-16'>
            <div className='max-w-4xl mx-auto px-4'>
                {/* Header */}
                <div className='text-center mb-12'>
                    <div className='inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4'>
                        <FontAwesomeIcon icon={faCamera} className='text-gray-600 text-2xl' />
                    </div>
                    <h2 className='text-3xl md:text-4xl font-light text-gray-800 mb-3'>Get in Touch</h2>
                    <div className='w-20 h-0.5 bg-gray-400 mx-auto mb-4'></div>
                    <p className='text-gray-500 max-w-2xl mx-auto'>
                        We're here to help with your photography needs. Book a session or ask us anything.
                    </p>
                </div>

                {/* Map Section */}
                <div className='bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-12 hover:shadow-xl transition-shadow duration-300'>
                    
                    {/* Map Header */}
                    <div className='bg-gradient-to-r from-gray-700 to-gray-800 p-4 md:p-6 text-white'>
                        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
                            <div className='flex items-center gap-3'>
                                <div className='w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center'>
                                    <FontAwesomeIcon icon={faMapLocationDot} className='text-white text-xl' />
                                </div>
                                <div>
                                    <h3 className='font-medium text-lg md:text-xl'>Maple Street Photography Studio</h3>
                                    <p className='text-sm text-gray-300'>Quezon City, Metro Manila</p>
                                </div>
                            </div>
                            <a 
                                href="https://www.google.com/maps/dir/?api=1&destination=14.703182,121.054868"
                                target="_blank"
                                rel="noopener noreferrer"
                                className='bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 self-start sm:self-center hover:scale-105 transform transition-transform duration-200'
                            >
                                <FontAwesomeIcon icon={faDirections} />
                                Get Directions
                            </a>
                        </div>
                    </div>

                    {/* Google Maps Iframe */}
                    <div className="w-full h-80 md:h-96">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3859.388325349825!2d121.05486827597389!3d14.703181785756178!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b1001ac4abd1%3A0x2d87e5cd6215cf27!2sBlk%204%20Lot%203%2C%20West%20Classic%20Garden%20Homes%2C%20Sauyo%2C%20Novaliches%2C%20Quezon%20City%2C%201116%20Metro%20Manila!5e0!3m2!1sen!2sph!4v1710000000000!5m2!1sen!2sph"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Maple Street Photography Location"
                            className="w-full h-full"
                        />
                    </div>

                    {/* Contact Information */}
                    <div className='p-6 md:p-8'>
                        <div className='grid md:grid-cols-2 gap-8'>
                            <div>
                                <h3 className='text-lg md:text-xl font-medium text-gray-800 mb-4 flex items-center gap-2'>
                                    <div className='w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center'>
                                        <FontAwesomeIcon icon={faCamera} className='text-gray-600' />
                                    </div>
                                    Studio Information
                                </h3>
                                <div className='space-y-4'>
                                    <div className='flex items-start gap-3'>
                                        <div className='w-5 h-5 flex-shrink-0 mt-0.5'>
                                            <FontAwesomeIcon icon={faLocationDot} className='text-gray-400' />
                                        </div>
                                        <span className='text-gray-600 text-sm leading-relaxed'>Block 3 Lot 16, Unit A, 2/F West Classic Gardens, Novaliches, Quezon City</span>
                                    </div>
                                    <div className='flex items-center gap-3'>
                                        <div className='w-5 h-5 flex-shrink-0'>
                                            <FontAwesomeIcon icon={faPhone} className='text-gray-400' />
                                        </div>
                                        <a href="tel:+639161701707" className='text-gray-600 text-sm hover:text-gray-800 transition-colors'>
                                            0916 170 1707
                                        </a>
                                    </div>
                                    <div className='flex items-center gap-3 break-all'>
                                        <div className='w-5 h-5 flex-shrink-0'>
                                            <FontAwesomeIcon icon={faEnvelope} className='text-gray-400' />
                                        </div>
                                        <a href="mailto:neilaaronmaplephoto@gmail.com" className='text-gray-600 text-sm hover:text-gray-800 transition-colors'>
                                            neilaaronmaplephoto@gmail.com
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className='text-lg md:text-xl font-medium text-gray-800 mb-4 flex items-center gap-2'>
                                    <div className='w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center'>
                                        <FontAwesomeIcon icon={faClock} className='text-gray-600' />
                                    </div>
                                    Studio Hours
                                </h3>
                                <div className='space-y-3'>
                                    <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                                        <span className='text-gray-600 font-medium'>Monday - Friday</span>
                                    </div>
                                    <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                                        <span className='text-orange-500'>By Appointment Only</span>
                                        <p className='text-gray-800 text-right border-b border-gray-100'>10:00 AM - 5:00 PM</p>
                                    </div>
                                </div>
                                
                                {/* Note about appointments */}
                                <div className='mt-4 p-3 bg-gray-50 rounded-lg'>
                                    <p className='text-xs text-gray-500 flex items-center gap-2'>
                                        <FontAwesomeIcon icon={faInfoCircle} className='text-gray-400' />
                                        All sessions are by appointment only. Please contact us to schedule your session.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Message Section */}
                    <div className='border-t border-gray-200 p-6 md:p-8 text-center bg-gradient-to-b from-white to-gray-50'>
                        <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-gray-200 transition-colors duration-300'>
                            <FontAwesomeIcon icon={faMessage} className='text-gray-600 text-3xl' />
                        </div>
                        <h3 className='text-2xl md:text-3xl font-light text-gray-800 mb-2'>Send Us a Message</h3>
                        <p className='text-gray-500 text-sm md:text-base mb-6 max-w-md mx-auto'>
                            Have questions about our services? Want to book a session? We'd love to hear from you and help capture your precious moments.
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className='bg-gray-700 hover:bg-gray-800 text-white px-8 py-3 rounded-lg text-sm md:text-base font-medium transition-all duration-300 inline-flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105 transform'
                        >
                            <FontAwesomeIcon icon={faCalendarCheck} />
                            Contact Us
                            <FontAwesomeIcon icon={faChevronRight} className='text-xs' />
                        </button>
                        
                        {/* Response time note */}
                        <p className='text-xs text-gray-400 mt-4'>
                            <FontAwesomeIcon icon={faClock} className='mr-1' />
                            We typically respond within 24 hours
                        </p>
                    </div>
                </div>

                {/* Additional Info Banner */}
                <div className='bg-gray-50 rounded-lg p-4 text-center border border-gray-200'>
                    <p className='text-sm text-gray-600'>
                        📍 Conveniently located in Novaliches, Quezon City • Free parking available • Wheelchair accessible
                    </p>
                </div>
            </div>

            <UnifiedContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}

export default CenteredContact;