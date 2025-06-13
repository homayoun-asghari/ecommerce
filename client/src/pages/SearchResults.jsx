import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Alert, Button, Form, InputGroup } from 'react-bootstrap';
import { Search } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import { useSideBar } from "../contexts/SideBarContext";

const SearchResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('relevance');
    const { isOpen } = useSideBar();

    // Extract search query from URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const query = params.get('q') || '';
        setSearchQuery(query);

        if (query) {
            fetchSearchResults(query);
        } else {
            setLoading(false);
        }
    }, [location.search]);

    const fetchSearchResults = async (query) => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5050/product/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch search results');
            }

            setResults(data.products || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching search results:', err);
            setError(err.message || 'An error occurred while searching');
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const sortResults = (results, sortBy) => {
        const sortedResults = [...results];
        switch (sortBy) {
            case 'price_asc':
                return sortedResults.sort((a, b) => a.price - b.price);
            case 'price_desc':
                return sortedResults.sort((a, b) => b.price - a.price);
            case 'rating':
                return sortedResults.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
            case 'newest':
                return sortedResults.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            default:
                return results; // relevance
        }
    };

    const sortedResults = sortResults(results, sortBy);

    return (
        <Container fluid className="py-4">
            <Row className="mb-4">
                <Col lg={isOpen ? 9 : 12} className="ms-auto">
                    <div className="d-flex justify-content-between align-items-center px-3">
                        <h4>Search Results for "{searchQuery}"</h4>
                    <div className="d-flex align-items-center">
                        <span className="me-2">Sort by:</span>
                        <Form.Select
                            size="sm"
                            style={{ width: 'auto' }}
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="relevance">Relevance</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="rating">Top Rated</option>
                            <option value="newest">Newest</option>
                            </Form.Select>
                        </div>
                    </div>
                </Col>
            </Row>

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <p className="mt-2">Searching for products...</p>
                </div>
            ) : error ? (
                <Alert variant="danger">
                    {error}
                </Alert>
            ) : results.length === 0 ? (
                <div className="text-center py-5">
                    <h5>No products found for "{searchQuery}"</h5>
                    <p className="text-muted">Try different keywords or check the spelling</p>
                </div>
            ) : (
                <Row>
                    <Col lg={isOpen ? 9 : 12} className="ms-auto">
                        <Row xs={1} sm={2} lg={3} xl={4} className="g-4">
                            {sortedResults.map((product) => (
                                <Col key={product.id}>
                                    <Card className="h-100 product-card">
                                        <Link to={`/product/${product.id}`} className="text-decoration-none">
                                            <div className="product-image-container">
                                                <Card.Img
                                                    variant="top"
                                                    src={product.thumbnail || '/placeholder-product.jpg'}
                                                    alt={product.name}
                                                    className="product-image"
                                                />
                                    </div>
                                    <Card.Body>
                                        <Card.Title className="product-title">
                                            {product.name}
                                        </Card.Title>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <div className="product-price">
                                                ${parseFloat(product.price || 0).toFixed(2)}
                                                {product.original_price && (
                                                    <span className="text-muted text-decoration-line-through ms-2">
                                                        ${parseFloat(product.original_price || 0).toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                            {product.avg_rating > 0 && (
                                                <div className="product-rating">
                                                    <span className="text-warning">★</span>
                                                    <span className="ms-1">
                                                        {parseFloat(product.avg_rating).toFixed(1)}
                                                        <span className="text-muted"> ({product.review_count || 0})</span>
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </Card.Body>
                                </Link>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Col>
                    </Row>
                )}
            </Container>
    );
};

export default SearchResults;
