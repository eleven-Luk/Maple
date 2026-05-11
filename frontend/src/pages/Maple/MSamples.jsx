// pages/Maple/MSamples.jsx
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faBox, 
    faCheckCircle,
    faAngleDoubleLeft,
    faChevronLeft,
    faChevronRight,
    faAngleDoubleRight,
    faEdit,
    faTrash,
    faEye,
    faImage,
    faStar,
    faMapMarkerAlt,
    faImages,
    faVenus,
    faMars
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

    // Modal States
    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [setupTypeFilter, setSetupTypeFilter] = useState('all');
    const [genderFilter, setGenderFilter] = useState('all');
    

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const navigate = useNavigate();

    // Setup type options
    const setupTypeOptions = [

        { value: 'basket', label: 'Basket' },
        { value: 'fur', label: 'Fur' },
        { value: 'bean&bed', label: 'Bean & Bed' },
    ];

    const genderOptions = [
        { value: 'boy', label: 'Boy' },
        { value: 'girl', label: 'Girl' },
    ];



    const fetchSamples = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            
            const params = new URLSearchParams();
            if (setupTypeFilter !== 'all') params.append('setupType', setupTypeFilter);
            if (genderFilter !== 'all') params.append('gender', genderFilter);
    
            
            const queryString = params.toString();
            const url = `http://localhost:5000/api/samples/all${queryString ? `?${queryString}` : ''}`;
            
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const result = await response.json();

            if (result.success) {
                setSamples(result.data || []);
            } else {
                throw new Error(result.message || 'Failed to fetch samples');
            }
        } catch (error) {
            console.error('Error fetching samples:', error);
            setError(error.message || 'Failed to fetch samples');
        } finally {
            setLoading(false);
        }
    }, [setupTypeFilter, genderFilter]);

    useEffect(() => {
        fetchSamples();
    }, [fetchSamples]);

    const handleAddSample = async (formDataToSend) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
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
                setSamples(prev => [result.data, ...prev]);
                setSuccessMessage('Sample added successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
                setShowAddModal(false);
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
                navigate('/login');
                return;
            }

            const response = await fetch(`http://localhost:5000/api/samples/delete/${sampleId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            const result = await response.json();

            if (result.success) {
                setSamples(prev => prev.filter(sample => sample._id !== sampleId));
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

    const getDisplaySamples = () => {
        let displaySamples = [...samples];

        if (searchTerm) {
            displaySamples = displaySamples.filter(sample => 
                sample.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sample.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sample.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sample.setupType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sample.gender?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return displaySamples;
    };

    const filteredSamples = getDisplaySamples();

    // Pagination
    const totalPages = Math.ceil(filteredSamples.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;    
    const currentItems = filteredSamples.slice(indexOfFirstItem, indexOfLastItem);

    const goToPage = (page) => setCurrentPage(Math.min(Math.max(1, page), totalPages));
    const goToFirstPage = () => goToPage(1);
    const goToLastPage = () => goToPage(totalPages);
    const goToNextPage = () => goToPage(currentPage + 1);
    const goToPreviousPage = () => goToPage(currentPage - 1);

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

    // Format setup type for display
    const formatSetupType = (setupType) => {
        if (!setupType) return '';
        return setupType
            .replace(/&/g, ' & ')
            .split(/[\s-]+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Sample Card Component
    const SampleCard = ({ sample, onView, onEdit, onDelete }) => {
        const getImageUrl = (imagePath) => {
            if (!imagePath) return 'https://via.placeholder.com/400x300?text=No+Image';
            if (imagePath.startsWith('http')) return imagePath;
            return `http://localhost:5000${imagePath}`;
        };

        const primaryImage = sample.images?.find(img => img.isPrimary) || sample.images?.[0];
        const imageUrl = primaryImage?.url || sample.image;

        const setupColors = {
            basket: 'from-amber-400 to-orange-500',
            fur: 'from-purple-300 to-purple-500',
            bean: 'from-green-400 to-emerald-500'
        };

        return (
            <div className="group bg-white border border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                    <img 
                        src={getImageUrl(imageUrl)} 
                        alt={sample.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                        }}
                    />
                    
                    {sample.images && sample.images.length > 1 && (
                        <span className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-10">
                            <FontAwesomeIcon icon={faImages} className="text-xs" />
                            {sample.images.length}
                        </span>
                    )}
                    
                    {sample.featured && (
                        <span className="absolute top-3 left-3 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-10">
                            <FontAwesomeIcon icon={faStar} className="text-xs" />
                            Featured
                        </span>
                    )}
                    
                    <span className={`absolute bottom-3 left-3 bg-gradient-to-r ${setupColors[sample.setupType] || 'from-gray-500 to-gray-700'} text-white text-xs px-2 py-1 rounded-full`}>
                        {formatSetupType(sample.setupType)}
                    </span>
                    
                    <span className="absolute bottom-3 right-3 bg-white/90 text-gray-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <FontAwesomeIcon icon={sample.gender === 'boy' ? faMars : faVenus} className={sample.gender === 'boy' ? 'text-blue-500' : 'text-pink-500'} />
                        {sample.gender?.charAt(0).toUpperCase() + sample.gender?.slice(1)}
                    </span>
                </div>
                <div className="p-4">
                    <h3 className="font-semibold text-gray-800 text-lg mb-1 line-clamp-1">{sample.title}</h3>
                    <p className="text-xs text-gray-500 mb-2">
                        {formatSetupType(sample.setupType)} • {sample.gender?.charAt(0).toUpperCase() + sample.gender?.slice(1)}
                    </p>
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
                            onClick={(e) => { e.stopPropagation(); onView(sample); }}
                            className="flex-1 py-2 text-sm text-gray-500 hover:text-orange-600 border border-gray-200 rounded-lg hover:border-orange-400 transition-all flex items-center justify-center gap-2"
                        >
                            <FontAwesomeIcon icon={faEye} className="text-xs" />
                            View
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onEdit(sample); }}
                            className="flex-1 py-2 text-sm text-gray-500 hover:text-blue-600 border border-gray-200 rounded-lg hover:border-blue-400 transition-all flex items-center justify-center gap-2"
                        >
                            <FontAwesomeIcon icon={faEdit} className="text-xs" />
                            Edit
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(sample); }}
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

    const handleView = (sample) => {
        setSelectedSample(sample);
        setShowViewModal(true);
    };

    const handleEdit = (sample) => {
        setSelectedSample(sample);
        setShowEditModal(true);
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

    const clearFilters = () => {
        setSearchTerm('');
        setSetupTypeFilter('all');
        setGenderFilter('all');
        setFeaturedFilter('all');
        setCurrentPage(1);
    };

    if (loading) return <LoadingSpinner message='Loading samples...' />;

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
                <div className="bg-white border border-gray-200 p-8 text-center rounded-xl">
                    <FontAwesomeIcon icon={faImage} className="text-6xl text-gray-200 mb-4" />
                    <p className="text-gray-500 font-light mb-4">Error: {error}</p>
                    <button 
                        onClick={fetchSamples}
                        className="px-6 py-2 border border-gray-300 text-gray-600 text-sm font-light tracking-wider hover:border-gray-900 hover:text-gray-900 hover:bg-stone-50 transition-all duration-300 rounded-lg"
                    >
                        RETRY
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">   
            {successMessage && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                    <span className="text-green-700">{successMessage}</span>
                </div>
            )}

            <header className="mb-8">
                <p className="text-sm font-light text-gray-500 mb-2 tracking-wider">PHOTOGRAPHY SAMPLES</p>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-800 font-light">MANAGE YOUR PORTFOLIO SAMPLES</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faImages} />
                            <span>Total: {samples.length}</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="mb-6 flex justify-end">
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                >
                    <FontAwesomeIcon icon={faPlus} className='text-xs'/>
                    <span>ADD SAMPLE</span>
                </button>
            </div>

            {/* FilterBar using available props */}
            <FilterBar 
                searchTerm={searchTerm}
                onSearchChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                }}
                searchPlaceholder="Search samples..."
                
                // Setup Type filter
                filterOptions={setupTypeOptions}
                filterValue={setupTypeFilter}
                onFilterChange={(e) => {
                    setSetupTypeFilter(e.target.value);
                    setCurrentPage(1);
                }}
                filterPlaceholder="All Setups"
                
                // Gender filter using filterTypeOptions
                filterTypeOptions={genderOptions}
                filterTypeValue={genderFilter}
                onFilterTypeChange={(e) => {
                    setGenderFilter(e.target.value);
                    setCurrentPage(1);
                }}
                filterTypePlaceholder="All Genders"                

                
                resultsCount={filteredSamples.length}
                resultsLabel="SAMPLES"
                onRefresh={fetchSamples}
                onClearFilters={clearFilters}
                theme="maple"
            />

            <div>
                {currentItems.length === 0 ? (
                    <div className="bg-white border border-gray-200 p-16 text-center rounded-xl">
                        <FontAwesomeIcon icon={faBox} className="text-5xl text-gray-200 mb-4" />
                        <p className="text-gray-500 font-light mb-2">No samples found</p>
                        <p className="text-sm text-gray-400 font-light">
                            {searchTerm || setupTypeFilter !== 'all' || genderFilter !== 'all' || featuredFilter !== 'all' ? 'Try adjusting your filters' : 'Add a new sample to get started'}
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

            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredSamples.length)} of {filteredSamples.length} samples
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={goToFirstPage} disabled={currentPage === 1} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <FontAwesomeIcon icon={faAngleDoubleLeft} className="text-xs" />
                        </button>
                        <button onClick={goToPreviousPage} disabled={currentPage === 1} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                        </button>

                        <div className="flex items-center gap-1">
                            {getPageNumbers().map(page => (
                                <button key={page} onClick={() => goToPage(page)} className={`px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors ${currentPage === page ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button onClick={goToNextPage} disabled={currentPage === totalPages} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                        </button>
                        <button onClick={goToLastPage} disabled={currentPage === totalPages} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <FontAwesomeIcon icon={faAngleDoubleRight} className="text-xs" />
                        </button>
                    </div>
                </div>
            )}

            <AddSampleModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSave={handleAddSample} />
            <ViewSampleModal isOpen={showViewModal} onClose={() => { setShowViewModal(false); setSelectedSample(null); }} sample={selectedSample} />
            <EditSampleModal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedSample(null); }} onSave={handleEditSuccess} sample={selectedSample} />
            <DeleteSampleModal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setSelectedSample(null); }} onConfirm={handleConfirmDelete} sample={selectedSample} loading={deleteLoading} />
        </div>
    );
}

export default MSamples;