import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Row,
    Col,
    Form,
    Spinner,
    Card,
    Button
} from 'react-bootstrap';
import styled from 'styled-components';
import { useLanguage } from '../hooks/useLanguage';
import ProductCard from '../components/ProductCard';
import { useSideBar } from '../contexts/SideBarContext';
import { useFilters } from '../contexts/FilterContext';
import { API_BASE_URL } from "../config";
import { useSearchParams } from 'react-router-dom';

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
    const { t } = useLanguage();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 1
    });
    const [sortBy, setSortBy] = useState('featured');
    const { isOpen } = useSideBar();
    const { filters, updateFilters } = useFilters();
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Sort options with translations
    const sortOptions = [
        { value: 'featured', label: t('products:featured') },
        { value: 'price-low', label: t('products:priceLowToHigh') },
        { value: 'price-high', label: t('products:priceHighToLow') },
        { value: 'rating', label: t('products:topRated') },
        { value: 'newest', label: t('products:newest') },
        { value: 'best-sellers', label: t('products:bestSellers') },
        { value: 'discount', label: t('products:topDiscount') }
    ];

    // Update URL when sort changes
    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        if (sortBy === 'featured') {
            params.delete('sort');
        } else {
            params.set('sort', sortBy);
        }
        setSearchParams(params, { replace: true });
    }, [sortBy, searchParams, setSearchParams]);

    // Initialize sort from URL
    useEffect(() => {
        const sortParam = searchParams.get('sort');
        if (sortParam) {
            setSortBy(sortParam);
        }
    }, [searchParams]);

    // Fetch products with filters, sorting, and pagination
    const fetchProducts = useCallback(async (page = 1) => {
        try {
            setLoading(true);

            // Build query parameters
            const params = new URLSearchParams({
                page,
                limit: pagination.limit,
                sort: sortBy === 'best-sellers' ? 'sold' : sortBy // Map 'best-sellers' to 'sold' for the backend
            });

            // Add filters from URL or context
            const categoryFromUrl = searchParams.get('category');
            if (categoryFromUrl) {
                params.append('category', categoryFromUrl);
            } else if (filters?.categories?.length > 0) {
                params.append('category', filters.categories[0]);
            }
            
            const minPrice = searchParams.get('minPrice') || (filters?.priceRange?.min > 0 ? filters.priceRange.min : null);
            if (minPrice) {
                params.append('minPrice', minPrice);
            }
            
            const maxPrice = searchParams.get('maxPrice') || (filters?.priceRange?.max < 1000 ? filters.priceRange.max : null);
            if (maxPrice) {
                params.append('maxPrice', maxPrice);
            }
            
            if (filters?.minRating > 0) {
                params.append('minRating', filters.minRating);
            }

            const url = `${API_BASE_URL}/product/shop?${params.toString()}`;
            console.log('Fetching products with params:', {
                url,
                category: params.get('category'),
                minPrice: params.get('minPrice'),
                maxPrice: params.get('maxPrice'),
                minRating: params.get('minRating')
            });

            const response = await fetch(url);
            const data = await response.json();
            
            console.log('API Response:', {
                status: response.status,
                data,
                productsCount: data.products?.length || 0
            });

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch products');
            }

            setProducts(data.products || []);
            
            // Update pagination from the response
            if (data.pagination) {
                const paginationData = {
                    page: data.pagination.page || 1,
                    limit: data.pagination.limit || 12,
                    total: data.pagination.total || 0,
                    totalPages: data.pagination.totalPages || 1
                };
                console.log('Setting pagination from response:', paginationData);
                setPagination(paginationData);
            }
            setError(null);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError(err.message || 'Failed to load products. Please try again later.');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.limit, sortBy, searchParams]);

    // Set initial sort from URL on component mount
    useEffect(() => {
        const sortParam = searchParams.get('sort');
        if (sortParam) {
            setSortBy(sortParam);
        }
    }, [searchParams]);

    // Fetch products when filters, sort, or fetchProducts changes
    useEffect(() => {
        fetchProducts(1);
    }, [filters, sortBy, fetchProducts]);

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
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center w-100">
                                <h5 className="mb-3 mb-md-0 text-center text-md-start">
                                    {t('products:productsFound', { count: pagination.total })}
                                </h5>
                                <div className="d-flex align-items-center gap-2">
                                    <Form.Select
                                        size="sm"
                                        style={{ minWidth: '180px' }}
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        aria-label={t('products:sortBy')}
                                    >
                                        {sortOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={() => {
                                            updateFilters({
                                                categories: [],
                                                priceRange: { min: 0, max: 1000 },
                                                minRating: 0
                                            });
                                            setSearchParams({});
                                        }}
                                        disabled={!filters.categories?.length && !filters.minRating && 
                                                filters.priceRange?.min === 0 && filters.priceRange?.max === 1000}
                                    >
                                        {t('common:clearAllFilters')}
                                    </Button>
                                </div>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {loading ? (
                                <div className="text-center py-5">
                                    <Spinner animation="border" role="status">
                                        <span className="visually-hidden">{t('common:loading')}</span>
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

                                    {pagination.totalPages > 1 && (
                                        <div className="d-flex justify-content-center mt-4 mb-3">
                                            <nav aria-label={t('products:pagination')}>
                                                <ul className="pagination">
                                                    <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                                                        <button
                                                            className="page-link"
                                                            onClick={() => handlePageChange(pagination.page - 1)}
                                                            disabled={pagination.page === 1}
                                                        >
                                                            {t('common:previous')}
                                                        </button>
                                                    </li>

                                                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
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
                                                            {t('common:next')}
                                                        </button>
                                                    </li>
                                                </ul>
                                            </nav>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-5">
                                    <Card.Title className="mb-3">
                                        {t('products:noProductsFound')}
                                    </Card.Title>
                                    <Card.Text className="text-muted mb-4">
                                        {t('products:noProductsMatchingFilters')}
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
                                        {t('common:clearAllFilters')}
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