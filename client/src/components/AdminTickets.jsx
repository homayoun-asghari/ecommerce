import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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
  Spinner,
  Alert
} from 'react-bootstrap';
import { API_BASE_URL } from '../config';
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
  const { t } = useTranslation('adminTickets');
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
    { value: 'all', label: t('categories.all') },
    { value: 'order', label: t('categories.order') },
    { value: 'payment', label: t('categories.payment') },
    { value: 'product', label: t('categories.product') },
    { value: 'account', label: t('categories.account') },
    { value: 'other', label: t('categories.other') }
  ];
  
  const statuses = [
    { value: 'all', label: t('statuses.all') },
    { value: 'open', label: t('statuses.open') },
    { value: 'pending', label: t('statuses.pending') },
    { value: 'resolved', label: t('statuses.resolved') },
    { value: 'closed', label: t('statuses.closed') }
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
      
      const response = await fetch(`${API_BASE_URL}/admin/tickets?${params}`);
      
      if (!response.ok) {
        throw new Error(t('errors.fetchTickets'));
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
      setError(t('errors.fetchTickets'));
      console.error('Error fetching tickets:', err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, searchTerm, t]);
  
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
      const response = await fetch(`${API_BASE_URL}/admin/tickets/${ticketId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ticket details');
      }
      return await response.json();
    } catch (err) {
      console.error('Error fetching ticket details:', err);
      throw err;
    }
  };



  // Use tickets directly from API (filtering is done server-side)
  const filteredTickets = tickets;

  // Handle ticket status update
  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || t('errors.updateStatus'));
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
      setError(err.message || t('errors.updateStatus'));
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
        `${API_BASE_URL}/admin/tickets/${selectedTicket.id}/respond`,
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
        throw new Error(result.error || t('errors.submitResponse'));
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
      alert(t('errors.successResponse'));
    } catch (err) {
      console.error('Error submitting response:', err);
      setError(err.message || t('errors.submitResponse'));
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
    const statusText = t(`statuses.${status}`, { defaultValue: status });
    switch (status) {
      case 'open':
        return <Badge bg="primary">{statusText}</Badge>;
      case 'pending':
        return <Badge bg="warning" text="dark">{statusText}</Badge>;
      case 'resolved':
        return <Badge bg="success">{statusText}</Badge>;
      case 'closed':
        return <Badge bg="secondary">{statusText}</Badge>;
      default:
        return <Badge bg="light" text="dark">{statusText}</Badge>;
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
        {t('table.showing', { count: filteredTickets.length, total: pagination.total })}
      </div>
      <div className="d-flex gap-2">
        <Button 
          variant="outline-secondary" 
          size="sm" 
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
        >
          {t('buttons.previous')}
        </Button>
        <span className="px-3 py-1">
          {t('table.pageInfo', { current: pagination.page, total: pagination.totalPages || 1 })}
        </span>
        <Button 
          variant="outline-secondary" 
          size="sm" 
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page >= (pagination.totalPages || 1)}
        >
          {t('buttons.next')}
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">{t('loading')}</span>
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
          <h2 className="mb-0">{t('title')}</h2>
          <div>
            <Button 
              variant="outline-secondary" 
              className="me-2"
              onClick={() => {
                setCategoryFilter('all');
                setStatusFilter('all');
                setSearchTerm('');
              }}
              title={t('filters.reset.tooltip')}
            >
              <ArrowClockwise className="me-1" /> {t('filters.reset.label')}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-4">
          <Card.Body>
            <h5 className="mb-3">
              <Filter className="me-2" /> {t('filters.title')}
            </h5>
            <div className="d-flex flex-wrap gap-3">
              <div style={{ minWidth: '200px' }}>
                <Form.Label>{t('filters.search.label')}</Form.Label>
                <InputGroup>
                  <InputGroup.Text><Search /></InputGroup.Text>
                  <FormControl
                    placeholder={t('filters.search.placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </div>
              
              <div style={{ minWidth: '200px' }}>
                <Form.Label>{t('filters.category.label')}</Form.Label>
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
                <Form.Label>{t('filters.status.label')}</Form.Label>
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
                <h5>{t('table.noTickets.title')}</h5>
                <p className="text-muted">
                  {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' 
                    ? t('table.noTickets.adjustFilters')
                    : t('table.noTickets.message')}
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>{t('table.id')}</th>
                      <th>{t('table.subject')}</th>
                      <th>{t('table.user')}</th>
                      <th>{t('table.category')}</th>
                      <th>{t('table.status')}</th>
                      <th>{t('table.created')}</th>
                      <th>{t('table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map(ticket => (
                      <tr key={ticket.id}>
                        <td>#{ticket.id}</td>
                        <td>
                          <div className="fw-semibold">{ticket.subject}</div>
                          <small className="text-muted">{t('table.orderId', { orderId: ticket.order_id })}</small>
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
                              <ChatLeftText /> {t('buttons.respond')}
                            </Button>
                            {ticket.status !== 'closed' && (
                              <Dropdown>
                                <Dropdown.Toggle 
                                  variant="outline-secondary" 
                                  size="sm" 
                                  id={`status-dropdown-${ticket.id}`}
                                >
                                  {t('buttons.updateStatus')}
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
                                            {t('buttons.closeTicket')}
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
            {selectedTicket && t('modal.title', { id: selectedTicket.id, subject: selectedTicket.subject })}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTicket && (
            <>
              <div className="mb-3 p-3 bg-light rounded">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong>{t('modal.userInfo', { name: selectedTicket.user.name, email: selectedTicket.user.email })}</strong>
                  <small className="text-muted">
                    {formatDate(selectedTicket.createdAt)}
                  </small>
                </div>
                <p className="mb-0">
                  <strong>{t('modal.subject', { subject: selectedTicket.subject })}</strong>
                </p>
                <p className="mb-0">
                  <strong>{t('modal.status', { status: '' })}</strong>{' '}
                  {getStatusBadge(selectedTicket.status)}
                </p>
              </div>
              
              <Form.Group className="mb-3">
                <Form.Label>{t('modal.response.label')}</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder={t('modal.response.placeholder')}
                />
              </Form.Group>
              
              <div className="d-flex justify-content-end gap-2">
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setShowResponseModal(false)}
                >
                  {t('buttons.cancel')}
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleSubmitResponse}
                  disabled={!response.trim()}
                >
                  {t('buttons.sendResponse')}
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
