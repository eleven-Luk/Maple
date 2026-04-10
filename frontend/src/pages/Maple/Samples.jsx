import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCamera,
    faHeart,
    faShare,
    faSearch,
    faFilter,
    faTimes,
    faChevronLeft,
    faChevronRight,
    faInfoCircle,
    faCalendarAlt,
    faMapMarkerAlt,
    faTag,
    faArrowLeft,
    faSpinner,
    faStar
} from '@fortawesome/free-solid-svg-icons';

import bgImg from '../../assets/NielLogo.jpg'
import LoadingSpinner from '../../components/common/LoadingSpinner';

function Samples() {
    const [samples, setSamples] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedImage, setSelectedImage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);

    // Responsive items per page
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) {
                setItemsPerPage(4); // Mobile
            } else if (window.innerWidth < 1024) {
                setItemsPerPage(8); // Tablet
            } else {
                setItemsPerPage(12); // Desktop
            }
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch samples from API
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

    // Get unique categories from samples
    const getCategories = () => {
        const categoryMap = new Map();
        
        samples.forEach(sample => {
            const category = sample.category;
            if (categoryMap.has(category)) {
                categoryMap.set(category, categoryMap.get(category) + 1);
            } else {
                categoryMap.set(category, 1);
            }
        });
        
        const categories = Array.from(categoryMap.entries()).map(([id, count]) => ({
            id,
            name: id.charAt(0).toUpperCase() + id.slice(1),
            count
        }));
        
        return [{ id: 'all', name: 'All Samples', count: samples.length }, ...categories];
    };

    const categories = getCategories();

    // Get image URL helper
    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://via.placeholder.com/400x300?text=No+Image';
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:5000${imagePath}`;
    };

    // Filter samples
    const filteredSamples = samples.filter(sample => {
        const matchesCategory = selectedCategory === 'all' || sample.category === selectedCategory;
        const matchesSearch = sample.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             sample.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             sample.location?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Pagination
    const totalPages = Math.ceil(filteredSamples.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredSamples.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, searchTerm]);

    const featuredSamples = samples.filter(s => s.featured === true).slice(0, 3);

    const goToHomepage = () => {
        window.location.href = '/main';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
                <LoadingSpinner message="Loading portfolio..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FontAwesomeIcon icon={faCamera} className="text-red-400 text-xl sm:text-2xl" />
                    </div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-2">Unable to load samples</h3>
                    <p className="text-gray-500 mb-4 text-sm sm:text-base">{error}</p>
                    <button 
                        onClick={fetchSamples}
                        className="px-4 sm:px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white'>
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

            {/* Header Section - Responsive */}
            <div className='bg-gradient-to-b from-gray-50 to-gray-100 border-b border-gray-200 pt-16 sm:pt-20'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12'>
                    <div className='flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4'>
                        <div className='flex items-center gap-3'>
                            <img 
                                src={bgImg} 
                                alt="Maple Photography Logo"   
                                className='w-14 h-14 sm:w-20 sm:h-20 rounded-xl shadow-md border-2 border-orange-300 object-cover'
                            />
                            <div className='w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex items-center justify-center'>
                                <FontAwesomeIcon icon={faCamera} className='text-gray-600 text-lg sm:text-xl' />
                            </div>
                        </div>
                        <h1 className='text-2xl sm:text-3xl font-light text-gray-800'>Our Portfolio</h1>
                    </div>
                    <div className='w-16 sm:w-20 h-0.5 bg-gray-400 mb-4 sm:mb-6'></div>
                    
                    <div className='bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100'>
                        <p className='text-gray-500 text-xs uppercase tracking-widest mb-2 sm:mb-3 font-light flex items-center gap-2'>
                            <span className='w-1 h-4 bg-gray-400'></span>
                            MINIMALIST | TIMELESS | PREMIUM SERVICE
                        </p>
                        <p className='text-gray-600 leading-relaxed text-sm sm:text-base'>
                            We offer professional photography services: newborn, maternity, and family milestones, 
                            to capture life's most precious moments with warmth and artistry. Browse through our 
                            collection of cherished memories below.
                        </p>
                    </div>
                </div>
            </div>

            {/* Featured Section - Responsive */}
            {featuredSamples.length > 0 && (
                <div className='max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12'>
                    <h2 className='text-xl sm:text-2xl font-light text-gray-800 mb-4 sm:mb-6'>Featured Work</h2>
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
                        {featuredSamples.map(sample => (
                            <div 
                                key={sample._id}
                                className='relative group cursor-pointer overflow-hidden rounded-xl shadow-lg bg-white'
                                onClick={() => setSelectedImage(sample)}
                            >
                                <div className='relative h-56 sm:h-64 md:h-72 overflow-hidden'>
                                    <img 
                                        src={getImageUrl(sample.image)} 
                                        alt={sample.title}
                                        className='w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700'
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                                        }}
                                    />
                                    <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                                        <div className='absolute bottom-0 left-0 right-0 p-3 sm:p-4'>
                                            <h3 className='text-white font-medium text-base sm:text-lg'>{sample.title}</h3>
                                            <p className='text-gray-300 text-xs sm:text-sm'>{sample.subCategory}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className='absolute top-2 right-2 sm:top-3 sm:right-3'>
                                    <span className='bg-orange-500 text-white text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg flex items-center gap-1'>
                                        <FontAwesomeIcon icon={faStar} className="text-xs" />
                                        Featured
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Gallery Section - Responsive */}
            <div className='max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12'>
                {/* Search Bar */}
                <div className='mb-6 sm:mb-8'>
                    <div className='relative'>
                        <FontAwesomeIcon 
                            icon={faSearch} 
                            className='absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs sm:text-sm'
                        />
                        <input
                            type='text'
                            placeholder='Search samples...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm'
                        />
                    </div>
                </div>

                {/* Category Filters - Responsive */}
                {categories.length > 1 && (
                    <div className='flex flex-wrap gap-1.5 sm:gap-2 mb-6 sm:mb-8'>
                        {categories.map(category => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm transition-all ${
                                    selectedCategory === category.id
                                        ? 'bg-gray-700 text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                {category.name} ({category.count})
                            </button>
                        ))}
                    </div>
                )}

                {/* Samples Grid - Responsive */}
                {currentItems.length === 0 ? (
                    <div className='text-center py-12 sm:py-16'>
                        <div className='w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                            <FontAwesomeIcon icon={faCamera} className='text-gray-400 text-xl sm:text-2xl' />
                        </div>
                        <h3 className='text-base sm:text-lg font-medium text-gray-700 mb-2'>No samples found</h3>
                        <p className='text-gray-500 text-sm sm:text-base'>Try adjusting your search or filter criteria</p>
                    </div>
                ) : (
                    <>
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'>
                            {currentItems.map(sample => (
                                <div 
                                    key={sample._id}
                                    className='group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer border border-gray-100'
                                    onClick={() => setSelectedImage(sample)}
                                >
                                    <div className='relative h-48 sm:h-56 md:h-64 overflow-hidden'>
                                        <img 
                                            src={getImageUrl(sample.image)} 
                                            alt={sample.title}
                                            className='w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700'
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                                            }}
                                        />
                                        {sample.featured && (
                                            <span className='absolute top-2 left-2 sm:top-3 sm:left-3 bg-orange-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-1'>
                                                <FontAwesomeIcon icon={faStar} className="text-xs" />
                                                Featured
                                            </span>
                                        )}
                                    </div>
                                    <div className='p-3 sm:p-4'>
                                        <h3 className='font-medium text-gray-800 mb-1 text-sm sm:text-base'>{sample.title}</h3>
                                        <p className='text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3 line-clamp-2'>{sample.description}</p>
                                        <div className='flex items-center justify-between text-xs'>
                                            <div className='flex items-center gap-1 text-gray-400'>
                                                <FontAwesomeIcon icon={faMapMarkerAlt} className='text-xs' />
                                                <span className="truncate max-w-[100px]">{sample.location}</span>
                                            </div>
                                            <div className='flex items-center gap-1 text-gray-400'>
                                                <FontAwesomeIcon icon={faCalendarAlt} className='text-xs' />
                                                <span>{sample.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls - Responsive */}
                        {totalPages > 1 && (
                            <>
                                <div className='flex items-center justify-center gap-1 sm:gap-2 mt-8 sm:mt-12'>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className='px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                                    >
                                        <FontAwesomeIcon icon={faChevronLeft} />
                                    </button>
                                    
                                    <div className='flex items-center gap-0.5 sm:gap-1'>
                                        {Array.from({ length: Math.min(window.innerWidth < 640 ? 3 : 5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            const maxButtons = window.innerWidth < 640 ? 3 : 5;
                                            if (totalPages <= maxButtons) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - maxButtons + i + 1;
                                            } else {
                                                pageNum = currentPage - Math.floor(maxButtons / 2) + i;
                                            }
                                            
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`px-2 sm:px-3 py-1 sm:py-2 border rounded-lg text-xs sm:text-sm transition-colors ${
                                                        currentPage === pageNum
                                                            ? 'bg-gray-700 text-white border-gray-700'
                                                            : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className='px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                                    >
                                        <FontAwesomeIcon icon={faChevronRight} />
                                    </button>
                                </div>
                                
                                <div className='text-center mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500'>
                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredSamples.length)} of {filteredSamples.length} samples
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Lightbox Modal - Responsive */}
            {selectedImage && (
                <div 
                    className='fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-2 sm:p-4'
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        onClick={() => setSelectedImage(null)}
                        className='absolute top-2 sm:top-4 right-2 sm:right-4 text-white hover:text-gray-300 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-black/50 rounded-full flex items-center justify-center'
                    >
                        <FontAwesomeIcon icon={faTimes} className='text-base sm:text-xl' />
                    </button>
                    
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const currentIndex = filteredSamples.findIndex(s => s._id === selectedImage._id);
                            if (currentIndex > 0) {
                                setSelectedImage(filteredSamples[currentIndex - 1]);
                            }
                        }}
                        className='absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 disabled:opacity-50 w-8 h-8 sm:w-10 sm:h-10 bg-black/50 rounded-full flex items-center justify-center'
                        disabled={filteredSamples.findIndex(s => s._id === selectedImage._id) === 0}
                    >
                        <FontAwesomeIcon icon={faChevronLeft} className="text-sm sm:text-base" />
                    </button>
                    
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const currentIndex = filteredSamples.findIndex(s => s._id === selectedImage._id);
                            if (currentIndex < filteredSamples.length - 1) {
                                setSelectedImage(filteredSamples[currentIndex + 1]);
                            }
                        }}
                        className='absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 disabled:opacity-50 w-8 h-8 sm:w-10 sm:h-10 bg-black/50 rounded-full flex items-center justify-center'
                        disabled={filteredSamples.findIndex(s => s._id === selectedImage._id) === filteredSamples.length - 1}
                    >
                        <FontAwesomeIcon icon={faChevronRight} className="text-sm sm:text-base" />
                    </button>

                    <div 
                        className='relative max-w-5xl w-full'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img 
                            src={getImageUrl(selectedImage.image)} 
                            alt={selectedImage.title}
                            className='w-full h-auto rounded-lg shadow-2xl'
                        />
                        
                        <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 sm:p-6 rounded-b-lg'>
                            <div className='flex flex-col sm:flex-row sm:items-center justify-between text-white gap-2 sm:gap-0'>
                                <div>
                                    <h3 className='text-base sm:text-xl md:text-2xl font-medium mb-1'>{selectedImage.title}</h3>
                                    <p className='text-xs sm:text-sm text-gray-300 mb-1 sm:mb-2'>{selectedImage.description}</p>
                                    <div className='flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-400'>
                                        <span className='flex items-center gap-1'>
                                            <FontAwesomeIcon icon={faCalendarAlt} className='text-xs' />
                                            {selectedImage.date}
                                        </span>
                                        <span className='flex items-center gap-1'>
                                            <FontAwesomeIcon icon={faMapMarkerAlt} className='text-xs' />
                                            {selectedImage.location}
                                        </span>
                                        <span className='flex items-center gap-1'>
                                            <FontAwesomeIcon icon={faTag} className='text-xs' />
                                            {selectedImage.subCategory}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Samples;