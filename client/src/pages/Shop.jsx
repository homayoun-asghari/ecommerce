import React, { useState, useEffect } from 'react';
import {
    Container,
    Row,
    Col,
    Form,
    Spinner,
    Card,
    Stack,
    Button
} from 'react-bootstrap';
import ProductCard from '../components/ProductCard';
import FilterSideBar from '../components/FilterSideBar';
import { useSideBar } from '../contexts/SideBarContext';

function Shop() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [sortBy, setSortBy] = useState('featured');
    const { isOpen } = useSideBar();

    // Filter state
    const [filters, setFilters] = useState({
        categories: [],
        minRating: 0,
        priceRange: { min: 0, max: 1000 }
    });

    // Fetch products and categories
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:5050/product');
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                setProducts(data);
                setFilteredProducts(data);

                // Extract unique categories
                const uniqueCategories = [...new Set(data.map(p => p.category))];
                setCategories(uniqueCategories);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Apply filters
    useEffect(() => {
        let result = [...products];

        // Apply category filter
        if (filters.categories.length > 0) {
            result = result.filter(product =>
                filters.categories.includes(product.category)
            );
        }

        // Apply rating filter
        if (filters.minRating > 0) {
            result = result.filter(product =>
                product.avg_rating >= filters.minRating
            );
        }

        // Apply price range filter
        result = result.filter(product =>
            product.price >= filters.priceRange.min &&
            product.price <= filters.priceRange.max
        );

        // Apply sorting
        switch (sortBy) {
            case 'price-low':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                result.sort((a, b) => b.avg_rating - a.avg_rating);
                break;
            case 'newest':
                result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            default: // featured
                // Keep default sorting or apply any other logic
                break;
        }

        setFilteredProducts(result);
    }, [filters, products, sortBy]);

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters
        }));
    };

    if (loading) {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col xs="auto">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </Col>
                </Row>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={8} className="text-center">
                        <Card className="border-danger">
                            <Card.Body>
                                <Card.Title className="text-danger">Error Loading Products</Card.Title>
                                <Card.Text>{error}</Card.Text>
                                <Button
                                    variant="outline-danger"
                                    onClick={() => window.location.reload()}
                                >
                                    Retry
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <Row>
            <Col lg={isOpen ? 3 : 0}></Col>
            <Col lg={isOpen ? 9 : 12}>
                <Card className="mb-4 border-0 shadow-sm">
                    <Card.Body>
                        <Row className="align-items-center">
                            <Col xs={12} md={6}>
                                <h2 className="mb-3 mb-md-0">Shop</h2>
                            </Col>
                            <Col xs={12} md={6} className="d-flex justify-content-md-end">
                                <Stack direction="horizontal" gap={2} className="w-100" style={{ maxWidth: '300px' }}>
                                    <Form.Label className="mb-0 text-nowrap">Sort by:</Form.Label>
                                    <Form.Select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        size="sm"
                                    >
                                        <option value="featured">Featured</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                        <option value="rating">Top Rated</option>
                                        <option value="newest">Newest</option>
                                    </Form.Select>
                                </Stack>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {filteredProducts.length > 0 ? (
                    <Row xs={1} sm={2} lg={3} xl={4} className="g-4">
                        {filteredProducts.map((product) => (
                            <Col key={product.id} className="d-flex">
                                <ProductCard
                                    product={product}
                                    className="h-100"
                                />
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <Card className="text-center py-5">
                        <Card.Body>
                            <Card.Title className="mb-3">No products found</Card.Title>
                            <Card.Text className="text-muted mb-4">
                                We couldn't find any products matching your filters.
                            </Card.Text>
                            <Button
                                variant="outline-primary"
                                onClick={() => setFilters({
                                    categories: [],
                                    minRating: 0,
                                    priceRange: { min: 0, max: 1000 }
                                })}
                            >
                                Clear All Filters
                            </Button>
                        </Card.Body>
                    </Card>
                )}
            </Col>
        </Row>
    );
}

export default Shop;