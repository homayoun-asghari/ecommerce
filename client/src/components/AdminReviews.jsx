import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Badge, 
  Form, 
  Modal,
  FormControl,
  InputGroup,
  Spinner,
  Alert,
  ButtonGroup,
  Stack
} from 'react-bootstrap';
import { API_BASE_URL } from '../config';
import { 
  StarFill, 
  Star,
  Trash,
  Search,
  Funnel,
  XCircle
} from 'react-bootstrap-icons';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  
  // Filters
  const [ratingFilter, setRatingFilter] = useState('all');
  const [filtersVisible, setFiltersVisible] = useState(false);

  // Fetch reviews from API
  const fetchReviews = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams({
        page,
        limit: pagination.limit,
        ...(ratingFilter !== 'all' && { rating: ratingFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`${API_BASE_URL}/admin/reviews?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      
      const data = await response.json();
      setReviews(data.data);
      setPagination({
        ...pagination,
        page: data.pagination.page,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages
      });
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, ratingFilter, searchTerm]);

  // Initial fetch
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Handle review deletion
  const handleDeleteReview = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reviews/${selectedReview.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete review');
      }
      
      // Refresh reviews after deletion
      fetchReviews(pagination.page);
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting review:', err);
      setError(err.message);
    }
  };

  // Render star rating
  const renderStars = (rating) => {
    return (
      <div className="d-flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className="text-warning">
            {star <= rating ? <StarFill /> : <Star />}
          </span>
        ))}
      </div>
    );
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      fetchReviews(newPage);
    }
  };

  // Toggle filters visibility
  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };

  // Clear all filters
  const clearFilters = () => {
    setRatingFilter('all');
    setSearchTerm('');
  };

  return (
    <div>
      <h2 className="mb-4">Product Reviews</h2>
      
      {/* Search and Filters */}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Filters</h5>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={toggleFilters}
              className="d-flex align-items-center gap-1"
            >
              <Funnel size={14} />
              {filtersVisible ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
          
          {filtersVisible && (
            <div className="border-top pt-3">
              <div className="row g-3">
                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label>Search</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <Search />
                      </InputGroup.Text>
                      <FormControl
                        placeholder="Search by product or user..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      {searchTerm && (
                        <Button 
                          variant="outline-secondary" 
                          onClick={() => setSearchTerm('')}
                        >
                          <XCircle />
                        </Button>
                      )}
                    </InputGroup>
                  </Form.Group>
                </div>
                
                <div className="col-md-4">
                  <Form.Group>
                    <Form.Label>Rating</Form.Label>
                    <Form.Select 
                      value={ratingFilter}
                      onChange={(e) => setRatingFilter(e.target.value)}
                    >
                      <option value="all">All Ratings</option>
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="2">2 Stars</option>
                      <option value="1">1 Star</option>
                    </Form.Select>
                  </Form.Group>
                </div>
                
                <div className="col-md-2 d-flex align-items-end">
                  <Button 
                    variant="outline-secondary" 
                    onClick={clearFilters}
                    className="w-100"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Error Alert */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      {/* Reviews Table */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No reviews found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>User</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr key={review.id}>
                      <td>
                        <div className="fw-semibold">{review.product?.name || 'N/A'}</div>
                        <small className="text-muted">ID: {review.product_id}</small>
                      </td>
                      <td>
                        <div>{review.user?.name || 'Anonymous'}</div>
                        <small className="text-muted">{review.user?.email}</small>
                      </td>
                      <td>
                        {renderStars(review.rating)}
                        <small className="text-muted d-block mt-1">
                          {review.rating.toFixed(1)}
                        </small>
                      </td>
                      <td>
                        <div className="text-truncate" style={{ maxWidth: '250px' }}>
                          {review.comment || 'No comment'}
                        </div>
                      </td>
                      <td>
                        {new Date(review.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            setSelectedReview(review);
                            setShowDeleteModal(true);
                          }}
                          title="Delete review"
                        >
                          <Trash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    Showing {reviews.length} of {pagination.total} reviews
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>
                    <div className="d-flex align-items-center px-3">
                      Page {pagination.page} of {pagination.totalPages}
                    </div>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this review? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteReview}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminReviews;
