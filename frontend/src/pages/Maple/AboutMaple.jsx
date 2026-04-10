import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCamera,
    faStar,
    faLeaf,
    faClock,
    faAward,
    faPlay,
    faPause,
    faVolumeUp,
    faVolumeMute,
    faTimes,
    faChevronLeft,
    faChevronRight,
    faInfoCircle,
    faCalendarAlt,
    faMapMarkerAlt,
    faTag,
    faExpand,
    faArrowLeft,
    faArrowRight,
} from '@fortawesome/free-solid-svg-icons';


// Import images
import NielLogo from '../../assets/NielLogo.jpg';
import Owner from '../../assets/MaplePic6.jpg';
import Team1 from '../../assets/MaplePic7.jpg'
import Team2 from '../../assets/MaplePic1.jpg'
import Studio from '../../assets/MaplePic4.png'

// Import videos
import NewbornSession from '../../assets/videos/Vid1.mp4';
import MaternitySession from '../../assets/videos/Vid3.mp4';

// Modal 
import MContactModal from '../../components/modals/MContactModal.jsx';


function AboutMaple() {
    const [playingVideo, setPlayingVideo] = useState(null);
    const [mutedStates, setMutedStates] = useState({});
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [showPlayButton, setShowPlayButton] = useState({});
    const videoRefs = useRef({});
    const modalVideoRef = useRef(null);
    const hoverTimeoutRef = useRef(null);

    const [isModalOpen, setIsModalOpen] = useState(false);

    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Clean up hover timeout on unmount
    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
        };
    }, []);

    // Behind the scenes videos
    const behindScenesVideos = [
        {
            id: 1,
            video: NewbornSession,
            title: "Newborn Session Behind the Scenes",
            description: "Watch how we gently capture those precious first moments",
            date: "March 2026",
            location: "Studio",
            category: "Newborn",
        },
        {
            id: 2,
            video: MaternitySession,
            title: "Newborn Glow Session",
            description: "Celebrating the beauty of new life and motherhood",
            date: "March 2026",
            location: "Studio",
            category: "Newborn",
        }
    ];

    const togglePlay = (videoId, e) => {
        e.stopPropagation();
        const videoElement = videoRefs.current[videoId];
        
        if (playingVideo === videoId) {
            videoElement.pause();
            setPlayingVideo(null);
            setShowPlayButton(prev => ({ ...prev, [videoId]: true }));
        } else {
            if (playingVideo && videoRefs.current[playingVideo]) {
                videoRefs.current[playingVideo].pause();
                setShowPlayButton(prev => ({ ...prev, [playingVideo]: true }));
            }
            videoElement.play();
            setPlayingVideo(videoId);
            setShowPlayButton(prev => ({ ...prev, [videoId]: false }));
        }
    };

    // Handle video hover - always show button on hover, regardless of playing state
    const handleVideoMouseEnter = (videoId) => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
        // Always show button on hover
        setShowPlayButton(prev => ({ ...prev, [videoId]: true }));
    };

    const handleVideoMouseLeave = (videoId) => {
        hoverTimeoutRef.current = setTimeout(() => {
            // Hide button when cursor leaves
            setShowPlayButton(prev => ({ ...prev, [videoId]: false }));
        }, 300);
    };

    // Listen to video events to update play button state
    const handleVideoPlay = (videoId) => {
        setPlayingVideo(videoId);
        setShowPlayButton(prev => ({ ...prev, [videoId]: false }));
    };

    const handleVideoPause = (videoId) => {
        setPlayingVideo(null);
        setShowPlayButton(prev => ({ ...prev, [videoId]: true }));
    };

    const handleVideoEnded = (videoId) => {
        setPlayingVideo(null);
        setShowPlayButton(prev => ({ ...prev, [videoId]: true }));
    };

    const toggleMute = (videoId, e) => {
        e.stopPropagation();
        setMutedStates(prev => ({
            ...prev,
            [videoId]: !prev[videoId]
        }));
    };

    const openVideoModal = (video) => {
        setSelectedVideo(video);
        if (playingVideo) {
            const currentVideo = videoRefs.current[playingVideo];
            if (currentVideo) {
                currentVideo.pause();
            }
            setPlayingVideo(null);
        }
    };

    const closeVideoModal = () => {
        if (modalVideoRef.current) {
            modalVideoRef.current.pause();
        }
        setSelectedVideo(null);
    };

    const navigateVideo = (direction) => {
        const currentIndex = behindScenesVideos.findIndex(v => v.id === selectedVideo.id);
        let newIndex;
        
        if (direction === 'prev') {
            newIndex = currentIndex > 0 ? currentIndex - 1 : behindScenesVideos.length - 1;
        } else {
            newIndex = currentIndex < behindScenesVideos.length - 1 ? currentIndex + 1 : 0;
        }
        
        setSelectedVideo(behindScenesVideos[newIndex]);
    };

    // Book a session button handler
    const handleBookSession = () => {
        window.location.href = '/contact';
    };

    return (
        <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white'>
            {/* Hero Section - Responsive height */}
            <div className='relative h-[50vh] sm:h-[60vh] md:h-[70vh] min-h-[400px] sm:min-h-[450px] md:min-h-[500px] overflow-hidden bg-gray-900'>
                {/* Background */}
                <div className='absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800'></div>
                
                {/* Overlay */}
                <div className='absolute inset-0 bg-black/40'></div>
                
                {/* Button for home - Responsive positioning */}
                <div className='absolute top-3 sm:top-4 md:top-6 left-3 sm:left-4 md:left-6 z-20'>
                    <button
                        onClick={() => window.location.href = '/main'}
                        className='flex items-center gap-1 sm:gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-300 border border-white/20 hover:border-white/30'
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className='w-3 h-3 sm:w-4 sm:h-4' />
                        <span className='text-xs sm:text-sm font-medium hidden sm:inline'>Back to Home</span>
                    </button>
                </div>

                {/* Button for Samples - Responsive positioning */}
                <div className='absolute top-3 sm:top-4 md:top-6 right-3 sm:right-4 md:right-6 z-20'>
                    <button
                        onClick={() => window.location.href = '/samples'}
                        className='flex items-center gap-1 sm:gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-300 border border-white/20 hover:border-white/30'
                    >
                        <span className='text-xs sm:text-sm font-medium hidden sm:inline'>View Samples</span>
                        <FontAwesomeIcon icon={faArrowRight} className='w-3 h-3 sm:w-4 sm:h-4' />
                    </button>
                </div>
                
                {/* Content - Responsive padding and text sizes */}
                <div className='absolute inset-0 flex items-center justify-center z-10 px-4'>
                    <div className='text-center text-white max-w-4xl'>
                        <div className='flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6'>
                            <img 
                                src={NielLogo} 
                                alt="Maple Street Logo" 
                                className='w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white shadow-xl object-cover'
                            />
                            <div className='text-center sm:text-left'>
                                <h1 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light mb-1 sm:mb-2'>Maple Street Photography</h1>
                                <p className='text-gray-200 text-sm sm:text-base md:text-lg lg:text-xl'>Capturing Life's Most Beautiful Moments</p>
                            </div>
                        </div>
                        <div className='w-16 sm:w-20 h-0.5 bg-orange-400 mx-auto mb-4 sm:mb-6'></div>
                        <p className='text-sm sm:text-base md:text-lg text-gray-200 leading-relaxed max-w-xl mx-auto px-2'>
                            We believe that life's most beautiful stories are written in the quiet, candid moments. 
                            Since 2019, we've been preserving memories with warmth, artistry, and a minimalist touch.
                        </p>
                    </div>
                </div>
            </div>

            {/* Our Story Section - Responsive grid */}
            <div className='max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16'>
                <div className='grid md:grid-cols-2 gap-8 sm:gap-12 items-center'>
                    <div className='order-2 md:order-1'>
                        <h2 className='text-2xl sm:text-3xl font-light text-gray-800 mb-3 sm:mb-4'>Our Story</h2>
                        <div className='w-16 h-0.5 bg-gray-400 mb-4 sm:mb-6'></div>
                        <p className='text-gray-600 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base'>
                            Founded in 2019 by Neil Aaron Maple, Maple Street Photography began with a simple mission: 
                            to capture the authentic emotions and genuine connections that make life beautiful. What started 
                            as a passion for photographing family gatherings quickly grew into a full-service photography 
                            studio specializing in life's most precious milestones.
                        </p>
                        <p className='text-gray-600 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base'>
                            Based in the heart of Quezon City, we've had the privilege of documenting hundreds of 
                            newborn firsts, maternity glows, family laughter, and love stories. Our approach is simple — 
                            we don't just take pictures; we create heirlooms that families will cherish for generations.
                        </p>
                        <p className='text-gray-600 leading-relaxed text-sm sm:text-base'>
                            Every session with us is an experience. From the moment you book to the day you receive 
                            your gallery, we're with you every step of the way, ensuring your memories are preserved 
                            with the care and artistry they deserve.
                        </p>
                    </div>
                    <div className='relative order-1 md:order-2'>
                        <img 
                            src={Studio} 
                            alt="Maple Street Studio" 
                            className='rounded-xl shadow-xl hover:scale-105 transition-all duration-300 w-full object-cover'
                        />
                        <div className='absolute -bottom-3 sm:-bottom-5 -left-3 sm:-left-5 bg-white p-2 sm:p-4 rounded-lg shadow-lg'>
                            <p className='text-gray-800 font-medium text-sm sm:text-base'>5+ Years</p>
                            <p className='text-xs sm:text-sm text-gray-500'>Of Storytelling</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Behind the Scenes Video Gallery - Responsive */}
            <div className='bg-gray-50 py-12 sm:py-16'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6'>
                    <h2 className='text-2xl sm:text-3xl font-light text-gray-800 mb-3 sm:mb-4 text-center'>Behind the Lens</h2>
                    <div className='w-16 h-0.5 bg-gray-400 mb-4 mx-auto'></div>
                    <p className='text-gray-500 text-center mb-8 sm:mb-12 max-w-2xl mx-auto text-sm sm:text-base px-4'>
                        Hover over video to see play button • Click play to watch • Tap video to view full screen
                    </p>
                    
                    <div className='grid md:grid-cols-2 gap-4 sm:gap-6 max-w-6xl mx-auto'>
                        {behindScenesVideos.map(video => (
                            <div 
                                key={video.id}
                                className='bg-white rounded-xl shadow-md overflow-hidden group'
                            >
                                <div 
                                    className='relative aspect-video bg-black cursor-pointer'
                                    onClick={() => openVideoModal(video)}
                                    onMouseEnter={() => handleVideoMouseEnter(video.id)}
                                    onMouseLeave={() => handleVideoMouseLeave(video.id)}
                                >
                                    <video 
                                        ref={el => videoRefs.current[video.id] = el}
                                        src={video.video}
                                        loop
                                        muted={mutedStates[video.id] || false}
                                        playsInline
                                        onPlay={() => handleVideoPlay(video.id)}
                                        onPause={() => handleVideoPause(video.id)}
                                        onEnded={() => handleVideoEnded(video.id)}
                                        className='w-full h-full object-cover'
                                    />
                                    
                                    {/* Play Button - Shows on hover only */}
                                    {showPlayButton[video.id] && (
                                        <div className='absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-300'>
                                            <button 
                                                onClick={(e) => togglePlay(video.id, e)}
                                                className='w-12 h-12 sm:w-16 sm:h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl hover:bg-white hover:scale-110 transition-all duration-200'
                                            >
                                                <FontAwesomeIcon 
                                                    icon={playingVideo === video.id ? faPause : faPlay} 
                                                    className='text-gray-800 text-xl sm:text-2xl ml-0.5 sm:ml-1' 
                                                />
                                            </button>
                                        </div>
                                    )}
                                    
                                    {/* Sound Control */}
                                    <button 
                                        onClick={(e) => toggleMute(video.id, e)}
                                        className='absolute top-2 right-2 z-20 bg-black/50 hover:bg-black/70 rounded-full p-1.5 sm:p-2 text-white transition-colors'
                                    >
                                        <FontAwesomeIcon icon={mutedStates[video.id] ? faVolumeMute : faVolumeUp} className='text-xs sm:text-sm' />
                                    </button>
                                    
                                    {/* Duration Badge */}
                                    <span className='absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded'>
                                        {video.duration}
                                    </span>

                                    {/* Expand/Caption */}
                                    <div className='absolute bottom-2 left-2 bg-black/50 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex items-center gap-1'>
                                        <FontAwesomeIcon icon={faExpand} className='text-xs' />
                                        <span className='hidden sm:inline'>Click to expand</span>
                                        <span className='sm:hidden'>Expand</span>
                                    </div>
                                </div>
                                <div className='p-3 sm:p-4'>
                                    <h3 className='font-medium text-gray-800 mb-1 text-sm sm:text-base'>{video.title}</h3>
                                    <p className='text-xs sm:text-sm text-gray-500'>{video.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Values Section - Responsive grid */}
            <div className='max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16'>
                <h2 className='text-2xl sm:text-3xl font-light text-gray-800 mb-3 sm:mb-4 text-center'>Our Philosophy</h2>
                <div className='w-16 h-0.5 bg-gray-400 mb-8 sm:mb-12 mx-auto'></div>
                
                <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8'>
                    <div className='bg-white p-6 sm:p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow'>
                        <div className='w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 sm:mb-6 mx-auto'>
                            <FontAwesomeIcon icon={faLeaf} className='text-gray-600 text-xl sm:text-2xl' />
                        </div>
                        <h3 className='text-lg sm:text-xl font-medium text-gray-800 mb-2 sm:mb-3 text-center'>Minimalist</h3>
                        <p className='text-gray-600 text-center text-xs sm:text-sm leading-relaxed'>
                            We believe in simplicity. Clean compositions, natural light, and unposed moments 
                            that let your true beauty shine through.
                        </p>
                    </div>
                    
                    <div className='bg-white p-6 sm:p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow'>
                        <div className='w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 sm:mb-6 mx-auto'>
                            <FontAwesomeIcon icon={faClock} className='text-gray-600 text-xl sm:text-2xl' />
                        </div>
                        <h3 className='text-lg sm:text-xl font-medium text-gray-800 mb-2 sm:mb-3 text-center'>Timeless</h3>
                        <p className='text-gray-600 text-center text-xs sm:text-sm leading-relaxed'>
                            Images that never go out of style. We avoid trendy edits so your photos look 
                            just as beautiful decades from now.
                        </p>
                    </div>
                    
                    <div className='bg-white p-6 sm:p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1'>
                        <div className='w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 sm:mb-6 mx-auto'>
                            <FontAwesomeIcon icon={faAward} className='text-gray-600 text-xl sm:text-2xl' />
                        </div>
                        <h3 className='text-lg sm:text-xl font-medium text-gray-800 mb-2 sm:mb-3 text-center'>Premium Service</h3>
                        <p className='text-gray-600 text-center text-xs sm:text-sm leading-relaxed'>
                            From consultation to delivery, we provide a premium experience that makes you 
                            feel comfortable, valued, and cared for.
                        </p>
                    </div>
                </div>
            </div>

            {/* Team Section - Responsive */}
            <div className='bg-gray-50 py-12 sm:py-16'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6'>
                    <h2 className='text-2xl sm:text-3xl font-light text-gray-800 mb-3 sm:mb-4 text-center'>Meet the Team</h2>
                    <div className='w-16 h-0.5 bg-gray-400 mb-8 sm:mb-12 mx-auto'></div>
                    
                    <div className='grid md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto mb-8 sm:mb-12'>
                        {/* Neil */}
                        <div className='bg-white rounded-xl shadow-md overflow-hidden hover:scale-105 transition-transform duration-300'>
                            <div className='relative h-64 sm:h-80'>
                                <img 
                                    src={Owner} 
                                    alt="Neil Aaron" 
                                    className='w-full h-full object-cover'
                                />
                            </div>
                            <div className='p-4 sm:p-6'>
                                <h3 className='text-lg sm:text-xl font-medium text-gray-800 mb-1'>Neil Aaron Tupaz</h3>
                                <p className='text-xs sm:text-sm text-orange-500 mb-2 sm:mb-3'>Founder & Lead Photographer</p>
                                <p className='text-gray-600 text-xs sm:text-sm'>
                                    With over 8 years of experience, Neil brings an artistic eye and calming presence to every session. 
                                    Specializing in newborn and family photography, he has a gift for capturing genuine emotions.
                                </p>
                            </div>
                        </div>
                        
                        {/* Marie */}
                        <div className='bg-white rounded-xl shadow-md overflow-hidden hover:scale-105 transition-transform duration-300'>
                            <div className='relative h-64 sm:h-80'>
                                <img 
                                    src={Team1} 
                                    alt="Marie Tupaz" 
                                    className='w-full h-full object-cover'
                                />
                            </div>
                            <div className='p-4 sm:p-6'>
                                <h3 className='text-lg sm:text-xl font-medium text-gray-800 mb-1'>Marie Tupaz</h3>
                                <p className='text-xs sm:text-sm text-orange-500 mb-2 sm:mb-3'>Associate Photographer</p>
                                <p className='text-gray-600 text-xs sm:text-sm'>
                                    Marie specializes in maternity and portrait sessions. Her warm personality puts clients at ease, 
                                    resulting in natural, beautiful images that reflect each family's unique dynamic.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Team Group Photo */}
                    <div className='max-w-3xl mx-auto'>
                        <div className='bg-white rounded-xl shadow-md overflow-hidden hover:scale-105 transition-transform duration-300'>
                            <div className='relative h-64 sm:h-80 md:h-96'>
                                <img 
                                    src={Team2} 
                                    alt="Maple Street Photography Team" 
                                    className='w-full h-full object-cover'
                                />
                            </div>
                            <div className='p-6 sm:p-8 text-center'>
                                <h3 className='text-xl sm:text-2xl font-medium text-gray-800 mb-2 sm:mb-3'>The Maple Street Family</h3>
                                <p className='text-gray-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed px-2'>
                                    Behind every beautiful photo is a team of passionate storytellers. 
                                    Together, we work to make every session comfortable, enjoyable, and memorable — 
                                    because your family deserves nothing less.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Video Lightbox Modal - Responsive */}
            {selectedVideo && (
                <div 
                    className='fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-2 sm:p-4'
                    onClick={closeVideoModal}
                >
                    <button
                        onClick={closeVideoModal}
                        className='absolute top-2 sm:top-4 right-2 sm:right-4 text-white hover:text-gray-300 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-black/50 rounded-full flex items-center justify-center'
                    >
                        <FontAwesomeIcon icon={faTimes} className='text-base sm:text-xl' />
                    </button>
                    
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigateVideo('prev');
                        }}
                        className='absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 w-8 h-8 sm:w-10 sm:h-10 bg-black/50 rounded-full flex items-center justify-center'
                    >
                        <FontAwesomeIcon icon={faChevronLeft} className="text-sm sm:text-base" />
                    </button>
                    
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigateVideo('next');
                        }}
                        className='absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 w-8 h-8 sm:w-10 sm:h-10 bg-black/50 rounded-full flex items-center justify-center'
                    >
                        <FontAwesomeIcon icon={faChevronRight} className="text-sm sm:text-base" />
                    </button>

                    <div 
                        className='relative max-w-4xl w-full'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <video 
                            ref={modalVideoRef}
                            src={selectedVideo.video}
                            controls
                            autoPlay
                            playsInline
                            className='w-full h-auto rounded-lg shadow-2xl'
                        />
                        
                        <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 sm:p-6 rounded-b-lg'>
                            <div className='flex flex-col sm:flex-row sm:items-center justify-between text-white gap-2 sm:gap-0'>
                                <div>
                                    <h3 className='text-sm sm:text-base md:text-xl font-medium mb-1'>{selectedVideo.title}</h3>
                                    <p className='text-xs sm:text-sm text-gray-300 mb-1 sm:mb-2'>{selectedVideo.description}</p>
                                    <div className='flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-400'>
                                        <span className='flex items-center gap-1'>
                                            <FontAwesomeIcon icon={faCalendarAlt} className='text-xs' />
                                            {selectedVideo.date}
                                        </span>
                                        <span className='flex items-center gap-1'>
                                            <FontAwesomeIcon icon={faMapMarkerAlt} className='text-xs' />
                                            {selectedVideo.location}
                                        </span>
                                        <span className='flex items-center gap-1'>
                                            <FontAwesomeIcon icon={faTag} className='text-xs' />
                                            {selectedVideo.category}
                                        </span>
                                        <span className='flex items-center gap-1'>
                                            Duration: {selectedVideo.duration}
                                        </span>
                                    </div>
                                </div>
                                <button className='w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors'>
                                    <FontAwesomeIcon icon={faInfoCircle} className='text-white text-xs' />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Call to Action - Responsive */}
            <div className='relative h-64 sm:h-80 md:h-96 overflow-hidden bg-gray-800'>
                <div className='absolute inset-0 bg-black/60'></div>
                
                <div className='relative z-10 h-full flex items-center justify-center text-center text-white px-4'>
                    <div>
                        <h2 className='text-2xl sm:text-3xl font-light mb-3 sm:mb-4'>Ready to Create Your Story?</h2>
                        <p className='text-gray-200 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base px-4'>
                            Let's capture your family's precious moments together. Book a session today.
                        </p>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className='bg-white text-gray-800 px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors text-sm sm:text-base'
                        >
                            Book a Session
                        </button>
                    </div>
                </div>
            </div>
            <MContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}

export default AboutMaple;