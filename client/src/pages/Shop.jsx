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
import { useSideBar } from '../contexts/SideBarContext';
import { useFilters } from '../contexts/FilterContext';

function Shop() {
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [sortBy, setSortBy] = useState('featured');
    const { isOpen } = useSideBar();
    const [accordion, setAccordion] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setAccordion(prev => !prev)
            }, 350)
        } else {
            setTimeout(() => {
                setAccordion(prev => !prev)
            }, 0)
        }
    }, [isOpen]);

    // Get filters and update function from context
    const { filters, updateFilters } = useFilters();

    // Fetch products with filters and sorting
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);

                // Build query parameters
                const params = new URLSearchParams();

                // Add filters
                if (filters?.categories?.length > 0) {
                    params.append('category', filters.categories[0]); // For now, using first category only
                }
                if (filters?.priceRange?.min > 0) {
                    params.append('minPrice', filters.priceRange.min);
                }
                if (filters?.priceRange?.max < 1000) {
                    params.append('maxPrice', filters.priceRange.max);
                }
                if (filters?.minRating > 0) {
                    params.append('minRating', filters.minRating);
                }

                // Add sorting
                params.append('sort', sortBy);

                const url = `http://localhost:5050/product/shop?${params.toString()}`;
                console.log('Fetching products from:', url);

                const response = await fetch(url);
                const data = await response.json();

                if (!response.ok) {
                    console.error('Server response error:', data);
                    throw new Error(data.error || 'Failed to fetch products');
                }
                setFilteredProducts(data.products);

                // Update categories if not already set
                if (categories.length === 0) {
                    const uniqueCategories = [...new Set(data.products.map(p => p.category))];
                    setCategories(uniqueCategories);
                }

            } catch (err) {
                console.error('Error fetching products:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [filters, sortBy, categories.length]);

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
            <Col lg={accordion ? 3 : 0}></Col>
            <Col lg={accordion ? 9 : 12}>
                <Card className="mb-4 border-0 shadow-sm">
                    <Card.Body>
                        <Row className="align-items-center">
                            <Col xs={12} md={6}>
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
                            <Col key={product.id}>
                                <ProductCard
                                    product={product}
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
                                onClick={() => updateFilters({
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