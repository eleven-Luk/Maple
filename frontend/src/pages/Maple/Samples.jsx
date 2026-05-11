// pages/Maple/Samples.jsx - Updated with MSamples card styling

import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCamera,
    faSearch,
    faTimes,
    faChevronLeft,
    faChevronRight,
    faMapMarkerAlt,
    faCalendarAlt,
    faArrowLeft,
    faStar,
    faImages,
    faVenus,
    faMars,
} from '@fortawesome/free-solid-svg-icons';

import bgImg from '../../assets/NielLogo.jpg';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Home from '../../assets/home.png';
import Studio from '../../assets/studio.png';

function Samples() {
    const [samples, setSamples] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedImage, setSelectedImage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
    const itemsPerPage = 12;

    const slides = [
        {
            id: 1,
            image: Home,
            title: "Home Setup",
            description: "Professional photography in the comfort of your home"
        },
        {
            id: 2,
            image: Studio,
            title: "Studio Setup",
            description: "State-of-the-art studio with professional lighting and backdrops"
        }
    ];

    const packages = [
        {
            name: "Coral",
            features: [
                "1 Setup (Wrapped in basket or Fur)",
                "Family Portraits in White Background",
                "20-30 Edited Pictures"
            ]
        },
        {
            name: "Crimson",
            features: [
                "2 Setup Options",
                "Family Portraits in White & Colored Background",
                "30-40 Edited Pictures"
            ]
        },
        {
            name: "Gold",
            features: [
                "3 Setup Options",
                "Family Portraits in White & Colored Background",
                "30-40 Edited Pictures"
            ]
        }
    ];

    // Set-up color mapping (same as MSamples)
    const setupColors = {
            basket: 'from-amber-400 to-orange-500',
            fur: 'from-purple-300 to-purple-500',
            bean: 'from-green-400 to-emerald-500'
        };

    

    // Auto-rotate slides
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    const fetchSamples = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:5000/api/samples/all');
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const result = await response.json();

            if (result.success) {
                const sortedSamples = (result.data || []).sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                setSamples(sortedSamples);
            } else {
                throw new Error(result.message || 'Failed to fetch samples');
            }
        } catch (error) {
            console.error('Error fetching samples:', error);
            setError(error.message || 'Failed to fetch samples');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSamples();
    }, [fetchSamples]);

    const getCategories = () => {
        const categoryMap = new Map();
        
        samples.forEach(sample => {
            const category = sample.setupType || sample.category || 'uncategorized';
            if (category) {
                categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
            }
        });
        
        const categories = Array.from(categoryMap.entries()).map(([id, count]) => ({
            id,
            name: id ? (id.charAt(0).toUpperCase() + id.slice(1)) : 'Uncategorized',
            count
        }));
        
        return [{ id: 'all', name: 'All', count: samples.length }, ...categories];
    };

    const categories = getCategories();

    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://via.placeholder.com/400x300?text=No+Image';
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:5000${imagePath}`;
    };

    const getSampleImages = (sample) => {
        if (sample.images && sample.images.length > 0) {
            return sample.images;
        }
        if (sample.image) {
            return [{ url: sample.image, isPrimary: true }];
        }
        return [];
    };

    const getPrimaryImageUrl = (sample) => {
        const images = getSampleImages(sample);
        if (images.length === 0) return null;
        const primary = images.find(img => img.isPrimary) || images[0];
        return primary.url;
    };

    const filteredSamples = samples.filter(sample => {
        const category = sample.setupType || sample.category || 'uncategorized';
        const matchesCategory = selectedCategory === 'all' || category === selectedCategory;
        const matchesSearch = sample.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             sample.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             sample.location?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const totalPages = Math.ceil(filteredSamples.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredSamples.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, searchTerm]);

    const featuredSamples = samples.filter(s => s.featured === true).slice(0, 3);
    const currentLightboxImages = selectedImage ? getSampleImages(selectedImage) : [];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner message="Loading portfolio..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FontAwesomeIcon icon={faCamera} className="text-red-400 text-2xl" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Unable to load samples</h3>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <button 
                        onClick={fetchSamples}
                        className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const formatSetupType = (setupType) => {
            if (!setupType) return '';
            // Replace & with space, then capitalize each word
            return setupType
                .replace(/&/g, ' & ')
                .split(/[\s-]+/)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        };

    

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Bar */}
            <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img 
                                src={bgImg} 
                                alt="Logo"   
                                className="w-10 h-10 rounded-lg shadow-sm border border-gray-200 object-cover"
                            />
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900">Our Portfolio</h1>
                                <p className="text-xs text-gray-500">Professional Photography</p>
                            </div>
                        </div>
                        <button
                            onClick={() => window.location.href = '/main'}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
                            <span className="hidden sm:inline">Back to Home</span>
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Hero Section */}
                <div className="mb-12">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                        <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] overflow-hidden">
                            <img 
                                src={slides[currentSlide].image} 
                                alt={slides[currentSlide].title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/1200x500?text=Image+Not+Found';
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            
                            <button
                                onClick={prevSlide}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white w-12 h-12 rounded-full flex items-center justify-center transition-colors"
                            >
                                <FontAwesomeIcon icon={faChevronLeft} className="text-lg" />
                            </button>
                            
                            <button
                                onClick={nextSlide}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white w-12 h-12 rounded-full flex items-center justify-center transition-colors"
                            >
                                <FontAwesomeIcon icon={faChevronRight} className="text-lg" />
                            </button>

                            <div className="absolute top-0 left-2 right-0 p-2">
                                <h2 className="text-2xl sm:text-3xl font-light-mono opacity-90 text-white mb-2">
                                    {slides[currentSlide].title}
                                </h2>
                            </div>

                            <div className="absolute bottom-4 right-4 flex gap-2">
                                {slides.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentSlide(index)}
                                        className={`h-1.5 rounded-full transition-all ${
                                            currentSlide === index
                                                ? 'w-8 bg-white'
                                                : 'w-2 bg-white/50 hover:bg-white/80'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-mono">Packages</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {packages.map((pkg, index) => {
                                    const bgColors = [
                                        'bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-400',
                                        'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200',
                                        'bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-300'
                                    ];
                                    const textColors = ['text-amber-900', 'text-blue-900', 'text-yellow-900'];
                                    const featureTextColors = ['text-amber-700', 'text-blue-700', 'text-yellow-700'];
                                    const dotColors = ['bg-amber-400', 'bg-blue-400', 'bg-yellow-400'];
                                    
                                    return (
                                        <div key={index} className={`p-4 rounded-xl ${bgColors[index]}`}>
                                            <h4 className={`font-semibold mb-3 ${textColors[index]}`}>{pkg.name}</h4>
                                            <ul className="space-y-2">
                                                {pkg.features.map((feature, i) => (
                                                    <li key={i} className={`flex items-start gap-2 text-sm ${featureTextColors[index]}`}>
                                                        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[index]}`} />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Featured Work Section - MSamples Card Style */}
                {featuredSamples.length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
                            <h2 className="text-2xl font-bold text-gray-900">Featured Work</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredSamples.map(sample => {
                                const images = getSampleImages(sample);
                                const primaryImage = images.find(img => img.isPrimary) || images[0];
                                const imageUrl = primaryImage?.url;
                                return (
                                    <div 
                                        key={sample._id}
                                        className="group cursor-pointer bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
                                        onClick={() => { setSelectedImage(sample); setLightboxImageIndex(0); }}
                                    >
                                        <div className="relative aspect-[4/3] overflow-hidden">
                                            <img 
                                                src={getImageUrl(imageUrl)} 
                                                alt={sample.title}
                                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                                                }}
                                            />
                                            {/* Image count badge */}
                                            {images.length > 1 && (
                                                <span className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-10">
                                                    <FontAwesomeIcon icon={faImages} className="text-xs" />
                                                    {images.length}
                                                </span>
                                            )}
                                            {/* Featured badge */}
                                            <span className="absolute top-3 left-3 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-10">
                                                <FontAwesomeIcon icon={faStar} className="text-xs" />
                                                Featured
                                            </span>
                                            {/* Setup Type badge */}
                                           <span className={`absolute bottom-3 left-3 bg-gradient-to-r ${setupColors[sample.setupType] || 'from-gray-500 to-gray-700'} text-white text-xs px-2 py-1 rounded-full`}>
                                                {formatSetupType(sample.setupType)}
                                            </span>

                                            {/* Gender badge */}
                                            {sample.gender && (
                                                <span className="absolute bottom-3 right-3 bg-white/90 text-gray-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                                    <FontAwesomeIcon icon={sample.gender === 'boy' ? faMars : faVenus} className={sample.gender === 'boy' ? 'text-blue-500' : 'text-pink-500'} />
                                                    {sample.gender?.charAt(0).toUpperCase() + sample.gender?.slice(1)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-900 mb-1">{sample.title}</h3>
                                            <p className="text-xs text-gray-500 mb-2">
                                                {sample.setupType?.charAt(0).toUpperCase() + sample.setupType?.slice(1)} {sample.gender ? `• ${sample.gender}` : ''}
                                            </p>
                                            <p className="text-sm text-gray-500 line-clamp-2">{sample.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Gallery Section - MSamples Card Style */}
                <div>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1 relative">
                            <FontAwesomeIcon 
                                icon={faSearch} 
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                placeholder="Search by title, description, or location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                            />
                        </div>
                        {categories.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {categories.map(category => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-all ${
                                            selectedCategory === category.id
                                                ? 'bg-gray-900 text-white'
                                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                        }`}
                                    >
                                        {category.name}
                                        <span className="ml-2 opacity-60">({category.count})</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {currentItems.length === 0 ? (
                        <div className="text-center py-16">
                            <FontAwesomeIcon icon={faCamera} className="text-4xl text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-600 mb-2">No samples found</h3>
                            <p className="text-gray-400">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {currentItems.map(sample => {
                                    const images = getSampleImages(sample);
                                    const primaryImage = images.find(img => img.isPrimary) || images[0];
                                    const imageUrl = primaryImage?.url;
                                    return (
                                        <div 
                                            key={sample._id}
                                            className="group cursor-pointer bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
                                            onClick={() => { setSelectedImage(sample); setLightboxImageIndex(0); }}
                                        >
                                            <div className="relative aspect-square overflow-hidden">
                                                <img 
                                                    src={getImageUrl(imageUrl)} 
                                                    alt={sample.title}
                                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                                                    }}
                                                />
                                                {/* Image count badge */}
                                                {images.length > 1 && (
                                                    <span className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-10">
                                                        <FontAwesomeIcon icon={faImages} className="text-xs" />
                                                        {images.length}
                                                    </span>
                                                )}
                                                {/* Featured badge */}
                                                {sample.featured && (
                                                    <span className="absolute top-3 left-3 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-10">
                                                        <FontAwesomeIcon icon={faStar} className="text-xs" />
                                                        Featured
                                                    </span>
                                                )}
                                                {/* Setup Type badge */}
                                               <span className={`absolute bottom-3 left-3 bg-gradient-to-r ${setupColors[sample.setupType] || 'from-gray-500 to-gray-700'} text-white text-xs px-2 py-1 rounded-full`}>
                                                    {formatSetupType(sample.setupType)}
                                                </span>

                                                {/* Gender badge */}
                                                {sample.gender && (
                                                    <span className="absolute bottom-3 right-3 bg-white/90 text-gray-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                                        <FontAwesomeIcon icon={sample.gender === 'boy' ? faMars : faVenus} className={sample.gender === 'boy' ? 'text-blue-500' : 'text-pink-500'} />
                                                        {sample.gender?.charAt(0).toUpperCase() + sample.gender?.slice(1)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-medium text-gray-900 mb-1 truncate">{sample.title}</h3>
                                                <p className="text-xs text-gray-500 mb-2">
                                                    {sample.setupType?.charAt(0).toUpperCase() + sample.setupType?.slice(1)} {sample.gender ? `• ${sample.gender}` : ''}
                                                </p>
                                                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{sample.description}</p>
                                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                                    {sample.location && (
                                                        <span className="flex items-center gap-1">
                                                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                                                            {sample.location}
                                                        </span>
                                                    )}
                                                    {sample.date && (
                                                        <span className="flex items-center gap-1">
                                                            <FontAwesomeIcon icon={faCalendarAlt} />
                                                            {sample.date}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>
                                    
                                    <div className="flex items-center gap-2">
                                        {[...Array(totalPages)].map((_, i) => {
                                            const pageNum = i + 1;
                                            if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                                                return (
                                                    <button key={pageNum} onClick={() => setCurrentPage(pageNum)}
                                                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                                                        {pageNum}
                                                    </button>
                                                );
                                            } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                                return <span key={pageNum} className="text-gray-400">...</span>;
                                            }
                                            return null;
                                        })}
                                    </div>
                                    
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 w-12 h-12 bg-black/50 rounded-full flex items-center justify-center"
                    >
                        <FontAwesomeIcon icon={faTimes} className="text-xl" />
                    </button>
                    
                    {currentLightboxImages.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setLightboxImageIndex((prev) => 
                                    prev === 0 ? currentLightboxImages.length - 1 : prev - 1
                                );
                            }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 w-12 h-12 bg-black/50 rounded-full flex items-center justify-center z-10"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                    )}
                    
                    {currentLightboxImages.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setLightboxImageIndex((prev) => 
                                    (prev + 1) % currentLightboxImages.length
                                );
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 w-12 h-12 bg-black/50 rounded-full flex items-center justify-center z-10"
                        >
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    )}

                    <div 
                        className="relative max-w-5xl max-h-[90vh] w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img 
                            src={getImageUrl(currentLightboxImages[lightboxImageIndex]?.url)}
                            alt={selectedImage.title}
                            className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                            }}
                        />
                        
                        {currentLightboxImages.length > 1 && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
                                {lightboxImageIndex + 1} / {currentLightboxImages.length}
                            </div>
                        )}
                        
                        {currentLightboxImages.length > 1 && (
                            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5">
                                {currentLightboxImages.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setLightboxImageIndex(index);
                                        }}
                                        className={`w-2 h-2 rounded-full transition-all ${
                                            index === lightboxImageIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                        
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 rounded-b-lg">
                            <h3 className="text-xl font-semibold text-white mb-2">{selectedImage.title}</h3>
                            <p className="text-sm text-gray-300 mb-3">{selectedImage.description}</p>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                                {selectedImage.date && (
                                    <span className="flex items-center gap-1">
                                        <FontAwesomeIcon icon={faCalendarAlt} />
                                        {selectedImage.date}
                                    </span>
                                )}
                                {selectedImage.location && (
                                    <span className="flex items-center gap-1">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                                        {selectedImage.location}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Samples;