import React, { useState, useEffect, useRef, useCallback } from "react";
import { Form, InputGroup, Button, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Search } from 'react-bootstrap-icons';
import { API_BASE_URL } from "../config";
import { useTranslation } from 'react-i18next';
import "../styles/Searchbar.css";

function Searchbar({ width, onSearch }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();
    const { t } = useTranslation();
    
    // Get translated text
    const placeholder = t('search:placeholder', 'Search products...');
    const loadingText = t('search:loading', 'Searching...');
    const noResultsText = t('search:noResults', 'No products found');
    const errorText = t('search:error', 'Error searching products');

    const fetchSearchResults = useCallback(async (query) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/product/search?q=${encodeURIComponent(query.trim())}`);
            if (!response.ok) {
                throw new Error(errorText);
            }
            const data = await response.json();
            const results = data.products || [];
            setSearchResults(results);
            setShowResults(results.length > 0);
        } catch (error) {
            console.error('Error fetching search results:', error);
            setSearchResults([]);
            setShowResults(false);
        } finally {
            setIsLoading(false);
        }
    }, [errorText]);

    // Debounce search
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchQuery.trim()) {
                fetchSearchResults(searchQuery.trim());
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery, fetchSearchResults]);

    const handleResultClick = (product) => {
        navigate(`/product/${product.id}`);
        setSearchQuery('');
        setShowResults(false);
        onSearch?.(product.name);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const query = searchQuery.trim();
        if (query) {
            navigate(`/search?q=${encodeURIComponent(query)}`);
            setShowResults(false);
            setSearchQuery('');
            onSearch?.(query);
        }
    };

    // Close results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="search-container" ref={searchRef} style={{ width, position: 'relative' }}>
            <Form className="search-bar" onSubmit={handleSubmit}>
                <InputGroup>
                    <Form.Control
                        type="text"
                        placeholder={placeholder}
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchResults.length > 0 && setShowResults(true)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                        autoComplete="off"
                    />
                    <Button 
                        type="submit" 
                        className="search-button"
                        disabled={!searchQuery.trim()}
                        aria-label="Search"
                    >
                        <Search />
                    </Button>
                </InputGroup>
            </Form>

            {showResults && searchResults.length > 0 && (
                <div className="search-results-dropdown">
                    {isLoading ? (
                        <div className="search-loading">{loadingText}</div>
                    ) : searchResults.length === 0 && searchQuery ? (
                        <div className="search-no-results">{noResultsText}</div>
                    ) : (
                        <ListGroup variant="flush">
                            {searchResults.map((product) => (
                                <ListGroup.Item
                                    key={product.id}
                                    action
                                    onClick={() => handleResultClick(product)}
                                    className="search-result-item"
                                >
                                    <div className="d-flex align-items-center">
                                        <img
                                            src={product.image_url || '/placeholder-product.jpg'}
                                            alt={product.name}
                                            className="search-result-img me-2"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/placeholder-product.jpg';
                                            }}
                                        />
                                        <div>
                                            <div className="fw-bold">{product.name}</div>
                                            <small className="text-muted">
                                                ${parseFloat(product.price || 0).toFixed(2)}
                                            </small>
                                        </div>
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </div>
            )}
        </div>
    );
}

export default Searchbar;
