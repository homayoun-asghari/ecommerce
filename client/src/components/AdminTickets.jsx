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
  Dropdown,
  DropdownButton,
  Spinner,
  Alert
} from 'react-bootstrap';
import { 
  ChatLeftText, 
  CheckCircle, 
  XCircle, 
  Filter, 
  Search,
  ArrowClockwise,
  Clock,
  Check2Circle,
  ExclamationCircle
} from 'react-bootstrap-icons';

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [response, setResponse] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Available categories and statuses with labels
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'order', label: 'Order' },
    { value: 'payment', label: 'Payment' },
    { value: 'product', label: 'Product' },
    { value: 'account', label: 'Account' },
    { value: 'other', label: 'Other' }
  ];
  
  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'open', label: 'Open' },
    { value: 'pending', label: 'Pending' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ];

  // Fetch tickets from API
  const fetchTickets = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(searchTerm && { search: searchTerm })
      });
      
      const response = await fetch(`http://localhost:5050/admin/tickets?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }
      
      const data = await response.json();
      setTickets(data.data || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 1,
        page: data.pagination?.page || 1
      }));
    } catch (err) {
      setError('Failed to load tickets. Please try again later.');
      console.error('Error fetching tickets:', err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, searchTerm]);
  
  // Initial fetch and refetch when filters change
  useEffect(() => {
    fetchTickets(1);
  }, [fetchTickets]);
  
  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchTickets(newPage);
      window.scrollTo(0, 0);
    }
  };

  // Fetch ticket details by ID
  const fetchTicketDetails = async (ticketId) => {
    try {
      const response = await fetch(`http://localhost:5050/admin/tickets/${ticketId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ticket details');
      }
      return await response.json();
    } catch (err) {
      console.error('Error fetching ticket details:', err);
      throw err;
    }
  };

  // Handle view ticket details
  const handleViewTicket = async (ticket) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5050/admin/tickets/${ticket.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ticket details');
      }
      const data = await response.json();
      setSelectedTicket(ticket);
      setTicketDetails(data);
      setShowResponseModal(true);
    } catch (err) {
      console.error('Error fetching ticket details:', err);
      setError('Failed to load ticket details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Use tickets directly from API (filtering is done server-side)
  const filteredTickets = tickets;

  // Handle ticket status update
  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5050/admin/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update ticket status');
      }
      
      // Refresh tickets to get updated data
      await fetchTickets(pagination.page);
      
      // If we have the ticket details modal open, update its status too
      if (ticketDetails) {
        setTicketDetails(prev => ({
          ...prev,
          status: newStatus,
          updatedAt: new Date().toISOString()
        }));
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error updating ticket status:', err);
      setError(err.message || 'Failed to update ticket status');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Handle ticket response submission
  const handleSubmitResponse = async () => {
    if (!response.trim()) return;
    
    try {
      setLoading(true);
      const apiResponse = await fetch(
        `http://localhost:5050/admin/tickets/${selectedTicket.id}/respond`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: response,
            adminId: 1, // Hardcoded admin ID for demo
            adminName: 'Admin' // Hardcoded admin name for demo
          })
        }
      );
      
      const result = await apiResponse.json();
      
      if (!apiResponse.ok) {
        throw new Error(result.error || 'Failed to submit response');
      }
      
      // Refresh ticket details to show the new response
      if (selectedTicket) {
        const updatedDetails = await fetchTicketDetails(selectedTicket.id);
        setTicketDetails(updatedDetails);
      }
      
      // Refresh tickets list
      await fetchTickets(pagination.page);
      
      // Reset response input but keep modal open
      setResponse('');
      
      // Show success message
      alert('Response submitted successfully');
    } catch (err) {
      console.error('Error submitting response:', err);
      setError(err.message || 'Failed to submit response');
    } finally {
      setLoading(false);
    }
  };
  
  // Format date string
  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
  };
  
  // Get status badge component
  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <Badge bg="primary">Open</Badge>;
      case 'pending':
        return <Badge bg="warning" text="dark">Pending</Badge>;
      case 'resolved':
        return <Badge bg="success">Resolved</Badge>;
      case 'closed':
        return <Badge bg="secondary">Closed</Badge>;
      default:
        return <Badge bg="light" text="dark">{status}</Badge>;
    }
  };
  
  // Get status color (for non-JSX usage)
  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'secondary';
      default:
        return 'light';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <ExclamationCircle className="me-1" />;
      case 'pending':
        return <Clock className="me-1" />;
      case 'resolved':
        return <Check2Circle className="me-1" />;
      case 'closed':
        return <XCircle className="me-1" />;
      default:
        return null;
    }
  };

  // Pagination controls
  const PaginationControls = () => (
    <div className="d-flex justify-content-between align-items-center mt-3">
      <div>
        Showing {filteredTickets.length} of {pagination.total} tickets
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
        <span className="px-3 py-1">
          Page {pagination.page} of {pagination.totalPages || 1}
        </span>
        <Button 
          variant="outline-secondary" 
          size="sm" 
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page >= (pagination.totalPages || 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        {error}
      </Alert>
    );
  }

  return (
    <>
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Support Tickets</h2>
          <div>
            <Button 
              variant="outline-secondary" 
              className="me-2"
              onClick={() => {
                setCategoryFilter('all');
                setStatusFilter('all');
                setSearchTerm('');
              }}
            >
              <ArrowClockwise className="me-1" /> Reset Filters
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-4">
          <Card.Body>
            <h5 className="mb-3">
              <Filter className="me-2" /> Filters
            </h5>
            <div className="d-flex flex-wrap gap-3">
              <div style={{ minWidth: '200px' }}>
                <Form.Label>Search</Form.Label>
                <InputGroup>
                  <InputGroup.Text><Search /></InputGroup.Text>
                  <FormControl
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </div>
              
              <div style={{ minWidth: '200px' }}>
                <Form.Label>Category</Form.Label>
                <Form.Select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </Form.Select>
              </div>
              
              <div style={{ minWidth: '200px' }}>
                <Form.Label>Status</Form.Label>
                <Form.Select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </Form.Select>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Tickets Table */}
        <Card>
          <Card.Body>
            {filteredTickets.length === 0 ? (
              <div className="text-center py-5">
                <ChatLeftText size={48} className="text-muted mb-3" />
                <h5>No tickets found</h5>
                <p className="text-muted">
                  {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' 
                    ? 'Try adjusting your filters or search term'
                    : 'No tickets have been created yet'}
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Subject</th>
                      <th>User</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map(ticket => (
                      <tr key={ticket.id}>
                        <td>#{ticket.id}</td>
                        <td>
                          <div className="fw-semibold">{ticket.subject}</div>
                          <small className="text-muted">Order #{ticket.order_id}</small>
                        </td>
                        <td>
                          <div>{ticket.user.name}</div>
                          <small className="text-muted">{ticket.user.email}</small>
                        </td>
                        <td>
                          <Badge bg="info">
                            {ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={getStatusBadge(ticket.status)}>
                            {getStatusIcon(ticket.status)}
                            {ticket.status.replace('_', ' ').charAt(0).toUpperCase() + ticket.status.replace('_', ' ').slice(1)}
                          </Badge>
                        </td>
                        <td>{formatDate(ticket.createdAt)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setShowResponseModal(true);
                              }}
                            >
                              <ChatLeftText /> Respond
                            </Button>
                            {ticket.status !== 'closed' && (
                              <Dropdown>
                                <Dropdown.Toggle 
                                  variant="outline-secondary" 
                                  size="sm" 
                                  id={`status-dropdown-${ticket.id}`}
                                >
                                  Update Status
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  {statuses
                                    .filter(s => s.value !== 'all' && s.value !== ticket.status)
                                    .map(status => (
                                      <Dropdown.Item 
                                        key={status.value}
                                        onClick={() => updateTicketStatus(ticket.id, status.value)}
                                      >
                                        {status.value === 'closed' ? (
                                          <>
                                            <CheckCircle className="text-success me-2" />
                                            Close Ticket
                                          </>
                                        ) : (
                                          <>
                                            {getStatusIcon(status.value)}
                                            {status.label}
                                          </>
                                        )}
                                      </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                              </Dropdown>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
            
            {/* Pagination */}
            {filteredTickets.length > 0 && <PaginationControls />}
            
          </Card.Body>
        </Card>
      </div>

      {/* Response Modal */}
      <Modal show={showResponseModal} onHide={() => setShowResponseModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedTicket && `Respond to Ticket #${selectedTicket.id}: ${selectedTicket.subject}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTicket && (
            <>
              <div className="mb-3 p-3 bg-light rounded">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong>{selectedTicket.user.name} ({selectedTicket.user.email})</strong>
                  <small className="text-muted">
                    {formatDate(selectedTicket.createdAt)}
                  </small>
                </div>
                <p className="mb-0">
                  <strong>Subject:</strong> {selectedTicket.subject}
                </p>
                <p className="mb-0">
                  <strong>Status:</strong>{' '}
                  <Badge bg={getStatusBadge(selectedTicket.status)}>
                    {selectedTicket.status.replace('_', ' ').charAt(0).toUpperCase() + 
                     selectedTicket.status.replace('_', ' ').slice(1)}
                  </Badge>
                </p>
              </div>
              
              <Form.Group className="mb-3">
                <Form.Label>Your Response</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Type your response here..."
                />
              </Form.Group>
              
              <div className="d-flex justify-content-end gap-2">
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setShowResponseModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleSubmitResponse}
                  disabled={!response.trim()}
                >
                  Send Response
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AdminTickets;
