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
import styled from 'styled-components';
import ProductCard from '../components/ProductCard';
import { useSideBar } from '../contexts/SideBarContext';
import { useFilters } from '../contexts/FilterContext';
import { API_BASE_URL } from "../config";

const ContentColumn = styled(Col)`
  transition: all 0.3s ease-in-out;
  margin-left: 0;
  width: 100%;
  padding: 0 15px;
  
  @media (min-width: 998px) {
    margin-left: ${({ $isOpen }) => ($isOpen ? '300px' : '0')};
    width: ${({ $isOpen }) => ($isOpen ? 'calc(100% - 300px)' : '100%')};
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 1rem 0;
  width: 100%;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
  
  @media (max-width: 576px) {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
`;

function Shop() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [sortBy, setSortBy] = useState('featured');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 1
    });
    const { isOpen } = useSideBar();

    useEffect(() => {
        // Any side effect that needs to run when isOpen changes
        // This effect intentionally left blank for future use
    }, [isOpen]);

    // Get filters and update function from context
    const { filters, updateFilters } = useFilters();

    // Fetch products with filters, sorting, and pagination
    const fetchProducts = async (page = 1) => {
        try {
            setLoading(true);

            // Build query parameters
            const params = new URLSearchParams({
                page,
                limit: pagination.limit,
                sort: sortBy === 'best-sellers' ? 'sold' : sortBy // Map 'best-sellers' to 'sold' for the backend
            });

            // Add filters
            if (filters?.categories?.length > 0) {
                params.append('category', filters.categories[0]);
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

            const url = `${API_BASE_URL}/product/shop?${params.toString()}`;
            console.log('Fetching products from:', url);

            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch products');
            }

            setProducts(data.products);
            setPagination({
                ...pagination,
                page: data.pagination.current_page,
                total: data.pagination.total,
                totalPages: data.pagination.total_pages
            });

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

    // Initial fetch and when filters/sort change
    useEffect(() => {
        fetchProducts(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, sortBy]); // fetchProducts is stable and doesn't need to be in deps

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchProducts(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
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
        <Container fluid className="py-4 px-0 px-md-3">
            <Row className="position-relative">
                <ContentColumn
                    $isOpen={isOpen}
                    lg={isOpen ? 9 : 12}
                    className="px-0 px-md-3"
                >
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Header className="border-bottom-0 py-3">
                            <div className="d-flex flex-column flex-md-row justify-content-center justify-content-md-between align-items-center">
                                <h5 className="mb-3 mb-md-0 text-center text-md-start">
                                    {pagination.total} {pagination.total === 1 ? 'Product' : 'Products'} Found
                                </h5>
                                <div style={{ maxWidth: '300px', width: '100%' }}>
                                    <Stack direction="horizontal" gap={2} className="justify-content-center justify-content-md-end">
                                        <Form.Label className="mb-0 text-nowrap">Sort by:</Form.Label>
                                        <Form.Select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            size="sm"
                                        >
                                            <option value="featured">Featured</option>
                                            <option value="best-sellers">Best Sellers</option>
                                            <option value="price-low">Price: Low to High</option>
                                            <option value="price-high">Price: High to Low</option>
                                            <option value="rating">Top Rated</option>
                                            <option value="newest">Newest</option>
                                        </Form.Select>
                                    </Stack>
                                </div>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {loading ? (
                                <div className="text-center py-5">
                                    <Spinner animation="border" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </Spinner>
                                </div>
                            ) : products.length > 0 ? (
                                <>
                                    <ProductsGrid className="p-3">
                                        {products.map((product) => (
                                            <div key={product.id} className="w-100" style={{ maxWidth: '320px' }}>
                                                <ProductCard
                                                    product={product}
                                                    className="h-100 w-100"
                                                />
                                            </div>
                                        ))}
                                    </ProductsGrid>

                                    {/* Pagination */}
                                    {pagination.totalPages > 1 && (
                                        <div className="d-flex justify-content-center mt-4 mb-3">
                                            <nav aria-label="Product pagination">
                                                <ul className="pagination">
                                                    <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                                                        <button
                                                            className="page-link"
                                                            onClick={() => handlePageChange(pagination.page - 1)}
                                                            disabled={pagination.page === 1}
                                                        >
                                                            Previous
                                                        </button>
                                                    </li>

                                                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                                        // Calculate page numbers to show (max 5 at a time)
                                                        let pageNum;
                                                        if (pagination.totalPages <= 5) {
                                                            pageNum = i + 1;
                                                        } else if (pagination.page <= 3) {
                                                            pageNum = i + 1;
                                                        } else if (pagination.page >= pagination.totalPages - 2) {
                                                            pageNum = pagination.totalPages - 4 + i;
                                                        } else {
                                                            pageNum = pagination.page - 2 + i;
                                                        }

                                                        return (
                                                            <li key={pageNum} className={`page-item ${pagination.page === pageNum ? 'active' : ''}`}>
                                                                <button
                                                                    className="page-link"
                                                                    onClick={() => handlePageChange(pageNum)}
                                                                >
                                                                    {pageNum}
                                                                </button>
                                                            </li>
                                                        );
                                                    })}

                                                    <li className={`page-item ${pagination.page === pagination.totalPages ? 'disabled' : ''}`}>
                                                        <button
                                                            className="page-link"
                                                            onClick={() => handlePageChange(pagination.page + 1)}
                                                            disabled={pagination.page === pagination.totalPages}
                                                        >
                                                            Next
                                                        </button>
                                                    </li>
                                                </ul>
                                            </nav>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-5">
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
                                        className="px-4"
                                    >
                                        Clear All Filters
                                    </Button>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </ContentColumn>
            </Row>
        </Container>
    );
}

export default Shop;