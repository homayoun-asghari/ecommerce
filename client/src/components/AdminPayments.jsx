import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Form, 
  Badge, 
  Modal,
  Alert,
  Spinner,
  Tabs,
  Tab
} from 'react-bootstrap';
import { 
  CashStack,
  CheckCircleFill,
  ClockFill
} from 'react-bootstrap-icons';

// API base URL
const API_BASE_URL = 'http://localhost:5050/admin';



const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('payments');
  
  // Pagination states
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    limit: 10,
    total: 0
  });
  
  // Filter states
  // eslint-disable-next-line no-unused-vars
  const [filters, setFilters] = useState({
    seller_id: '',
    status: '',
    start_date: '',
    end_date: '',
    search: ''
  });
  
  // Local filter states for UI
  const [sellerFilter, setSellerFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Payout states
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);

  // Fetch payments from API
  const fetchPayments = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query params
      const params = new URLSearchParams({
        page,
        limit: pagination.limit,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      });
      
      const response = await fetch(`${API_BASE_URL}/payments?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      
      const data = await response.json();
      
      setPayments(data.payments);
      setPagination(prev => ({
        ...prev,
        page: data.pagination.page,
        pages: data.pagination.pages,
        total: data.pagination.total
      }));
    } catch (err) {
      setError(err.message || 'Failed to load payments');
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit, setPagination]);

  // Fetch payouts from API
  const fetchPayouts = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query params
      const params = new URLSearchParams({
        page,
        limit: pagination.limit,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      });
      
      const response = await fetch(`${API_BASE_URL}/payouts?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch payouts');
      }
      
      const data = await response.json();
      
      setPayouts(data.payouts);
      setPagination(prev => ({
        ...prev,
        page: data.pagination.page,
        pages: data.pagination.pages,
        total: data.pagination.total
      }));
    } catch (err) {
      setError(err.message || 'Failed to load payouts');
      console.error('Error fetching payouts:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit, setPagination]);

  // Fetch data when tab or page changes
  useEffect(() => {
    const fetchData = async () => {
      if (activeTab === 'payments') {
        await fetchPayments(pagination.page);
      } else {
        await fetchPayouts(pagination.page);
      }
    };

    fetchData();
  }, [activeTab, pagination.page, fetchPayments, fetchPayouts]);

  // Apply filters
  const filteredPayments = useMemo(() => {
    let result = [...payments];

    if (sellerFilter !== 'all') {
      result = result.filter(p => p.seller?.id?.toString() === sellerFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }

    if (dateRange.start) {
      result = result.filter(p => new Date(p.paid_at) >= new Date(dateRange.start));
    }

    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59);
      result = result.filter(p => new Date(p.paid_at) <= endDate);
    }

    return result;
  }, [sellerFilter, statusFilter, dateRange, payments]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResetFilters = () => {
    setSellerFilter('all');
    setStatusFilter('all');
    setDateRange({ start: '', end: '' });
  };

  const handleManualPayout = (payout) => {
    setSelectedPayout(payout);
    setShowPayoutModal(true);
  };

  const confirmPayout = () => {
    // TODO: Replace with actual API call
    // await fetch(`http://localhost:5050/admin/payouts/${selectedPayout.id}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ status: 'paid' })
    // });
    
    // Update local state for demo
    setPayouts(payouts.map(p => 
      p.id === selectedPayout.id ? { ...p, status: 'paid' } : p
    ));
    
    setShowPayoutModal(false);
    setSelectedPayout(null);
  };

  const getStatusBadge = (status) => {
    const variants = {
      completed: 'success',
      pending: 'warning',
      refunded: 'danger',
      failed: 'danger',
      paid: 'success'
    };

    return (
      <Badge bg={variants[status] || 'secondary'} className="text-capitalize">
        {status}
      </Badge>
    );
  };

  const getPaymentMethodIcon = useMemo(() => {
    const icons = {
      credit_card: '💳',
      paypal: '🔵 PayPal',
      bank_transfer: '🏦 Bank',
      stripe: '💳 Stripe'
    };

    return (method) => icons[method] || method;
  }, []);

  // Generate seller options from payments data
  // eslint-disable-next-line no-unused-vars
  const sellerOptions = useMemo(() => {
    const uniqueSellers = [...new Set(payments.map(p => p.seller?.id).filter(Boolean))];
    const options = uniqueSellers.map(id => {
      const seller = payments.find(p => p.seller?.id === id)?.seller;
      return {
        value: id,
        label: seller ? `${seller.name} (${seller.email})` : `Seller ${id}`
      };
    });
    
    return [{ value: 'all', label: 'All Sellers' }, ...options];
  }, [payments]);

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Payments & Payouts</h2>
        <div>
          <Button 
            variant="outline-secondary" 
            className="me-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Filters'}
          </Button>
          <Button variant="outline-primary" className="ms-2">
            Export
          </Button>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        <Tab eventKey="payments" title="Payments">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              {showFilters && (
                <div className="bg-secondary p-3 rounded mb-4">
                  <div className="row g-3">
                    <div className="col-md-3">
                      <Form.Group>
                        <Form.Label>Seller</Form.Label>
                        <Form.Select 
                          value={sellerFilter}
                          onChange={(e) => setSellerFilter(e.target.value)}
                        >
                          {sellerOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </div>
                    <div className="col-md-3">
                      <Form.Group>
                        <Form.Label>Status</Form.Label>
                        <Form.Select 
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                        >
                          <option value="all">All Statuses</option>
                          <option value="completed">Completed</option>
                          <option value="pending">Pending</option>
                          <option value="refunded">Refunded</option>
                          <option value="failed">Failed</option>
                        </Form.Select>
                      </Form.Group>
                    </div>
                    <div className="col-md-3">
                      <Form.Group>
                        <Form.Label>From Date</Form.Label>
                        <Form.Control
                          type="date"
                          name="start"
                          value={dateRange.start}
                          onChange={handleDateChange}
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-3">
                      <Form.Group>
                        <Form.Label>To Date</Form.Label>
                        <Form.Control
                          type="date"
                          name="end"
                          value={dateRange.end}
                          onChange={handleDateChange}
                        />
                      </Form.Group>
                    </div>
                    <div className="col-12">
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={handleResetFilters}
                      >
                        Reset Filters
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {error && <Alert variant="danger">{error}</Alert>}

              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="align-middle">
                    <thead>
                      <tr>
                        <th>Payment ID</th>
                        <th>Order ID</th>
                        <th>Buyer</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.length > 0 ? (
                        filteredPayments.map((payment) => (
                          <tr key={payment.id}>
                            <td className="fw-semibold">{payment.id}</td>
                            <td>{payment.orderId}</td>
                            <td>{payment.buyer?.name || 'N/A'}</td>
                            <td>${parseFloat(payment.amount).toFixed(2)}</td>
                            <td>{getPaymentMethodIcon(payment.method)}</td>
                            <td>{getStatusBadge(payment.status)}</td>
                            <td>{new Date(payment.paid_at).toLocaleDateString()}</td>
                            <td>
                              <Button variant="outline-primary" size="sm">
                                View
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center py-4">
                            No payments found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="payouts" title="Payouts">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0">Seller Payouts</h5>
                <Button variant="primary" size="sm">
                  <CashStack className="me-1" /> Process Payouts
                </Button>
              </div>

              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Payout ID</th>
                      <th>Seller</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((payout) => (
                      <tr key={payout.id}>
                        <td>PY-{payout.id.toString().padStart(4, '0')}</td>
                        <td>{payout.seller?.name || 'N/A'}</td>
                        <td>${Number(payout.amount).toFixed(2)}</td>
                        <td>
                          {payout.status === 'paid' ? (
                            <span className="text-success">
                              <CheckCircleFill className="me-1" /> Paid
                            </span>
                          ) : (
                            <span className="text-warning">
                              <ClockFill className="me-1" /> Pending
                            </span>
                          )}
                        </td>
                        <td>{payout.date}</td>
                        <td>
                          {payout.status === 'pending' && (
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              onClick={() => handleManualPayout(payout)}
                            >
                              Mark as Paid
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Payout Confirmation Modal */}
      <Modal
        show={showPayoutModal}
        onHide={() => setShowPayoutModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Payout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPayout && (
            <div>
              <p>Are you sure you want to mark this payout as paid?</p>
              <p><strong>Seller:</strong> {selectedPayout.seller}</p>
              <p><strong>Amount:</strong> ${selectedPayout.amount.toFixed(2)}</p>
              <p className="text-muted">This action cannot be undone.</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowPayoutModal(false)}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={confirmPayout}
          >
            Confirm Payout
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminPayments;
