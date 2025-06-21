import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Initialize filters from URL or defaults
    const [filters, setFilters] = useState({
        categories: searchParams.get('category') ? [searchParams.get('category')] : [],
        minRating: 0,
        priceRange: { 
            min: parseInt(searchParams.get('minPrice')) || 0, 
            max: parseInt(searchParams.get('maxPrice')) || 1000 
        }
    });

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        
        // Only add category if it exists
        if (filters.categories && filters.categories.length > 0) {
            params.set('category', filters.categories[0]);
        }
        
        // Add price range if not default
        if (filters.priceRange?.min > 0) {
            params.set('minPrice', filters.priceRange.min);
        }
        if (filters.priceRange?.max < 1000) {
            params.set('maxPrice', filters.priceRange.max);
        }
        
        // Only update if there are params to set
        if (Array.from(params.keys()).length > 0) {
            setSearchParams(params, { replace: true });
        }
    }, [filters, setSearchParams]);

    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters
        }));
    }, []);

    return (
        <FilterContext.Provider value={{ filters, updateFilters }}>
            {children}
        </FilterContext.Provider>
    );
};

export const useFilters = () => {
    const context = useContext(FilterContext);
    if (!context) {
        throw new Error('useFilters must be used within a FilterProvider');
    }
    return context;
};
