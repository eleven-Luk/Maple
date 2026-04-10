// pages/Maple/MSamples.jsx
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faBox, 
    faFire,
    faTimes,
    faCheckCircle,
    faSort,
    faSortUp,
    faSortDown,
    faAngleDoubleLeft,
    faChevronLeft,
    faChevronRight,
    faAngleDoubleRight,
    faCamera,
    faEdit,
    faTrash,
    faEye,
    faImage,
    faStar,
    faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';
import FilterBar from "../../components/common/FilterBar.jsx";

// Modals
import AddSampleModal from "../../components/modals/Maple/samples/AddSampleModal.jsx";
import ViewSampleModal from "../../components/modals/Maple/samples/ViewSampleModal.jsx";
import EditSampleModal from "../../components/modals/Maple/samples/EditSampleModal.jsx";
import DeleteSampleModal from "../../components/modals/Maple/samples/DeleteSampleModal.jsx";

function MSamples() {
    const [samples, setSamples] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSample, setSelectedSample] = useState(null);
    
    const [successMessage, setSuccessMessage] = useState('');

    // Sorting states
    const [sortConfig, setSortConfig] = useState({
        key: 'createdAt',
        direction: 'desc'
    });

    // Modal States
    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewSample, setShowNewSample] = useState(false);
    const [newSamples, setNewSamples] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [featuredFilter, setFeaturedFilter] = useState('all');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const navigate = useNavigate();

    // Category options
    const categoryOptions = [
        { value: 'newborn', label: 'Newborn' },
        { value: 'maternity', label: 'Maternity' },
        { value: 'family', label: 'Family' },
        { value: 'toddler', label: 'Toddler' },
        { value: 'milestone', label: 'Milestone' },
        { value: 'wedding', label: 'Wedding' },
    ];

    const featuredOptions = [
        { value: 'all', label: 'All' },
        { value: 'featured', label: 'Featured' },
        { value: 'not-featured', label: 'Not Featured' },
    ];

    const fetchSamples = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/samples/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const result = await response.json();

            if (result.success) {
                const sortedSamples = (result.data || []).sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                setSamples(sortedSamples);
                setSuccessMessage('Samples fetched successfully');
                setTimeout(() => setSuccessMessage(''), 3000);
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

    const handleAddSample = async (formDataToSend) => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                console.log('Please login first');
                return navigate('/login');
            }

            const response = await fetch('http://localhost:5000/api/samples/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formDataToSend
            });

            const result = await response.json();

            if (result.success) {
                // Add the new sample to the beginning of the list
                setSamples(prev => [result.data, ...prev]);
                setSuccessMessage('Sample added successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
                
                // Close modal and reset form (handled in modal)
                setShowAddModal(false);
                
                // Refresh the list to ensure latest data
                await fetchSamples();
                
                return result;
            } else {
                throw new Error(result.message || 'Failed to add sample');
            }

        } catch (error) {
            console.error('Error adding sample:', error);
            setError(error.message || 'Failed to add sample');
            throw error;
        }
    };


    const handleEditSuccess = async (formDataToSend) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const id = formDataToSend.get('id') || selectedSample?._id;
            
            const response = await fetch(`http://localhost:5000/api/samples/update/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formDataToSend
            });

            const result = await response.json();

            if (result.success) {
                setSamples(prev => prev.map(sample => 
                    sample._id === id ? result.data : sample
                ));
                setSuccessMessage('Sample updated successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
                setShowEditModal(false);
                setSelectedSample(null);
                return result;
            } else {
                throw new Error(result.message || 'Failed to update sample');
            }
        } catch (error) {
            console.error('Error updating sample:', error);
            setError(error.message || 'Failed to update sample');
            throw error;
        }
    };


    const handleDeleteSample = async (sampleId) => {
        try {
            setDeleteLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                setError('Please login first');
                navigate('/login');
                return;
            }

            const response = await fetch(`http://localhost:5000/api/samples/delete/${sampleId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (result.success) {
                setSamples(prev => prev.filter(sample => sample._id !== sampleId));
                
                if (showNewSample) {
                    setNewSamples(prev => prev.filter(sample => sample._id !== sampleId));
                }
                
                setSuccessMessage('Sample deleted successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
                setShowDeleteModal(false);
                setSelectedSample(null);
            } else {
                throw new Error(result.message || 'Failed to delete sample');
            }
        } catch (error) {
            console.error('Error deleting sample:', error);
            setError(error.message || 'Failed to delete sample');
            throw error;
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleEdit = (sample) => {
        setSelectedSample(sample);
        setShowEditModal(true);
    };

    const handleView = (sample) => {
        setSelectedSample(sample);
        setShowViewModal(true);
    };

    const handleDelete = (sample) => {
        setSelectedSample(sample);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (selectedSample) {
            await handleDeleteSample(selectedSample._id);
        }
    };

    // Filter handlers
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);

        if (showNewSample) {
            setShowNewSample(false);
            setNewSamples([]);
        }
    };

    const handleCategoryFilter = (e) => {
        setCategoryFilter(e.target.value);
        setCurrentPage(1);

        if (showNewSample) {
            setShowNewSample(false);
            setNewSamples([]);
        }
    };

    const handleFeaturedFilter = (e) => {
        setFeaturedFilter(e.target.value);
        setCurrentPage(1);

        if (showNewSample) {
            setShowNewSample(false);
            setNewSamples([]);
        }
    };

    const identifyNewSamples = () => {
        const recent = [...samples].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
        }).slice(0, 3);
        setNewSamples(recent);
        setShowNewSample(true);
        setSearchTerm('');
        setCategoryFilter('all');
        setFeaturedFilter('all');
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setCategoryFilter('all');
        setFeaturedFilter('all');
        setShowNewSample(false);
        setNewSamples([]);
        setCurrentPage(1);
    };

    const getDisplaySamples = () => {
        let displaySamples = [...samples];

        // Apply search filter
        if (searchTerm) {
            displaySamples = displaySamples.filter(sample => 
                sample.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sample.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sample.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sample.category?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply category filter
        if (categoryFilter !== 'all') {
            displaySamples = displaySamples.filter(sample => sample.category === categoryFilter);
        }

        // Apply featured filter
        if (featuredFilter !== 'all') {
            if (featuredFilter === 'featured') {
                displaySamples = displaySamples.filter(sample => sample.featured === true);
            } else if (featuredFilter === 'not-featured') {
                displaySamples = displaySamples.filter(sample => sample.featured !== true);
            }
        }

        // Apply new samples filter
        if (showNewSample) {
            displaySamples = newSamples;
        }

        // Apply sorting
        displaySamples.sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            if (sortConfig.key === 'createdAt') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }

            if (sortConfig.key === 'title') {
                aValue = a.title || '';
                bValue = b.title || '';
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return displaySamples;
    };

    const filteredSamples = getDisplaySamples();

    // Pagination
    const totalPages = Math.ceil(filteredSamples.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;    
    const currentItems = filteredSamples.slice(indexOfFirstItem, indexOfLastItem);

    // Navigation
    const goToPage = (page) => {
        setCurrentPage(Math.min(Math.max(1, page), totalPages));
    };

    const goToFirstPage = () => goToPage(1);
    const goToLastPage = () => goToPage(totalPages);
    const goToNextPage = () => goToPage(currentPage + 1);
    const goToPreviousPage = () => goToPage(currentPage - 1);

    // Generate Page numbers
    const getPageNumbers = () => {
        const maxButtons = 5;
        const pages = [];
        const half = Math.floor(maxButtons / 2);
        let start = Math.max(1, currentPage - half);
        let end = Math.min(totalPages, start + maxButtons - 1);
        
        if (end - start + 1 < maxButtons) {
            start = Math.max(1, end - maxButtons + 1);
        }
        
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    const pageNumbers = getPageNumbers();
    const showStartPage = pageNumbers[0] > 1;
    const showEndPage = pageNumbers[pageNumbers.length - 1] < totalPages;

    // Sample Card Component - FIXED
    const SampleCard = ({ sample, onView, onEdit, onDelete }) => {
        // Get the full image URL
        const getImageUrl = (imagePath) => {
            if (!imagePath) return 'https://via.placeholder.com/400x300?text=No+Image';
            // If it's already a full URL, return it
            if (imagePath.startsWith('http')) return imagePath;
            // Otherwise, prepend the base URL
            return `http://localhost:5000${imagePath}`;
        };

        const handleCardClick = (e) => {
            if (e.target.closest('.action-button')) {
                return;
            }
            onView(sample);
        };


        return (
            <div className="group bg-white border border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden"
                onClick={handleCardClick}
            >
                <div className="relative h-48 overflow-hidden">
                    <img 
                        src={getImageUrl(sample.image)} 
                        alt={sample.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                        }}
                    />
                    {sample.featured && (
                        <span className="absolute top-3 left-3 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-10">
                            <FontAwesomeIcon icon={faStar} className="text-xs" />
                            Featured
                        </span>
                    )}
                </div>
                <div className="p-4">
                    <h3 className="font-semibold text-gray-800 text-lg mb-1 line-clamp-1">{sample.title}</h3>
                    <p className="text-xs text-gray-500 mb-2">{sample.category} • {sample.subCategory}</p>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{sample.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-xs" />
                            {sample.location}
                        </span>
                        <span>{sample.date}</span>
                    </div>
                    <div className="flex flex-row gap-2">
                        <button 
                            onClick={() => onView(sample)}
                            className="flex-1 py-2 text-sm text-gray-500 hover:text-orange-600 border border-gray-200 rounded-lg hover:border-orange-400 transition-all flex items-center justify-center gap-2"
                        >
                            <FontAwesomeIcon icon={faEye} className="text-xs" />
                            View
                        </button>
                        <button 
                            onClick={() => onEdit(sample)}
                            className="flex-1 py-2 text-sm text-gray-500 hover:text-blue-600 border border-gray-200 rounded-lg hover:border-blue-400 transition-all flex items-center justify-center gap-2"
                        >
                            <FontAwesomeIcon icon={faEdit} className="text-xs" />
                            Edit
                        </button>
                        <button 
                            onClick={() => onDelete(sample)}
                            className="flex-1 py-2 text-sm text-gray-500 hover:text-red-600 border border-gray-200 rounded-lg hover:border-red-400 transition-all flex items-center justify-center gap-2"
                        >
                            <FontAwesomeIcon icon={faTrash} className="text-xs" />
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        );
    };


    if (loading) return <LoadingSpinner message='Loading samples...' />;

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
                <div className="bg-white border border-gray-200 p-8 text-center">
                    <p className="text-6xl text-gray-200 mb-4">—</p>
                    <p className="text-gray-500 font-light mb-4">Error: {error}</p>
                    <button 
                        onClick={fetchSamples}
                        className="px-6 py-2 border border-gray-300 text-gray-600 text-sm font-light tracking-wider hover:border-gray-900 hover:text-gray-900 hover:bg-stone-50 transition-all duration-300"
                    >
                        RETRY
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">   
            {/* Success Message */}
            {successMessage && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                    <span className="text-green-700">{successMessage}</span>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <span className="text-red-700">{error}</span>
                </div>
            )}

            {/* Header */}
            <header className="mb-8">
                <p className="text-sm font-light text-gray-500 mb-2 tracking-wider">PHOTOGRAPHY SAMPLES</p>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-800 font-light">MANAGE YOUR PORTFOLIO SAMPLES</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FontAwesomeIcon icon={faImage} />
                        <span>Total: {samples.length}</span>
                    </div>
                </div>
            </header>

            <div className="mb-6 flex justify-end">
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-600 text-sm font-light tracking-wider hover:border-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all duration-300"
                >
                    <FontAwesomeIcon icon={faPlus} className='text-xs'/>
                    <span>ADD SAMPLE</span>
                </button>
            </div>

            {/* Filter Bar */}
            <FilterBar 
                searchTerm={searchTerm}
                onSearchChange={handleSearch}
                searchPlaceholder="Search samples..."
                
                // Category filter dropdown
                filterOptions={categoryOptions}
                filterValue={categoryFilter}
                onFilterChange={handleCategoryFilter}
                filterPlaceholder="Filter by Category"

                // Featured filter dropdown
                filterStatusOptions={featuredOptions}
                filterStatusValue={featuredFilter}
                onFilterStatusChange={handleFeaturedFilter}
                filterStatusPlaceholder="Filter by Featured"
                
                // New Sample filter
                showSpecialFilter={true}
                specialFilterLabel="NEW SAMPLES"
                specialFilterIcon={faFire}
                onSpecialFilterClick={identifyNewSamples}
                isSpecialFilterActive={showNewSample}
                
                // Results count and refresh
                resultsCount={filteredSamples.length}
                resultsLabel="SAMPLES"
                onRefresh={fetchSamples}
                onClearFilters={clearFilters}
                theme="maple"
            />

            {/* Samples Grid */}
            <div>
                {currentItems.length === 0 ? (
                    <div className="bg-white border border-gray-200 p-16 text-center rounded-xl">
                        <FontAwesomeIcon icon={faBox} className="text-5xl text-gray-200 mb-4" />
                        <p className="text-gray-500 font-light mb-2">No samples found</p>
                        <p className="text-sm text-gray-400 font-light">
                            {searchTerm ? 'Try a different search term' : 'Add a new sample to get started'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentItems.map((sample) => (
                            <SampleCard
                                key={sample._id}
                                sample={sample}
                                onView={handleView}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredSamples.length)} of {filteredSamples.length} samples
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={goToFirstPage} disabled={currentPage === 1} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
                            <FontAwesomeIcon icon={faAngleDoubleLeft} className="text-xs" />
                        </button>
                        <button onClick={goToPreviousPage} disabled={currentPage === 1} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
                            <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                        </button>

                        <div className="flex items-center gap-1">
                            {showStartPage && <span className="px-2 py-1.5 text-gray-400">...</span>}
                            {pageNumbers.map(page => (
                                <button key={page} onClick={() => goToPage(page)} className={`px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors ${currentPage === page ? 'border-gray-500 bg-gray-500 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                                    {page}
                                </button>
                            ))}
                            {showEndPage && <span className="px-2 py-1.5 text-gray-400">...</span>}
                        </div>

                        <button onClick={goToNextPage} disabled={currentPage === totalPages} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
                            <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                        </button>
                        <button onClick={goToLastPage} disabled={currentPage === totalPages} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
                            <FontAwesomeIcon icon={faAngleDoubleRight} className="text-xs" />
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            <AddSampleModal 
                isOpen={showAddModal} 
                onClose={() => setShowAddModal(false)} 
                onSave={handleAddSample} 
            />

            <ViewSampleModal 
                isOpen={showViewModal} 
                onClose={() => {
                    setShowViewModal(false);
                    setSelectedSample(null);
                }} 
                sample={selectedSample} 
            />

            <EditSampleModal 
                isOpen={showEditModal} 
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedSample(null);
                }} 
                onSave={handleEditSuccess} 
                sample={selectedSample} 
            />
            
            <DeleteSampleModal 
                isOpen={showDeleteModal} 
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedSample(null);
                }} 
                onConfirm={handleConfirmDelete} 
                sample={selectedSample}
                loading={deleteLoading}
            />
        </div>
    );
}

export default MSamples;