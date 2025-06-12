import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Form, 
  InputGroup, 
  Badge, 
  Dropdown, 
  Modal,
  Alert,
  Spinner,
  Tabs,
  Tab
} from 'react-bootstrap';
import { 
  Funnel, 
  FunnelFill, 
  CashStack, 
  ArrowClockwise,
  Funnel as FunnelIcon,
  Download,
  ThreeDotsVertical,
  CheckCircleFill,
  XCircleFill,
  ClockFill
} from 'react-bootstrap-icons';

// Mock data - replace with real API calls
const mockPayments = [
  {
    id: 'PAY-001',
    order_id: 'ORD-1001',
    seller: { id: 1, name: 'Tech Store' },
    amount: 149.99,
    status: 'completed',
    method: 'credit_card',
    paid_at: '2025-06-10T14:30:00Z',
    created_at: '2025-06-10T14:30:00Z',
    payout_status: 'pending'
  },
  {
    id: 'PAY-002',
    order_id: 'ORD-1002',
    seller: { id: 2, name: 'Fashion Hub' },
    amount: 89.50,
    status: 'completed',
    method: 'paypal',
    paid_at: '2025-06-09T10:15:00Z',
    created_at: '2025-06-09T10:15:00Z',
    payout_status: 'paid'
  },
  {
    id: 'PAY-003',
    order_id: 'ORD-1003',
    seller: { id: 1, name: 'Tech Store' },
    amount: 210.00,
    status: 'refunded',
    method: 'credit_card',
    paid_at: '2025-06-08T16:45:00Z',
    created_at: '2025-06-08T16:45:00Z',
    payout_status: 'refunded'
  },
];

const mockSellers = [
  { id: 1, name: 'Tech Store' },
  { id: 2, name: 'Fashion Hub' },
  { id: 3, name: 'Home & Living' },
  { id: 4, name: 'Electronics Pro' },
];

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('payments');
  
  // Filter states
  const [sellerFilter, setSellerFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  // Payout states
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [payouts, setPayouts] = useState([
    { id: 1, seller: 'Tech Store', amount: 149.99, status: 'pending', date: '2025-06-10' },
    { id: 2, seller: 'Fashion Hub', amount: 89.50, status: 'paid', date: '2025-06-09' },
  ]);

  // Fetch payments (mock for now)
  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('http://localhost:5050/admin/payments');
        // const data = await response.json();
        // setPayments(data);
        // setFilteredPayments(data);
        
        // Mock data for now
        setPayments(mockPayments);
        setFilteredPayments(mockPayments);
      } catch (err) {
        setError('Failed to load payments');
        console.error('Error fetching payments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...payments];

    if (sellerFilter !== 'all') {
      result = result.filter(p => p.seller.id.toString() === sellerFilter);
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

    setFilteredPayments(result);
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

  const getPaymentMethodIcon = (method) => {
    const icons = {
      credit_card: '💳',
      paypal: '🔵 PayPal',
      bank_transfer: '🏦',
      stripe: '💳 Stripe'
    };

    return icons[method] || method;
  };

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
            {showFilters ? <FunnelFill className="me-1" /> : <Funnel className="me-1" />}
            {showFilters ? 'Hide Filters' : 'Filters'}
          </Button>
          <Button variant="outline-primary">
            <Download className="me-1" /> Export
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
                <div className="bg-light p-3 rounded mb-4">
                  <div className="row g-3">
                    <div className="col-md-3">
                      <Form.Group>
                        <Form.Label>Seller</Form.Label>
                        <Form.Select 
                          value={sellerFilter}
                          onChange={(e) => setSellerFilter(e.target.value)}
                        >
                          <option value="all">All Sellers</option>
                          {mockSellers.map(seller => (
                            <option key={seller.id} value={seller.id}>
                              {seller.name}
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
                        <th>Seller</th>
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
                            <td>{payment.order_id}</td>
                            <td>{payment.seller?.name || 'N/A'}</td>
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
                        <td>{payout.seller}</td>
                        <td>${payout.amount.toFixed(2)}</td>
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
