import React, { useCallback, useEffect, useState } from "react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCheckCircle, 
    faCamera,
    faSort,
    faSortUp,
    faSortDown,
    faAngleDoubleLeft,
    faChevronLeft,
    faChevronRight,
    faAngleDoubleRight, 
    faFire,
    faTrashAlt,
    faEye,
    faCheckSquare,
    faSquare,
    faTrash,
    faBox
} from '@fortawesome/free-solid-svg-icons';
import ConcernTable from "../../components/tables/ConcernTable";
import FilterBar from "../../components/common/FilterBar";

import EditConcernModal from "../../components/modals/Maple/concerns/EditConcernModal"
import ViewConcernModal from "../../components/modals/Maple/concerns/ViewConcernModal"
import DeleteConfirmModal from "../../components/modals/Maple/concerns/DeleteConfirmModal"

function MapleConcerns() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [concerns, setConcerns] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');

    // Sorting states
    const [sortConfig, setSortConfig] = useState({
        key: 'createdAt',
        direction: 'desc'
    });

    // Modal States
    const [showViewModalOpen, setShowViewModalOpen] = useState(false);
    const [showEditModalOpen, setShowEditModalOpen] = useState(false);
    const [showDeleteModalOpen, setShowDeleteModalOpen] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    const [selectedConcern, setSelectedConcern] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Bulk delete states
    const [selectedConcerns, setSelectedConcerns] = useState([]);
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [inquiryFilter, setInquiryFilter] = useState('all');
    const [showNewConcern, setShowNewConcern] = useState(false);
    const [newConcerns, setNewConcerns] = useState([]);
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const navigate = useNavigate();

    const fetchConcerns = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No token found. Please log in.');
                navigate('/login');
                return;
            }

            // Fetch only Maple concerns (businessType = 'maple')
            const response = await fetch('http://localhost:5000/api/concerns/business/maple', {  // Use /business/maple
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch concerns');
            }

            const result = await response.json();
            
            if (result.success) {
                setConcerns(result.data);
                setSuccessMessage('Maple concerns fetched successfully');
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setError(result.message || 'Failed to fetch concerns');
            }
        } catch (error) {
            console.error('Error fetching Maple concerns:', error);
            setError(error.message || 'Failed to fetch concerns');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchConcerns();
    }, [fetchConcerns]);

    const handleUpdateConcern = async (concernId, status, notes, priority, sendEmail = true, adminMessage = '') => {
        try {
            setUpdatingId(concernId);
            const token = localStorage.getItem('token');

            if (!token) {
                setError('No token found. Please log in.');
                navigate('/login');
                return;
            }

            const response = await fetch(`http://localhost:5000/api/concerns/update/${concernId}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status,
                    notes,
                    priority,
                    sendEmail,
                    adminMessage
                })
            });

            const result = await response.json();

            if (result.success) {
                setConcerns(prev => prev.map(
                    concern => concern._id === concernId ? { ...concern, status, notes, priority } : concern
                ));

                if (sendEmail && status !== result.data?.status) {
                    setSuccessMessage('Concern updated and email notification sent!');
                } else {
                    setSuccessMessage('Concern updated successfully');
                }
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                throw new Error(result.message || 'Failed to update concern');
            }
            
        } catch (error) {
            console.error('Error updating concern:', error);
            setError(error.message || 'Failed to update concern');
            throw error; 
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDeleteConcern = async (concernId) => {
        try {
            setDeleteLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                setError('No token found. Please log in.');
                navigate('/login');
                return;
            }

            const response = await fetch(`http://localhost:5000/api/concerns/delete/${concernId}`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (result.success) {
                // Remove the deleted concern from the state
                setConcerns(prev => prev.filter(concern => concern._id !== concernId));
                
                // Clear any new concerns that might include this item
                if (showNewConcern) {
                    setNewConcerns(prev => prev.filter(concern => concern._id !== concernId));
                }

                setSuccessMessage('Concern deleted successfully');
                setTimeout(() => setSuccessMessage(''), 3000);
                
                // Close the delete modal
                setShowDeleteModalOpen(false);
                setSelectedConcern(null);
                
                // If current page becomes empty and not first page, go to previous page
                const remainingItems = filteredConcerns.length - 1;
                const newTotalPages = Math.ceil(remainingItems / itemsPerPage);
                if (currentPage > newTotalPages && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                }
            } else {
                throw new Error(result.message || 'Failed to delete concern');
            }
            
        } catch (error) {
            console.error('Error deleting concern:', error);
            setError(error.message || 'Failed to delete concern');
            throw error;
        } finally {
            setDeleteLoading(false);
        }
    };

    // Bulk delete functions
    const handleSelectConcern = (concernId) => {
        setSelectedConcerns(prev => 
            prev.includes(concernId) 
                ? prev.filter(id => id !== concernId)
                : [...prev, concernId]
        );
    };

    const handleSelectAll = () => {
        if (selectedConcerns.length === currentItems.length) {
            setSelectedConcerns([]);
        } else {
            setSelectedConcerns(currentItems.map(concern => concern._id));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedConcerns.length === 0) {
            setError('Please select at least one concern to delete');
            return;
        }

        setBulkDeleteLoading(true);
        let successCount = 0;
        let errorCount = 0;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No token found. Please log in.');
                navigate('/login');
                return;
            }

            // Delete each selected concern
            for (const concernId of selectedConcerns) {
                try {
                    const response = await fetch(`http://localhost:5000/api/concerns/delete/${concernId}`, {
                        method: 'DELETE',
                        headers: { 
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    const result = await response.json();

                    if (result.success) {
                        successCount++;
                    } else {
                        errorCount++;
                        console.error(`Failed to delete concern ${concernId}:`, result.message);
                    }
                } catch (error) {
                    errorCount++;
                    console.error(`Error deleting concern ${concernId}:`, error);
                }
            }

            // Update the concerns list
            setConcerns(prev => prev.filter(concern => !selectedConcerns.includes(concern._id)));
            
            if (showNewConcern) {
                setNewConcerns(prev => prev.filter(concern => !selectedConcerns.includes(concern._id)));
            }

            // Show success message
            if (successCount > 0) {
                setSuccessMessage(`Successfully deleted ${successCount} concern(s). ${errorCount > 0 ? `Failed to delete ${errorCount} concern(s).` : ''}`);
                setTimeout(() => setSuccessMessage(''), 5000);
            } else {
                setError(`Failed to delete ${errorCount} concern(s). Please try again.`);
            }

            // Clear selections and exit select mode
            setSelectedConcerns([]);
            setIsSelectMode(false);
            setShowBulkDeleteModal(false);

            // Adjust pagination if needed
            const remainingItems = filteredConcerns.length - successCount;
            const newTotalPages = Math.ceil(remainingItems / itemsPerPage);
            if (currentPage > newTotalPages && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }

        } catch (error) {
            console.error('Error during bulk delete:', error);
            setError('Failed to delete selected concerns. Please try again.');
        } finally {
            setBulkDeleteLoading(false);
        }
    };

    const handleBulkDeleteClick = () => {
        if (selectedConcerns.length === 0) {
            setError('Please select at least one concern to delete');
            return;
        }
        setShowBulkDeleteModal(true);
    };

    const handleExitSelectMode = () => {
        setIsSelectMode(false);
        setSelectedConcerns([]);
    };
        
    const handleEdit = (concern) => {
        setSelectedConcern(concern);
        setShowEditModalOpen(true);
    };

    const handleSaveEdit = async (data) => {
        if (selectedConcern && selectedConcern._id) {
            await handleUpdateConcern(
                selectedConcern._id, 
                data.status, 
                data.notes, 
                data.priority,
                data.sendEmail,
                data.adminMessage
            );
            setShowEditModalOpen(false);
        }
    };

    const handleView = (concern) => {
        setSelectedConcern(concern);
        setShowViewModalOpen(true);
    };

    const handleDelete = (concern) => {
        setSelectedConcern(concern);
        setShowDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (selectedConcern) {
            await handleDeleteConcern(selectedConcern._id);
        }
    };
    
    // Sorting handlers
    const handleSort = (key) => {
        const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return faSort;
        return sortConfig.direction === 'asc' ? faSortUp : faSortDown;
    };

    const StatusBadge = ({ status }) => {
        const statusMap = {
            pending: 'bg-yellow-100 text-yellow-800',
            reviewed: 'bg-blue-100 text-blue-800',
            resolved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusMap[status] || 'bg-gray-100 text-gray-800'}`}>
                {status?.toUpperCase() || 'PENDING'}
            </span>
        );
    };

    // Filter handlers
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
        handleExitSelectMode();

        if (showNewConcern) {
            setShowNewConcern(false);
            setNewConcerns([]);
        }
    };

    const handleStatusFilter = (e) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1);
        handleExitSelectMode();

        if (showNewConcern) {
            setShowNewConcern(false);
            setNewConcerns([]);
        }
    };

    const handleInquiryFilter = (e) => {
        setInquiryFilter(e.target.value);
        setCurrentPage(1);
        handleExitSelectMode();

        if (showNewConcern) {
            setShowNewConcern(false);
            setNewConcerns([]);
        }
    };

    const identifyNewConcerns = () => {
        const recent = [...concerns]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);
        setNewConcerns(recent);
        setShowNewConcern(true);
        setStatusFilter('all');
        setSearchTerm('');
        setCurrentPage(1);
        setInquiryFilter('all');
        handleExitSelectMode();
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setInquiryFilter('all');
        setShowNewConcern(false);
        setNewConcerns([]);
        setCurrentPage(1);
        handleExitSelectMode();
    };

    const statusOptions = [
        { value: 'pending', label: 'Pending' },
        { value: 'reviewed', label: 'Reviewed' },
        { value: 'resolved', label: 'Resolved' },
        { value: 'rejected', label: 'Rejected' },
    ];

    // Maple-specific inquiry options
    const inquiryOptions = [
        { value: 'general', label: 'General Inquiry' },
        { value: 'package-information', label: 'Package Information' },
        { value: 'others', label: 'Others' },
    ];

    // Display filtered concerns
    const getDisplayConcerns = () => {
        let displayConcerns = [...concerns];

        // Search filter
        if (searchTerm)  {
            displayConcerns = displayConcerns.filter(concern => 
                `${concern.name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                concern.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                concern.inquiryType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                concern.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                concern.status.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            displayConcerns = displayConcerns.filter(concern => concern.status === statusFilter);
        }

        // Inquiry filter
        if (inquiryFilter !== 'all') {
            displayConcerns = displayConcerns.filter(concern => concern.inquiryType === inquiryFilter);
        }

        if (showNewConcern) {
            displayConcerns = newConcerns;
        }

        // Apply sorting
        displayConcerns.sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            if (sortConfig.key === 'createdAt') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }
            if (sortConfig.key === 'name') {
                aValue = a.name || '';
                bValue = b.name || '';
            }
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return displayConcerns;
    };

    const filteredConcerns = getDisplayConcerns();

    // Pagination
    const totalPages = Math.ceil(filteredConcerns.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;    
    const currentItems = filteredConcerns.slice(indexOfFirstItem, indexOfLastItem);
       
    // Navigation
    const goToPage = (page) => {
        setCurrentPage(Math.min(Math.max(1, page), totalPages));
    };

    const goToFirstPage = () => goToPage(1);
    const goToLastPage = () => goToPage(totalPages);
    const goToNextPage = () => goToPage(currentPage + 1);
    const goToPreviousPage = () => goToPage(currentPage - 1);

    // Generate Page numbers to display
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

    if (loading) return <LoadingSpinner message="Loading Maple concerns..." />;
    
    return (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8"> 
            {/* Success Message */}
            {successMessage && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 animate-fadeIn">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                    <span className="text-green-700">{successMessage}</span>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg animate-fadeIn">
                    <span className="text-red-700">{error}</span>
                </div>
            )}

            {/* Header */}
            <header className="mb-8">
                <p className="text-sm font-light text-gray-500 mb-2 tracking-wider">MAPLE STREET PHOTOGRAPHY</p>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-700 font-light">MANAGE CUSTOMER INQUIRIES & PHOTOGRAPHY REQUESTS</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FontAwesomeIcon icon={faCamera} />
                        <span>Total: {concerns.length}</span>
                    </div>
                </div>
            </header>

            {/* Bulk Actions Bar */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {!isSelectMode ? (
                        <button
                            onClick={() => setIsSelectMode(true)}
                            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:border-gray-500 hover:text-gray-700 transition-colors flex items-center gap-2"
                        >
                            <FontAwesomeIcon icon={faCheckSquare} />
                            Select Multiple
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleSelectAll}
                                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:border-gray-500 hover:text-gray-700 transition-colors flex items-center gap-2"
                            >
                                <FontAwesomeIcon icon={selectedConcerns.length === currentItems.length ? faCheckSquare : faSquare} />
                                {selectedConcerns.length === currentItems.length ? 'Deselect All' : 'Select All'}
                            </button>
                            <button
                                onClick={handleBulkDeleteClick}
                                disabled={selectedConcerns.length === 0}
                                className={`px-4 py-2 text-sm border rounded-lg transition-colors flex items-center gap-2 ${
                                    selectedConcerns.length > 0
                                        ? 'border-red-300 text-red-600 hover:bg-red-50 hover:border-red-500'
                                        : 'border-gray-300 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <FontAwesomeIcon icon={faTrash} />
                                Delete Selected ({selectedConcerns.length})
                            </button>
                            <button
                                onClick={handleExitSelectMode}
                                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:border-gray-500 transition-colors"
                            >
                                Cancel
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Filter Bar */}
            <FilterBar
                theme="maple"
                searchTerm={searchTerm}
                onSearchChange={handleSearch}
                searchPlaceholder="Search maple concerns..."

                // Status dropdown
                filterOptions={statusOptions}
                filterValue={statusFilter}
                onFilterChange={handleStatusFilter}
                filterPlaceholder="ALL STATUS"

                // Filter inquiry
                filterInquiryOptions={inquiryOptions}
                filterInquiryValue={inquiryFilter}
                onFilterInquiryChange={handleInquiryFilter}
                filterInquiryPlaceholder="ALL INQUIRIES"

                // New concerns filter
                showSpecialFilter={true}
                specialFilterLabel="NEW CONCERNS"
                specialFilterIcon={faFire}
                onSpecialFilterClick={identifyNewConcerns}
                isSpecialFilterActive={showNewConcern}
                resultsCount={filteredConcerns.length}

                resultsLabel="CONCERNS"
                onRefresh={fetchConcerns}
                onClearFilters={clearFilters}
            />

            {/* Concerns Table */}
            <ConcernTable 
                concerns={currentItems}
                onSort={handleSort}  
                getSortIcon={getSortIcon}
                StatusBadge={StatusBadge}
                onView={handleView}  
                onEdit={handleEdit}  
                onDelete={handleDelete} 
                updatingId={updatingId}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                isSelectMode={isSelectMode}
                selectedConcerns={selectedConcerns}
                onSelectConcern={handleSelectConcern}
                onSelectAll={handleSelectAll}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredConcerns.length)} of {filteredConcerns.length} concerns
                    </div>

                    <div className="flex items-center gap-2">
                        {/* First Page */}
                        <button 
                            onClick={goToFirstPage}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FontAwesomeIcon icon={faAngleDoubleLeft} className="text-xs" />
                        </button>

                        {/* Previous Page */}
                        <button
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                        </button>

                        {/* Page Numbers */}
                        <div className="flex items-center gap-1">
                            {showStartPage && (
                                <span className="px-2 py-1.5 text-gray-400">...</span>
                            )}

                            {pageNumbers.map(page => (
                                <button
                                    key={page}
                                    onClick={() => goToPage(page)}
                                    className={`px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors ${
                                        currentPage === page
                                            ? 'border-gray-500 bg-gray-500 text-white'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}

                            {showEndPage && (
                                <span className="px-2 py-1.5 text-gray-400">...</span>
                            )}
                        </div>

                        {/* Next Page */}
                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FontAwesomeIcon icon={faChevronRight} className="text-xs" />   
                        </button>

                        {/* Last Page */}
                        <button
                            onClick={goToLastPage}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FontAwesomeIcon icon={faAngleDoubleRight} className="text-xs" />
                        </button>
                    </div>
                </div>
            )}

            {/* View Concern Modal */}
            <ViewConcernModal 
                isOpen={showViewModalOpen}
                onClose={() => setShowViewModalOpen(false)}
                concern={selectedConcern}
            /> 

            {/* Edit Concern Modal */}
            <EditConcernModal 
                isOpen={showEditModalOpen}
                onClose={() => setShowEditModalOpen(false)}
                concern={selectedConcern}
                onSave={handleSaveEdit}
            />

            {/* Delete Confirmation Modal (Single) */}
            <DeleteConfirmModal
                isOpen={showDeleteModalOpen}
                onClose={() => {
                    setShowDeleteModalOpen(false);
                    setSelectedConcern(null);
                }}
                onConfirm={handleConfirmDelete}
                item={selectedConcern}
                title="Delete Concern"
                subtitle="Are you sure you want to delete this concern permanently?"
                loading={deleteLoading}
            />

            {/* Bulk Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={showBulkDeleteModal}
                onClose={() => setShowBulkDeleteModal(false)}
                onConfirm={handleBulkDelete}
                item={null}
                title="Bulk Delete Concerns"
                subtitle={`Are you sure you want to delete ${selectedConcerns.length} concern(s) permanently? This action cannot be undone.`}
                loading={bulkDeleteLoading}
            />
        </div>
    )
}

export default MapleConcerns;