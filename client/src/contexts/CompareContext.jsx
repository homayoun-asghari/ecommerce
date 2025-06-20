import React, { createContext, useContext, useReducer, useCallback } from 'react';

const CompareContext = createContext();

export const useCompare = () => {
  return useContext(CompareContext);
};

const compareReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_COMPARE':
      // Check if product is already in compare
      if (state.items.some(item => item.id === action.payload.id)) {
        return state;
      }
      // Limit to 4 products for comparison
      if (state.items.length >= 4) {
        return { ...state, error: 'You can compare up to 4 products at a time' };
      }
      return { ...state, items: [...state.items, action.payload], error: null };
    
    case 'REMOVE_FROM_COMPARE':
      return { 
        ...state, 
        items: state.items.filter(item => item.id !== action.payload),
        error: null 
      };
      
    case 'CLEAR_COMPARE':
      return { items: [], error: null };
      
    case 'CLEAR_ERROR':
      return { ...state, error: null };
      
    default:
      return state;
  }
};

export const CompareProvider = ({ children }) => {
  const [compare, dispatch] = useReducer(compareReducer, { items: [], error: null });

  const addToCompare = useCallback((product) => {
    dispatch({ type: 'ADD_TO_COMPARE', payload: product });
  }, []);

  const removeFromCompare = useCallback((productId) => {
    dispatch({ type: 'REMOVE_FROM_COMPARE', payload: productId });
  }, []);

  const clearCompare = useCallback(() => {
    dispatch({ type: 'CLEAR_COMPARE' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const isInCompare = useCallback((productId) => {
    // Convert both IDs to strings for comparison to handle number/string mismatches
    const targetId = String(productId);
    return compare.items.some(item => String(item.id) === targetId);
  }, [compare.items]);

  const value = {
    items: compare.items,
    error: compare.error,
    addToCompare,
    removeFromCompare,
    clearCompare,
    clearError,
    isInCompare
  };

  return (
    <CompareContext.Provider value={value}>
      {children}
    </CompareContext.Provider>
  );
};
