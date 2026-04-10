import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCamera,
    faShield,
    faCookie,
    faUserLock,
    faEnvelope,
    faPhone,
    faArrowLeft
} from '@fortawesome/free-solid-svg-icons';

function MaplePrivacyPolicy() {
    const navigate = useNavigate();

    const goToHomepage = () => {
        navigate('/main');
    };

    return (
        <div className='w-full bg-gradient-to-b from-gray-50 to-white py-8 sm:py-12 md:py-16'>
            {/* Back to Homepage Button */}
            <div className='fixed top-3 left-3 sm:top-4 sm:left-4 md:top-6 md:left-6 z-20'>
                <button
                    onClick={goToHomepage}
                    className='flex items-center gap-1 sm:gap-2 bg-white/90 hover:bg-white backdrop-blur-sm text-gray-700 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow-md transition-all duration-300 border border-gray-200 text-xs sm:text-sm'
                >
                    <FontAwesomeIcon icon={faArrowLeft} className='w-3 h-3 sm:w-4 sm:h-4' />
                    <span className='hidden sm:inline'>Back to Home</span>
                    <span className='sm:hidden'>Home</span>
                </button>
            </div>

            <div className='max-w-4xl mx-auto px-4 sm:px-6'>
                {/* Header */}
                <div className='text-center mb-8 sm:mb-12'>
                    <div className='w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4'>
                        <FontAwesomeIcon icon={faCamera} className='text-gray-600 text-2xl sm:text-3xl' />
                    </div>
                    <h1 className='text-2xl sm:text-3xl font-light text-gray-800 mb-2 sm:mb-3'>Privacy Policy</h1>
                    <p className='text-gray-500 text-sm sm:text-base'>Maple Street Photography</p>
                    <p className='text-xs sm:text-sm text-gray-400 mt-2'>Last Updated: March 8, 2026</p>
                </div>

                {/* Content Card */}
                <div className='bg-white rounded-xl shadow-lg border border-gray-200 p-5 sm:p-6 md:p-8 mb-8'>
                    
                    {/* Introduction */}
                    <div className='mb-6 sm:mb-8'>
                        <h2 className='text-base sm:text-lg md:text-xl font-medium text-gray-800 mb-3 flex items-center gap-2'>
                            <FontAwesomeIcon icon={faShield} className='text-gray-400 text-sm sm:text-base' />
                            Our Commitment to Your Privacy
                        </h2>
                        <p className='text-gray-600 leading-relaxed text-sm sm:text-base'>
                            At Maple Street Photography, we understand that your privacy is important. This policy outlines 
                            how we collect, use, and protect your personal information when you book our services, visit our 
                            studio, or interact with our website.
                        </p>
                    </div>

                    {/* Information We Collect */}
                    <div className='mb-6 sm:mb-8'>
                        <h2 className='text-base sm:text-lg md:text-xl font-medium text-gray-800 mb-3'>Information We Collect</h2>
                        <div className='space-y-3 sm:space-y-4'>
                            <div>
                                <h3 className='font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base'>Personal Information</h3>
                                <p className='text-gray-600 text-xs sm:text-sm leading-relaxed'>
                                    When you book a session or contact us, we may collect:
                                </p>
                                <ul className='list-disc pl-5 mt-2 text-gray-600 text-xs sm:text-sm space-y-1'>
                                    <li>Full name and contact information (email, phone number)</li>
                                    <li>Session details (type of photography, date, location)</li>
                                    <li>Payment information (processed securely through our payment partners)</li>
                                    <li>Names and ages of family members being photographed</li>
                                    <li>Special requests or preferences for your session</li>
                                </ul>
                            </div>
                            
                            <div>
                                <h3 className='font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base'>Photographs and Images</h3>
                                <p className='text-gray-600 text-xs sm:text-sm leading-relaxed'>
                                    As a photography business, we capture and store images from your sessions. With your 
                                    consent, we may use select images for our portfolio, website, or social media. You have 
                                    the right to decline this use at any time.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* How We Use Your Information */}
                    <div className='mb-6 sm:mb-8'>
                        <h2 className='text-base sm:text-lg md:text-xl font-medium text-gray-800 mb-3'>How We Use Your Information</h2>
                        <ul className='list-disc pl-5 text-gray-600 text-xs sm:text-sm space-y-1.5 sm:space-y-2'>
                            <li>To communicate about your session bookings and inquiries</li>
                            <li>To deliver the photography services you've requested</li>
                            <li>To send session previews, galleries, and final images</li>
                            <li>To improve our services and customer experience</li>
                            <li>To send promotional offers or updates (only with your consent)</li>
                            <li>To comply with legal obligations</li>
                        </ul>
                    </div>

                    {/* Information Sharing */}
                    <div className='mb-6 sm:mb-8'>
                        <h2 className='text-base sm:text-lg md:text-xl font-medium text-gray-800 mb-3'>Information Sharing</h2>
                        <p className='text-gray-600 text-xs sm:text-sm leading-relaxed mb-2'>
                            We do not sell, trade, or rent your personal information to third parties. We may share your 
                            information only in these limited circumstances:
                        </p>
                        <ul className='list-disc pl-5 text-gray-600 text-xs sm:text-sm space-y-1.5 sm:space-y-2'>
                            <li><span className='font-medium'>Service Providers:</span> Payment processors, gallery hosting platforms, and printing services necessary to fulfill your session</li>
                            <li><span className='font-medium'>Legal Requirements:</span> When required by law or to protect our rights</li>
                            <li><span className='font-medium'>With Your Consent:</span> When you explicitly authorize us to share information (such as featuring your photos)</li>
                        </ul>
                    </div>

                    {/* Data Security */}
                    <div className='mb-6 sm:mb-8'>
                        <h2 className='text-base sm:text-lg md:text-xl font-medium text-gray-800 mb-3 flex items-center gap-2'>
                            <FontAwesomeIcon icon={faUserLock} className='text-gray-400 text-sm sm:text-base' />
                            Data Security
                        </h2>
                        <p className='text-gray-600 text-xs sm:text-sm leading-relaxed'>
                            We implement appropriate technical and organizational measures to protect your personal information 
                            against unauthorized access, alteration, disclosure, or destruction. Your session galleries are 
                            password-protected and accessible only to you and those you share the password with.
                        </p>
                    </div>

                    {/* Cookies */}
                    <div className='mb-6 sm:mb-8'>
                        <h2 className='text-base sm:text-lg md:text-xl font-medium text-gray-800 mb-3 flex items-center gap-2'>
                            <FontAwesomeIcon icon={faCookie} className='text-gray-400 text-sm sm:text-base' />
                            Cookies
                        </h2>
                        <p className='text-gray-600 text-xs sm:text-sm leading-relaxed'>
                            Our website uses cookies to enhance your browsing experience, analyze site traffic, and 
                            understand where our visitors come from. You can choose to disable cookies through your 
                            browser settings, though this may affect certain functionality.
                        </p>
                    </div>

                    {/* Your Rights */}
                    <div className='mb-6 sm:mb-8'>
                        <h2 className='text-base sm:text-lg md:text-xl font-medium text-gray-800 mb-3'>Your Rights</h2>
                        <p className='text-gray-600 text-xs sm:text-sm leading-relaxed mb-2'>
                            You have the right to:
                        </p>
                        <ul className='list-disc pl-5 text-gray-600 text-xs sm:text-sm space-y-1'>
                            <li>Access the personal information we hold about you</li>
                            <li>Request correction of inaccurate information</li>
                            <li>Request deletion of your information (subject to legal retention requirements)</li>
                            <li>Opt out of marketing communications</li>
                            <li>Withdraw consent for use of your images in our portfolio</li>
                        </ul>
                    </div>

                    {/* Changes to Policy */}
                    <div className='mb-6 sm:mb-8'>
                        <h2 className='text-base sm:text-lg md:text-xl font-medium text-gray-800 mb-3'>Changes to This Policy</h2>
                        <p className='text-gray-600 text-xs sm:text-sm leading-relaxed'>
                            We may update this privacy policy from time to time. Any changes will be posted on this page 
                            with an updated revision date. We encourage you to review this policy periodically.
                        </p>
                    </div>

                    {/* Contact Us */}
                    <div className='bg-gray-50 p-4 sm:p-6 rounded-lg'>
                        <h2 className='text-base sm:text-lg md:text-xl font-medium text-gray-800 mb-3'>Contact Us</h2>
                        <p className='text-gray-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4'>
                            If you have questions about this privacy policy or how we handle your information, please contact us:
                        </p>
                        <div className='space-y-2'>
                            <p className='text-gray-600 text-xs sm:text-sm flex items-center gap-2 break-all'>
                                <FontAwesomeIcon icon={faEnvelope} className='text-gray-400 w-4' />
                                neilaaronmaplephoto@gmail.com
                            </p>
                            <p className='text-gray-600 text-xs sm:text-sm flex items-center gap-2'>
                                <FontAwesomeIcon icon={faPhone} className='text-gray-400 w-4' />
                                0916 170 1707
                            </p>
                            <p className='text-gray-600 text-xs sm:text-sm leading-relaxed'>
                                Blk 4 Lot 3, West Classic Garden, Sauyo, <br />
                                Novaliches, Quezon City, 1116 Metro Manila
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MaplePrivacyPolicy;