import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCamera,
    faFileContract,
    faCalendarCheck,
    faImage,
    faCreditCard,
    faBan,
    faEnvelope,
    faArrowLeft
} from '@fortawesome/free-solid-svg-icons';

function MapleTermsOfService() {
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
                    <h1 className='text-2xl sm:text-3xl font-light text-gray-800 mb-2 sm:mb-3'>Terms of Service</h1>
                    <p className='text-gray-500 text-sm sm:text-base'>Maple Street Photography</p>
                    <p className='text-xs sm:text-sm text-gray-400 mt-2'>Last Updated: March 8, 2026</p>
                </div>

                {/* Content Card */}
                <div className='bg-white rounded-xl shadow-lg border border-gray-200 p-5 sm:p-6 md:p-8 mb-8'>
                    
                    {/* Introduction */}
                    <div className='mb-6 sm:mb-8'>
                        <h2 className='text-base sm:text-lg md:text-xl font-medium text-gray-800 mb-3 flex items-center gap-2'>
                            <FontAwesomeIcon icon={faFileContract} className='text-gray-400 text-sm sm:text-base' />
                            Agreement to Terms
                        </h2>
                        <p className='text-gray-600 leading-relaxed text-sm sm:text-base'>
                            By booking a session with Maple Street Photography, you agree to be bound by these Terms of Service. 
                            Please read them carefully before confirming your booking. If you do not agree with any part of these terms, 
                            please do not proceed with your booking.
                        </p>
                    </div>

                    {/* Booking and Payment */}
                    <div className='mb-6 sm:mb-8'>
                        <h2 className='text-base sm:text-lg md:text-xl font-medium text-gray-800 mb-3 flex items-center gap-2'>
                            <FontAwesomeIcon icon={faCalendarCheck} className='text-gray-400 text-sm sm:text-base' />
                            Booking and Payment
                        </h2>
                        <div className='space-y-3 sm:space-y-4'>
                            <div>
                                <h3 className='font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base'>Session Fee</h3>
                                <p className='text-gray-600 text-xs sm:text-sm leading-relaxed'>
                                    A non-refundable retainer of 50% is required to secure your session date. This retainer is applied 
                                    toward your total session fee. The remaining balance is due on or before the day of your session.
                                </p>
                            </div>
                            
                            <div>
                                <h3 className='font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base'>Payment Methods</h3>
                                <p className='text-gray-600 text-xs sm:text-sm leading-relaxed'>
                                    We accept bank transfers, GCash, and credit card payments. All payments must be in Philippine Peso (₱).
                                </p>
                            </div>
                            
                            <div>
                                <h3 className='font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base'>Prices</h3>
                                <p className='text-gray-600 text-xs sm:text-sm leading-relaxed'>
                                    All prices are subject to change without notice. However, once your session is booked and retainer paid, 
                                    the quoted price is guaranteed for that session.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Cancellation and Rescheduling */}
                    <div className='mb-6 sm:mb-8'>
                        <h2 className='text-base sm:text-lg md:text-xl font-medium text-gray-800 mb-3 flex items-center gap-2'>
                            <FontAwesomeIcon icon={faBan} className='text-gray-400 text-sm sm:text-base' />
                            Cancellation and Rescheduling
                        </h2>
                        <div className='space-y-3 sm:space-y-4'>
                            <div>
                                <h3 className='font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base'>Cancellation by Client</h3>
                                <p className='text-gray-600 text-xs sm:text-sm leading-relaxed'>
                                    The 50% retainer is non-refundable. If you cancel your session, this amount cannot be refunded or 
                                    transferred to a future session.
                                </p>
                            </div>
                            
                            <div>
                                <h3 className='font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base'>Rescheduling</h3>
                                <p className='text-gray-600 text-xs sm:text-sm leading-relaxed'>
                                    We understand that life happens. You may reschedule your session once without penalty, provided you 
                                    notify us at least 7 days before your scheduled date. Rescheduling within 7 days of your session may 
                                    incur an additional fee.
                                </p>
                            </div>
                            
                            <div>
                                <h3 className='font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base'>Cancellation by Photographer</h3>
                                <p className='text-gray-600 text-xs sm:text-sm leading-relaxed'>
                                    In the unlikely event that we need to cancel due to illness, emergency, or extreme weather, we will 
                                    work with you to reschedule. If we cannot reschedule, you will receive a full refund of all payments made.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Session Guidelines */}
                    <div className='mb-6 sm:mb-8'>
                        <h2 className='text-base sm:text-lg md:text-xl font-medium text-gray-800 mb-3'>Session Guidelines</h2>
                        <ul className='list-disc pl-5 text-gray-600 text-xs sm:text-sm space-y-1.5 sm:space-y-2'>
                            <li>Sessions typically last 1-2 hours depending on the package selected</li>
                            <li>Please arrive on time; late arrivals may result in shortened session time</li>
                            <li>For newborn sessions, we allow extra time for feeding and soothing</li>
                            <li>Parents are responsible for their children's behavior and safety during the session</li>
                            <li>We reserve the right to end a session if participants are uncooperative or unsafe</li>
                        </ul>
                    </div>

                    {/* Image Rights and Usage */}
                    <div className='mb-6 sm:mb-8'>
                        <h2 className='text-base sm:text-lg md:text-xl font-medium text-gray-800 mb-3 flex items-center gap-2'>
                            <FontAwesomeIcon icon={faImage} className='text-gray-400 text-sm sm:text-base' />
                            Image Rights and Usage
                        </h2>
                        <div className='space-y-3 sm:space-y-4'>
                            <div>
                                <h3 className='font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base'>Copyright</h3>
                                <p className='text-gray-600 text-xs sm:text-sm leading-relaxed'>
                                    Maple Street Photography retains all copyrights to the images captured during your session. This means 
                                    we own the images, but you receive a print release for personal use.
                                </p>
                            </div>
                            
                            <div>
                                <h3 className='font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base'>Personal Use</h3>
                                <p className='text-gray-600 text-xs sm:text-sm leading-relaxed'>
                                    You may print, share on social media, and use the images for personal, non-commercial purposes. You 
                                    may not sell the images or use them for commercial purposes without written consent.
                                </p>
                            </div>
                            
                            <div>
                                <h3 className='font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base'>Portfolio Use</h3>
                                <p className='text-gray-600 text-xs sm:text-sm leading-relaxed'>
                                    We may use select images from your session for our portfolio, website, and social media unless you 
                                    specifically request otherwise in writing.
                                </p>
                            </div>
                            
                            <div>
                                <h3 className='font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base'>Gallery Access</h3>
                                <p className='text-gray-600 text-xs sm:text-sm leading-relaxed'>
                                    Your online gallery will be available for 30 days. Please download your images within this period. 
                                    Extended gallery access may incur a fee.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Liability */}
                    <div className='mb-6 sm:mb-8'>
                        <h2 className='text-base sm:text-lg md:text-xl font-medium text-gray-800 mb-3'>Limitation of Liability</h2>
                        <p className='text-gray-600 text-xs sm:text-sm leading-relaxed'>
                            In the unlikely event that images are lost, damaged, or fail to be delivered due to equipment malfunction 
                            or other reasons, our liability is limited to a full refund of all payments made. We are not responsible for 
                            any additional expenses or damages.
                        </p>
                    </div>

                    {/* Governing Law */}
                    <div className='mb-6 sm:mb-8'>
                        <h2 className='text-base sm:text-lg md:text-xl font-medium text-gray-800 mb-3'>Governing Law</h2>
                        <p className='text-gray-600 text-xs sm:text-sm leading-relaxed'>
                            These Terms shall be governed by and construed in accordance with the laws of the Republic of the Philippines. 
                            Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of Makati City.
                        </p>
                    </div>

                    {/* Contact */}
                    <div className='bg-gray-50 p-4 sm:p-6 rounded-lg'>
                        <h2 className='text-base sm:text-lg md:text-xl font-medium text-gray-800 mb-3'>Questions?</h2>
                        <p className='text-gray-600 text-xs sm:text-sm leading-relaxed'>
                            If you have any questions about these Terms of Service, please contact us:
                        </p>
                        <p className='text-gray-600 text-xs sm:text-sm mt-3 break-all'>
                            <FontAwesomeIcon icon={faEnvelope} className='text-gray-400 mr-2' />
                            neilaaronmaplephoto@gmail.com
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MapleTermsOfService;