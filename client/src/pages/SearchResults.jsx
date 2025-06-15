import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner, Alert, Form, Card } from 'react-bootstrap';
import { useSideBar } from "../contexts/SideBarContext";
import { useFilters } from "../contexts/FilterContext";
import ProductCard from '../components/ProductCard';
import styled from 'styled-components';

// Styled components for layout and animations
const SidebarColumn = styled(Col)`
  transition: all 0.3s ease-in-out;
  transform: ${({ $isOpen }) => ($isOpen ? 'translateX(0)' : 'translateX(-100%)')};
  opacity: ${({ $isOpen }) => ($isOpen ? '1' : '0')};
  position: ${({ $isOpen }) => ($isOpen ? 'relative' : 'absolute')};
  z-index: ${({ $isOpen }) => ($isOpen ? '1' : '-1')};
  width: 300px;
  padding-right: 0;
`;

const ContentColumn = styled(Col)`
  transition: all 0.3s ease-in-out;
  margin-left: ${({ $isOpen }) => ($isOpen ? '300px' : '0')};
  width: ${({ $isOpen }) => ($isOpen ? 'calc(100% - 300px)' : '100%')};
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    padding: 0.5rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

// Removed unused StyledCard component

// Removed ResultsHeader styled component as we'll use Card.Header instead

const SearchResults = () => {
    const location = useLocation();
    // eslint-disable-next-line no-unused-vars
    const navigate = useNavigate(); // Will be used for future navigation
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('relevance');
    const { isOpen } = useSideBar();
    const [accordion, setAccordion] = useState(false);
    const { filters } = useFilters();
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 1
    });

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

    const fetchSearchResults = useCallback(async (query, page = 1) => {
        try {
            setLoading(true);
            
            // Build query parameters with current pagination limit
            const params = new URLSearchParams({
                q: encodeURIComponent(query),
                page,
                limit: 12, // Fixed limit as per initial state
                sort: sortBy
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

            const url = `http://localhost:5050/product/search?${params.toString()}`;
            console.log('Fetching search results from:', url);

            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch search results');
            }

            setResults(data.products || []);
            setPagination(prevPagination => ({
                ...prevPagination,
                page: data.pagination?.current_page || 1,
                total: data.pagination?.total || 0,
                totalPages: data.pagination?.total_pages || 1
            }));
            setError(null);
        } catch (err) {
            console.error('Error fetching search results:', err);
            setError(err.message || 'An error occurred while searching');
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [filters, sortBy]); // Removed pagination.limit from deps as it's now fixed

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchSearchResults(searchQuery, newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Refetch when filters, sort, or search query changes
    useEffect(() => {
        if (searchQuery) {
            fetchSearchResults(searchQuery, 1);
        }
    }, [searchQuery, fetchSearchResults]);

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
        <Container fluid className="py-4 px-0 px-md-3">
      <Row className="position-relative">

        {/* Main Content */}
        <ContentColumn 
          $isOpen={isOpen && accordion}
          lg={isOpen ? 9 : 12}
          className="px-0 px-md-3"
        >
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                Search Results for "{searchQuery}"
                {!loading && (
                  <span className="text-muted ms-2 fw-normal">
                    ({pagination.total} {pagination.total === 1 ? 'item' : 'items'})
                  </span>
                )}
              </h5>
              <div className="d-flex align-items-center">
                <span className="me-2 d-none d-sm-inline text-nowrap">Sort by:</span>
                <Form.Select
                  size="sm"
                  style={{ minWidth: '180px' }}
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
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-2">Searching for products...</p>
            </div>
          ) : error ? (
            <Alert variant="danger" className="m-3">
              {error}
            </Alert>
          ) : results.length === 0 ? (
            <div className="text-center py-5">
              <h5>No products found for "{searchQuery}"</h5>
              <p className="text-muted">Try different keywords or adjust your filters</p>
            </div>
          ) : (
            <>
              <ProductsGrid>
                {sortedResults.map((product) => (
                  <div key={product.id} className="d-flex">
                    <ProductCard
                      product={{
                        ...product,
                        discount: product.discount || 0,
                        stock: product.stock || 10,
                        category: product.category || 'Uncategorized',
                        description: product.description || ''
                      }}
                      className="h-100 w-100"
                    />
                  </div>
                ))}
              </ProductsGrid>
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <nav aria-label="Search results pagination">
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
              )}
            </Card.Body>
          </Card>
        </ContentColumn>
      </Row>
    </Container>
  );
};

export default SearchResults;
