// src/components/Searchbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Form, InputGroup, Button, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Search } from 'react-bootstrap-icons';
import "../styles/Searchbar.css";

function Searchbar({ width, placeholder = 'Search products...', onSearch }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    // Debounce effect
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchQuery.trim()) {
                fetchSearchResults(searchQuery.trim());
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

    const fetchSearchResults = async (query) => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5050/product/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            setSearchResults(data.products || []);
            setShowResults(true);
        } catch (error) {
            console.error('Error fetching search results:', error);
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResultClick = (product) => {
        navigate(`/product/${product.id}`);
        setSearchQuery('');
        setShowResults(false);
        if (onSearch) onSearch(product.name);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setShowResults(false);
            if (onSearch) onSearch(searchQuery.trim());
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
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
                    >
                        <Search />
                    </Button>
                </InputGroup>
            </Form>

            {showResults && searchResults.length > 0 && (
                <div className="search-results-dropdown">
                    {isLoading ? (
                        <div className="p-3 text-center">Searching...</div>
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
                                            src={product.thumbnail || '/placeholder-product.jpg'}
                                            alt={product.name}
                                            className="search-result-img me-2"
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
