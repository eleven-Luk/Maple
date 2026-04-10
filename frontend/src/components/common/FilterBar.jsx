// components/common/FilterBar.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFire, faTimes } from '@fortawesome/free-solid-svg-icons';

const FilterBar = ({
    searchTerm,
    onSearchChange,
    searchPlaceholder = "Search...",
    
    // Filter dropdown
    filterOptions = [],
    filterValue = '',
    onFilterChange,
    filterPlaceholder = "All",

    // Filter Type for Maple (used for package types)
    filterTypeOptions = [],
    filterTypeValue = '',
    onFilterTypeChange,
    filterTypePlaceholder = "All",

    // Filter inquiry
    filterInquiryOptions = [],
    filterInquiryValue = '',
    onFilterInquiryChange,
    filterInquiryPlaceholder = "All",

    // Status inquiry
    filterStatusOptions = [],
    filterStatusValue = '',
    onFilterStatusChange,
    filterStatusPlaceholder = "All",

    // Filter Setup
    filterSetupOptions = [],
    filterSetupValue = '',
    onFilterSetupChange,
    filterSetupPlaceholder = "All",
    
    // Special filters
    showSpecialFilter = false,
    specialFilterLabel = "",
    specialFilterIcon = faFire,
    onSpecialFilterClick,
    isSpecialFilterActive = false,
    
    // Results count
    resultsCount = 0,
    resultsLabel = "ITEMS",
    
    // Refresh
    onRefresh,
    
    // Active filters display
    activeFilters = [],
    onClearFilters,
    
    // Additional buttons
    extraButtons = null,
    
    // Theme support
    theme = 'nm' // 'nm' or 'maple'
}) => {
    const isFiltered = searchTerm || filterValue !== 'all' || isSpecialFilterActive || activeFilters.length > 0;
    
    // Theme configurations
    const themes = {
        nm: {
            border: 'border-orange-200',
            focusBorder: 'focus:border-orange-400',
            textPrimary: 'text-orange-800',
            textSecondary: 'text-orange-400',
            textHover: 'hover:text-orange-600',
            buttonBg: 'bg-orange-500',
            buttonHover: 'hover:bg-orange-600',
            buttonBorder: 'border-orange-500',
            activeText: 'text-white',
            iconColor: 'text-orange-500',
            refreshText: 'text-orange-400 hover:text-orange-600',
            resultText: 'text-orange-400',
            filterTag: 'text-orange-600 border-orange-200',
        },
        maple: {
            border: 'border-gray-200',
            focusBorder: 'focus:border-gray-400',
            textPrimary: 'text-gray-700',
            textSecondary: 'text-gray-500',
            textHover: 'hover:text-gray-700',
            buttonBg: 'bg-gray-600',
            buttonHover: 'hover:bg-gray-700',
            buttonBorder: 'border-gray-500',
            activeText: 'text-white',
            iconColor: 'text-gray-500',
            refreshText: 'text-gray-500 hover:text-gray-700',
            resultText: 'text-gray-500',
            filterTag: 'text-gray-600 border-gray-200',
        }
    };
    
    const currentTheme = themes[theme] || themes.nm;

    return (
        <div className="space-y-4 p-4">
            {/* Search and Refresh Row */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Search Input */}
                    <div className="relative">
                        <input 
                            type="text"
                            value={searchTerm}
                            onChange={onSearchChange}
                            placeholder={searchPlaceholder}
                            className={`pl-10 pr-4 py-2 border ${currentTheme.border} ${currentTheme.textPrimary} font-light ${currentTheme.focusBorder} focus:outline-none transition-colors w-64`}
                        />
                        <FontAwesomeIcon 
                            icon={faSearch} 
                            className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm`} 
                        />
                    </div>

                    {/* Filter Dropdown (General) */}
                    {filterOptions.length > 0 && (
                        <select 
                            value={filterValue}
                            onChange={onFilterChange}
                            className={`px-4 py-2 border ${currentTheme.border} ${currentTheme.textPrimary} font-light ${currentTheme.focusBorder} focus:outline-none transition-colors`}
                        >
                            <option value="all">{filterPlaceholder}</option>
                            {filterOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    )}
                    
                    {/* Filter Inquiry Dropdown */}
                    {filterInquiryOptions.length > 0 && (
                        <select 
                            value={filterInquiryValue}
                            onChange={onFilterInquiryChange}
                            className={`px-4 py-2 border ${currentTheme.border} ${currentTheme.textPrimary} font-light ${currentTheme.focusBorder} focus:outline-none transition-colors`}
                        >
                            <option value="all">{filterInquiryPlaceholder}</option>
                            {filterInquiryOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Filter Setup Dropdown */}
                    {filterSetupOptions.length > 0 && (
                        <select 
                            value={filterSetupValue}
                            onChange={onFilterSetupChange}
                            className={`px-4 py-2 border ${currentTheme.border} ${currentTheme.textPrimary} font-light ${currentTheme.focusBorder} focus:outline-none transition-colors`}
                        >
                            <option value="all">{filterSetupPlaceholder}</option>
                            {filterSetupOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Filter Status Dropdown */}
                    {filterStatusOptions.length > 0 && (
                        <select 
                            value={filterStatusValue}
                            onChange={onFilterStatusChange}
                            className={`px-4 py-2 border ${currentTheme.border} ${currentTheme.textPrimary} font-light ${currentTheme.focusBorder} focus:outline-none transition-colors`}
                        >
                            <option value="all">{filterStatusPlaceholder}</option>
                            {filterStatusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Filter Type Dropdown - Maple (only one instance) */}
                    {filterTypeOptions.length > 0 && (
                        <select 
                            value={filterTypeValue}
                            onChange={onFilterTypeChange}
                            className={`px-4 py-2 border ${currentTheme.border} ${currentTheme.textPrimary} font-light ${currentTheme.focusBorder} focus:outline-none transition-colors`}
                        >
                            <option value="all">{filterTypePlaceholder}</option>
                            {filterTypeOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Special Filter Button */}
                    {showSpecialFilter && (
                        <button
                            onClick={onSpecialFilterClick}
                            className={`px-4 py-2 text-xs font-light tracking-wider border transition-all duration-300 flex items-center gap-2 ${
                                isSpecialFilterActive
                                    ? `${currentTheme.buttonBg} ${currentTheme.buttonBorder} ${currentTheme.activeText}`
                                    : `border-gray-300 text-gray-600 hover:border-gray-400 ${currentTheme.textHover}`
                            }`}
                        >
                            <FontAwesomeIcon 
                                icon={specialFilterIcon} 
                                className={`text-xs ${isSpecialFilterActive ? 'text-white' : currentTheme.iconColor}`} 
                            />
                            {specialFilterLabel}
                        </button>
                    )}

                    {/* Results Count */}
                    <p className={`text-sm ${currentTheme.resultText} font-light`}>
                        {resultsCount} {resultsCount === 1 ? resultsLabel.slice(0, -1) : resultsLabel} FOUND
                    </p>

                    {/* Extra Buttons */}
                    {extraButtons}
                </div>

                {/* Refresh Button */}
                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        className={`text-xs ${currentTheme.refreshText} transition-colors font-light tracking-wider`}
                    >
                        REFRESH
                    </button>
                )}
            </div>

            {/* Active Filters Display */}
            {isFiltered && (
                <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs text-gray-400 font-light">FILTERING BY:</span>
                    
                    {searchTerm && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-light border border-gray-200">
                            SEARCH: "{searchTerm}"
                        </span>
                    )}
                    
                    {filterValue !== 'all' && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-light border border-gray-200">
                            {filterOptions.find(opt => opt.value === filterValue)?.label || filterValue.toUpperCase()}
                        </span>
                    )}
                    
                    {filterTypeValue !== 'all' && filterTypeOptions.length > 0 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-light border border-gray-200">
                            {filterTypeOptions.find(opt => opt.value === filterTypeValue)?.label || filterTypeValue.toUpperCase()}
                        </span>
                    )}
                    
                    {isSpecialFilterActive && specialFilterLabel && (
                        <span className={`px-2 py-1 bg-gray-100 text-xs font-light border ${currentTheme.filterTag}`}>
                            {specialFilterLabel}
                        </span>
                    )}
                    
                    {activeFilters.map((filter, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-light border border-gray-200">
                            {filter.label}
                        </span>
                    ))}
                    
                    {onClearFilters && (
                        <button
                            onClick={onClearFilters}
                            className="px-2 py-1 text-xs font-light tracking-wider text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
                        >
                            <FontAwesomeIcon icon={faTimes} className="text-xs" />
                            CLEAR ALL
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default FilterBar;