import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner, Alert, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useSideBar } from "../contexts/SideBarContext";
import ProductCard from '../components/ProductCard';

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
                            {sortedResults.map((product) => {
                                // Map the product data to match ProductCard's expected format
                                const productData = {
                                    ...product,
                                    image_url: product.thumbnail || '/placeholder-product.jpg',
                                    discount: product.discount || 0,
                                    stock: product.stock || 10, // Default stock if not provided
                                    category: product.category || 'Uncategorized',
                                    description: product.description || ''
                                };
                                return (
                                    <Col key={product.id} className="d-flex justify-content-center">
                                        <ProductCard product={productData} />
                                    </Col>
                                );
                            })}
                        </Row>
                    </Col>
                </Row>
                )}
            </Container>
    );
};

export default SearchResults;
