import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faChevronLeft, 
    faChevronRight, 
    faCalendarCheck,
    faAward,
    faClock,
    faCamera,
    faHeart,
    faStar
} from '@fortawesome/free-solid-svg-icons';
import MContactModal from '../components/modals/MContactModal';

// Sample images
import S1 from '../assets/MapleSample1.jpg';
import S2 from '../assets/MSample2.jpg';
import S3 from '../assets/MSample3.jpg';
import S4 from '../assets/MSample4.jpg';
import S5 from '../assets/Msample5jpg.jpg';
import S6 from '../assets/MSample6.jpg';

function Body() {
    const slides = [
        { id: 1, image: S1, title: "Newborn Wonder", description: "Tiny fingers, tiny toes – preserving the first precious days" },
        { id: 2, image: S2, title: "Maternity Glow", description: "Celebrating the beauty of new life and motherhood" },
        { id: 3, image: S3, title: "Family Love", description: "Genuine connections and laughter shared together" },
        { id: 4, image: S4, title: "Toddler Magic", description: "Curious eyes and playful spirits, frozen in time" },
        { id: 5, image: S5, title: "Milestone Moments", description: "First steps, first smiles, first memories" },
        { id: 6, image: S6, title: "Pure Emotion", description: "Unposed, unfiltered, unforgettable" }
    ];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section - Clean Slideshow */}
            <div className="relative w-full bg-gray-50">
                <div className="relative h-[480px] md:h-[600px] w-full overflow-hidden">
                    {slides.map((slide, index) => (
                        <div
                            key={slide.id}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                            }`}
                        >
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/20" />
                        </div>
                    ))}

                    {/* Slide Content */}
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white px-4">
                        <h2 className="text-4xl md:text-6xl font-light tracking-wide mb-4 animate-fade-in">
                            {slides[currentSlide].title}
                        </h2>
                        <p className="text-lg md:text-xl font-light text-white/90 max-w-2xl mb-8 animate-fade-in-up">
                            {slides[currentSlide].description}
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="group bg-white text-gray-900 px-8 py-3 rounded-full text-base font-medium
                                     hover:bg-gray-100 transition-all duration-300 flex items-center gap-2 shadow-sm"
                        >
                            <FontAwesomeIcon icon={faCalendarCheck} className="text-gray-600 group-hover:text-gray-900" />
                            Book a session
                        </button>
                    </div>

                    {/* Navigation Buttons */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full
                                 bg-white/10 backdrop-blur-sm flex items-center justify-center text-white
                                 hover:bg-white/30 transition-all duration-200"
                    >
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full
                                 bg-white/10 backdrop-blur-sm flex items-center justify-center text-white
                                 hover:bg-white/30 transition-all duration-200"
                    >
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>

                    {/* Slide Indicators */}
                    <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center gap-2">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`transition-all duration-300 rounded-full ${
                                    index === currentSlide
                                        ? 'w-8 h-1 bg-white'
                                        : 'w-4 h-1 bg-white/50 hover:bg-white/80'
                                }`}
                            >
                                <span className="sr-only">Slide {index + 1}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Welcome Message - Clean Card */}
           <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-20">
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 text-center">
                    <h2 className="text-2xl font-light text-gray-800 mb-2">Welcome to Maple Street Photography</h2>
                    <p className="text-gray-500 text-sm mb-3">Browse our portfolio and discover timeless photography for life's most precious moments.</p>
                    <div className="inline-block px-4 py-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600">💡 <span className="font-medium">Pro Tip:</span> Visit our Samples page to explore our packages</p>
                    </div>
                </div>
            </div>

            {/* About Section - Minimal */}
            <div className="max-w-6xl mx-auto px-4 py-20">
                <div className="text-center mb-12">
                    <span className="text-gray-400 text-xs uppercase tracking-[0.2em] font-medium">Our Philosophy</span>
                    <h2 className="text-3xl md:text-4xl font-light text-gray-900 mt-2 mb-4">
                        Timeless. Genuine. Yours.
                    </h2>
                    <div className="w-12 h-px bg-gray-300 mx-auto" />
                </div>

                <div className="max-w-3xl mx-auto text-center">
                    <p className="text-gray-600 leading-relaxed mb-6">
                        We believe that life's most beautiful stories are written in the quiet, candid moments.
                        Specializing in newborn, maternity, and family milestones, we offer more than just photos
                        — we offer an experience you'll cherish forever.
                    </p>
                    <p className="text-gray-500 text-sm">
                        Natural light • Genuine emotion • Minimalist aesthetic
                    </p>
                </div>

                {/* Stats - Clean Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
                    {[
                        { icon: faAward, value: "5+", label: "Years Experience" },
                        { icon: faHeart, value: "200+", label: "Happy Families" },
                        { icon: faCamera, value: "6", label: "Signature Packages" },
                        { icon: faStar, value: "100%", label: "Natural Light" }
                    ].map((stat, idx) => (
                        <div key={idx} className="text-center p-4">
                            <FontAwesomeIcon icon={stat.icon} className="text-gray-400 text-2xl mb-3" />
                            <div className="text-2xl font-light text-gray-800">{stat.value}</div>
                            <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            <MContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}

export default Body;