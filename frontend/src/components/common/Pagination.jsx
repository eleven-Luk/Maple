// components/common/Pagination.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faChevronLeft, 
    faChevronRight, 
    faAngleDoubleLeft, 
    faAngleDoubleRight,
    faEllipsisH
} from '@fortawesome/free-solid-svg-icons';

const Pagination = ({ 
    items = [],           // Array of items to paginate
    itemsPerPage = 10,    // Items per page
    onPageChange,         // Optional callback when page changes
    renderItem,           // Function to render each item
    showFirstLast = true,
    maxButtons = 5,
    showItemsInfo = true,
    variant = "default",  // "default", "compact", "minimal"
    className = "",
    emptyMessage = "No items found"
}) => {
    // State
    const [currentPage, setCurrentPage] = useState(1);
    
    // Calculate pagination values
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
    
    // Reset to first page when items change
    useEffect(() => {
        setCurrentPage(1);
    }, [items.length]);
    
    // Navigate functions
    const goToPage = (page) => {
        const newPage = Math.min(Math.max(1, page), totalPages);
        setCurrentPage(newPage);
        if (onPageChange) onPageChange(newPage);
    };
    
    const nextPage = () => goToPage(currentPage + 1);
    const prevPage = () => goToPage(currentPage - 1);
    const firstPage = () => goToPage(1);
    const lastPage = () => goToPage(totalPages);
    
    // Generate page numbers to display
    const getPageNumbers = () => {
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
    
    // If no items, show empty state
    if (items.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                {emptyMessage}
            </div>
        );
    }
    
    // If only one page, just render items without pagination controls
    if (totalPages <= 1) {
        return (
            <div>
                {renderItem && currentItems.map(renderItem)}
            </div>
        );
    }
    
    const pageNumbers = getPageNumbers();
    const showEllipsisStart = pageNumbers[0] > 1;
    const showEllipsisEnd = pageNumbers[pageNumbers.length - 1] < totalPages;
    
    // Variant styles
    const variants = {
        default: {
            container: "flex items-center justify-between mt-6",
            button: "px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
            activeButton: "px-3 py-1.5 border border-orange-500 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors",
            pageButton: "px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors",
            infoText: "text-sm text-gray-600",
            ellipsis: "px-2 py-1.5 text-gray-400"
        },
        compact: {
            container: "flex items-center justify-end mt-4",
            button: "px-2 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
            activeButton: "px-2 py-1 border border-orange-500 bg-orange-500 text-white rounded-md text-xs font-medium hover:bg-orange-600 transition-colors",
            pageButton: "px-2 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors",
            infoText: "text-xs text-gray-500 mr-4",
            ellipsis: "px-1 py-1 text-gray-400 text-xs"
        },
        minimal: {
            container: "flex items-center justify-center mt-6 gap-2",
            button: "px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
            activeButton: "px-3 py-1.5 border border-orange-500 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors",
            pageButton: "px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors",
            infoText: "hidden",
            ellipsis: "px-2 py-1.5 text-gray-400"
        }
    };
    
    const styles = variants[variant];
    
    return (
        <div>
            {/* Render Items */}
            {renderItem && (
                <div className="space-y-4">
                    {currentItems.map(renderItem)}
                </div>
            )}
            
            {/* Pagination Controls */}
            <div className={`${styles.container} ${className}`}>
                {/* Items Info */}
                {showItemsInfo && (
                    <div className={styles.infoText}>
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, items.length)} of {items.length} items
                    </div>
                )}
                
                {/* Pagination Buttons */}
                <div className="flex items-center gap-1 md:gap-2">
                    {/* First Page */}
                    {showFirstLast && (
                        <button
                            onClick={firstPage}
                            disabled={currentPage === 1}
                            className={styles.button}
                            title="First Page"
                        >
                            <FontAwesomeIcon icon={faAngleDoubleLeft} className="text-xs" />
                        </button>
                    )}
                    
                    {/* Previous */}
                    <button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className={styles.button}
                        title="Previous Page"
                    >
                        <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                        {showEllipsisStart && (
                            <span className={styles.ellipsis}>
                                <FontAwesomeIcon icon={faEllipsisH} className="text-xs" />
                            </span>
                        )}
                        
                        {pageNumbers.map(page => (
                            <button
                                key={page}
                                onClick={() => goToPage(page)}
                                className={currentPage === page ? styles.activeButton : styles.pageButton}
                            >
                                {page}
                            </button>
                        ))}
                        
                        {showEllipsisEnd && (
                            <span className={styles.ellipsis}>
                                <FontAwesomeIcon icon={faEllipsisH} className="text-xs" />
                            </span>
                        )}
                    </div>
                    
                    {/* Next */}
                    <button
                        onClick={nextPage}
                        disabled={currentPage === totalPages}
                        className={styles.button}
                        title="Next Page"
                    >
                        <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                    </button>
                    
                    {/* Last Page */}
                    {showFirstLast && (
                        <button
                            onClick={lastPage}
                            disabled={currentPage === totalPages}
                            className={styles.button}
                            title="Last Page"
                        >
                            <FontAwesomeIcon icon={faAngleDoubleRight} className="text-xs" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Pagination;