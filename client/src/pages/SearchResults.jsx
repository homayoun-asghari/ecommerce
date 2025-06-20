import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner, Alert, Form, Card } from 'react-bootstrap';
import { useSideBar } from "../contexts/SideBarContext";
import { useFilters } from "../contexts/FilterContext";
import { API_BASE_URL } from "../config";
import ProductCard from '../components/ProductCard';
import FilterSideBar from '../components/FilterSideBar';
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
  margin-left: 0;
  width: 100%;
  
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

// Removed unused StyledCard component

// Removed ResultsHeader styled component as we'll use Card components instead

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
  const { filters } = useFilters();

  const fetchSearchResults = useCallback(async (query) => {
    if (!query) return;

    try {
      setLoading(true);
      setError(null);

      // Build query parameters with filters
      const params = new URLSearchParams();
      params.append('q', query); // Don't encode here, let the URLSearchParams handle it
      
      if (filters.categories?.length > 0) {
        params.append('category', filters.categories[0]);
      }
      if (filters.minRating > 0) {
        params.append('minRating', filters.minRating);
      }
      if (filters.priceRange) {
        params.append('minPrice', filters.priceRange.min);
        params.append('maxPrice', filters.priceRange.max);
      }

      const response = await fetch(`${API_BASE_URL}/product/search?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch search results');
      }

      const data = await response.json();
      setResults(data.products || []);
      
      if (data.products && data.products.length === 0) {
        setError('No products found matching your search.');
      }
    } catch (err) {
      console.error('Error fetching search results:', err);
      setError(err.message || 'An error occurred while searching');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch search results when query changes or filters update
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || '';
    setSearchQuery(query);

    if (query) {
      fetchSearchResults(query);
    } else {
      setLoading(false);
    }
  }, [location.search, fetchSearchResults]);

  // Search is handled via URL parameters, no need for separate submit handler
  // navigate is already declared at the top of the component

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
        <ContentColumn 
          md={isOpen ? 9 : 12} 
          className="content-col"
          $isOpen={isOpen}
        >
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center py-3">
              <h5 className="mb-0">
                Search Results for "{searchQuery}"
                {!loading && results.length > 0 && (
                  <span className="text-muted ms-2 fw-normal">
                    ({results.length} {results.length === 1 ? 'item' : 'items'})
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
                  <p className="text-muted">Try different keywords or check the spelling</p>
                </div>
              ) : (
                <ProductsGrid className="p-3">
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
              )}
            </Card.Body>
          </Card>
        </ContentColumn>
      </Row>
    </Container>
  );
};

export default SearchResults;
