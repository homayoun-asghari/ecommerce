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
  CheckCircleFill,
  ClockFill
} from 'react-bootstrap-icons';
import { API_BASE_URL } from '../config';

// API base URL for admin endpoints
const ADMIN_API_URL = `${API_BASE_URL}/admin`;



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
  const fetchPayments = useCallback(async (page = 1, filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page,
        limit: pagination.limit,
        ...filters
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
  const fetchPayouts = useCallback(async (page = 1, filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page,
        limit: pagination.limit,
        ...filters
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

  // Fetch payments and payouts data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (activeTab === 'payments') {
          await fetchPayments(pagination.page);
        } else {
          await fetchPayouts(pagination.page);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [activeTab, pagination.page, fetchPayments, fetchPayouts]);
  
  // Reset filters when tab changes
  useEffect(() => {
    setSellerFilter('all');
    setStatusFilter('all');
    setDateRange({ start: '', end: '' });
  }, [activeTab]);

  // Filter data based on active tab and filters
  const filteredData = useMemo(() => {
    const data = activeTab === 'payments' ? [...payments] : [...payouts];
    let result = [...data];

    if (sellerFilter !== 'all') {
      result = result.filter(item => {
        // Handle both direct seller_id and nested seller object
        const sellerId = activeTab === 'payments' 
          ? (item.seller?.id || item.seller_id)
          : (item.seller?.id || item.seller_id);
        return sellerId?.toString() === sellerFilter;
      });
    }

    if (statusFilter !== 'all') {
      result = result.filter(item => item.status === statusFilter);
    }

    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      startDate.setHours(0, 0, 0, 0);
      result = result.filter(item => {
        const itemDate = new Date(activeTab === 'payments' ? item.paidAt || item.paid_at : item.createdAt || item.created_at);
        return itemDate >= startDate;
      });
    }

    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      result = result.filter(item => {
        const itemDate = new Date(activeTab === 'payments' ? item.paidAt || item.paid_at : item.createdAt || item.created_at);
        return itemDate <= endDate;
      });
    }

    return result;
  }, [sellerFilter, statusFilter, dateRange, payments, payouts, activeTab]);
  
  // For backward compatibility
  const filteredPayments = activeTab === 'payments' ? filteredData : [];
  const filteredPayouts = activeTab === 'payouts' ? filteredData : [];

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

  // Handle export to CSV
  const handleExport = () => {
    try {
      const dataToExport = activeTab === 'payments' ? payments : payouts;
      if (dataToExport.length === 0) {
        alert('No data to export');
        return;
      }
      
      // Format data for CSV
      let csvContent = '';
      const headers = [];
      
      // Get headers from first item
      if (dataToExport.length > 0) {
        const firstItem = dataToExport[0];
        headers.push(...Object.keys(firstItem).filter(key => key !== 'seller' && key !== 'buyer'));
        
        // Add seller/buyer details if available
        if (firstItem.seller) headers.push('seller_name', 'seller_email');
        if (firstItem.buyer) headers.push('buyer_name', 'buyer_email');
        
        csvContent += headers.join(',') + '\n';
        
        // Add rows
        dataToExport.forEach(item => {
          const row = [];
          
          // Add main fields
          headers.forEach(header => {
            if (header === 'seller_name' && item.seller) {
              row.push(`"${item.seller.name || ''}"`);
            } else if (header === 'seller_email' && item.seller) {
              row.push(`"${item.seller.email || ''}"`);
            } else if (header === 'buyer_name' && item.buyer) {
              row.push(`"${item.buyer.name || ''}"`);
            } else if (header === 'buyer_email' && item.buyer) {
              row.push(`"${item.buyer.email || ''}"`);
            } else if (header in item) {
              // Escape quotes and wrap in quotes
              const value = String(item[header]).replace(/"/g, '""');
              row.push(`"${value}"`);
            } else {
              row.push('');
            }
          });
          
          csvContent += row.join(',') + '\n';
        });
      }
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${activeTab}_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data');
    }
  };

  // Handle manual payout
  const handleManualPayout = (payout) => {
    setSelectedPayout(payout);
    setShowPayoutModal(true);
  };

  const confirmPayout = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${ADMIN_API_URL}/payouts/${selectedPayout.id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${yourAuthToken}`
        },
        body: JSON.stringify({ status: 'paid' })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update payout status');
      }
      
      await response.json();
      
      // Update local state with the updated payout
      setPayouts(payouts.map(p => 
        p.id === selectedPayout.id ? { ...p, status: 'paid', updatedAt: new Date().toISOString() } : p
      ));
      
      setShowPayoutModal(false);
      setSelectedPayout(null);
      
    } catch (error) {
      console.error('Error updating payout status:', error);
      alert(error.message || 'Failed to update payout status');
    } finally {
      setLoading(false);
    }
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

  // Generate seller options from both payments and payouts data
  const sellerOptions = useMemo(() => {
    // Get unique seller IDs from both payments and payouts
    const paymentSellers = payments
      .filter(p => p.seller?.id || p.seller_id)
      .map(p => ({
        id: p.seller?.id || p.seller_id,
        name: p.seller?.name || `Seller ${p.seller_id}`,
        email: p.seller?.email || ''
      }));
      
    const payoutSellers = payouts
      .filter(p => p.seller?.id || p.seller_id)
      .map(p => ({
        id: p.seller?.id || p.seller_id,
        name: p.seller?.name || `Seller ${p.seller_id}`,
        email: p.seller?.email || ''
      }));
    
    // Combine and dedupe
    const allSellers = [...paymentSellers, ...payoutSellers].reduce((acc, seller) => {
      if (seller.id && !acc.some(s => s.id === seller.id)) {
        acc.push(seller);
      }
      return acc;
    }, []);
    
    // Create options
    const options = allSellers.map(seller => ({
      value: seller.id.toString(),
      label: seller.email ? `${seller.name} (${seller.email})` : seller.name
    }));
    
    // Sort alphabetically by name
    options.sort((a, b) => a.label.localeCompare(b.label));
    
    return [{ value: 'all', label: 'All Sellers' }, ...options];
  }, [payments, payouts]);

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
          <Button 
            variant="outline-primary" 
            className="ms-2"
            onClick={handleExport}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner as="span" size="sm" animation="border" role="status" aria-hidden="true" className="me-1" />
                Exporting...
              </>
            ) : (
              'Export'
            )}
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
                            <td>{payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : 'N/A'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center py-4">
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
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
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
              <div className="mb-4">
                <h5>Seller Payouts</h5>
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
                    {filteredPayouts.length > 0 ? (
                      filteredPayouts.map((payout) => (
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
                          <td>{payout.createdAt ? new Date(payout.createdAt).toLocaleDateString() : 'N/A'}</td>
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
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          No payouts found
                        </td>
                      </tr>
                    )}
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
              <p><strong>Seller:</strong> {selectedPayout.seller?.name || 'N/A'}</p>
              <p><strong>Amount:</strong> ${Number(selectedPayout.amount || 0).toFixed(2)}</p>
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
