import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Badge, 
  Button, 
  Form, 
  InputGroup, 
  Modal,
  Pagination,
  Spinner
} from 'react-bootstrap';
import { 
  BsSearch, 
  BsFilterLeft, 
  BsEye,
  BsBox,
  BsTruck,
  BsCheckCircle,
  BsXCircle,
  BsCurrencyDollar
} from 'react-icons/bs';

const AdminOrders = () => {
  // State for orders data and UI
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Available status filters
  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Mock data for demonstration
  const mockOrders = [
    {
      id: 1001,
      order_number: 'ORD-2023-001',
      buyer: { id: 1, name: 'John Doe', email: 'john@example.com' },
      seller: { id: 2, name: 'Tech Store', email: 'tech@example.com' },
      status: 'pending',
      total: 249.99,
      items: 3,
      created_at: new Date('2023-06-10T10:30:00').toISOString(),
      items_details: [
        { id: 1, name: 'Wireless Headphones', price: 99.99, quantity: 1 },
        { id: 2, name: 'Phone Case', price: 29.99, quantity: 2 }
      ]
    },
    {
      id: 1002,
      order_number: 'ORD-2023-002',
      buyer: { id: 3, name: 'Jane Smith', email: 'jane@example.com' },
      seller: { id: 4, name: 'Fashion Shop', email: 'fashion@example.com' },
      status: 'shipped',
      total: 129.50,
      items: 2,
      created_at: new Date('2023-06-09T14:15:00').toISOString(),
      items_details: [
        { id: 3, name: 'T-Shirt', price: 24.99, quantity: 1 },
        { id: 4, name: 'Jeans', price: 59.99, quantity: 1 },
        { id: 5, name: 'Belt', price: 19.99, quantity: 1 }
      ]
    },
    {
      id: 1003,
      order_number: 'ORD-2023-003',
      buyer: { id: 1, name: 'John Doe', email: 'john@example.com' },
      seller: { id: 5, name: 'Book Store', email: 'books@example.com' },
      status: 'delivered',
      total: 87.50,
      items: 4,
      created_at: new Date('2023-06-08T09:45:00').toISOString(),
      items_details: [
        { id: 6, name: 'Programming Book', price: 39.99, quantity: 1 },
        { id: 7, name: 'Notebook', price: 9.99, quantity: 3 }
      ]
    },
    {
      id: 1004,
      order_number: 'ORD-2023-004',
      buyer: { id: 3, name: 'Jane Smith', email: 'jane@example.com' },
      seller: { id: 2, name: 'Tech Store', email: 'tech@example.com' },
      status: 'cancelled',
      total: 199.99,
      items: 1,
      created_at: new Date('2023-06-07T16:20:00').toISOString(),
      items_details: [
        { id: 8, name: 'Smart Watch', price: 199.99, quantity: 1 }
      ]
    },
    {
      id: 1005,
      order_number: 'ORD-2023-005',
      buyer: { id: 6, name: 'Mike Johnson', email: 'mike@example.com' },
      seller: { id: 4, name: 'Fashion Shop', email: 'fashion@example.com' },
      status: 'processing',
      total: 149.95,
      items: 2,
      created_at: new Date('2023-06-06T11:10:00').toISOString(),
      items_details: [
        { id: 9, name: 'Running Shoes', price: 89.99, quantity: 1 },
        { id: 10, name: 'Socks', price: 12.99, quantity: 2 }
      ]
    }
  ];

  // Simulate API call to fetch orders
  useEffect(() => {
    const fetchOrders = () => {
      setLoading(true);
      
      // Simulate API delay
      setTimeout(() => {
        // Apply filters
        let filteredOrders = [...mockOrders];
        
        // Apply search filter
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          filteredOrders = filteredOrders.filter(order => 
            order.order_number.toLowerCase().includes(searchLower) ||
            order.buyer.name.toLowerCase().includes(searchLower) ||
            order.buyer.email.toLowerCase().includes(searchLower) ||
            order.seller.name.toLowerCase().includes(searchLower)
          );
        }
        
        // Apply status filter
        if (statusFilter !== 'all') {
          filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
        }
        
        // Apply pagination
        const total = filteredOrders.length;
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);
        
        setOrders(paginatedOrders);
        setTotalPages(Math.ceil(total / itemsPerPage));
        setLoading(false);
      }, 500);
    };
    
    fetchOrders();
  }, [searchTerm, statusFilter, currentPage]);

  // Get status badge variant
  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      processing: 'info',
      shipped: 'primary',
      delivered: 'success',
      cancelled: 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const icons = {
      pending: <BsBox className="me-1" />,
      processing: <BsBox className="me-1" />,
      shipped: <BsTruck className="me-1" />,
      delivered: <BsCheckCircle className="me-1" />,
      cancelled: <BsXCircle className="me-1" />
    };
    return icons[status] || <BsBox className="me-1" />;
  };

  return (
    <div className="p-3">
      <h2 className="mb-4">Order Management</h2>
      
      <Card className="mb-4">
        <Card.Header>
          <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
            <div style={{ maxWidth: '300px' }}>
              <InputGroup>
                <InputGroup.Text><BsSearch /></InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page when searching
                  }}
                />
              </InputGroup>
            </div>
            
            <div className="d-flex align-items-center gap-2">
              <BsFilterLeft size={20} />
              <Form.Select
                style={{ minWidth: '180px' }}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1); // Reset to first page when filter changes
                }}
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </Form.Select>
            </div>
          </div>
        </Card.Header>
        
        <Card.Body>
          {loading ? (
            <div className="text-center my-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover className="align-middle">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Buyer</th>
                      <th>Seller</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length > 0 ? (
                      orders.map((order) => (
                        <tr key={order.id}>
                          <td className="fw-semibold">{order.order_number}</td>
                          <td>
                            <div className="d-flex flex-column">
                              <span>{order.buyer.name}</span>
                              <small className="text-muted">{order.buyer.email}</small>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex flex-column">
                              <span>{order.seller.name}</span>
                              <small className="text-muted">{order.seller.email}</small>
                            </div>
                          </td>
                          <td>{order.items} item{order.items !== 1 ? 's' : ''}</td>
                          <td className="fw-semibold">${order.total.toFixed(2)}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              {getStatusIcon(order.status)}
                              {getStatusBadge(order.status)}
                            </div>
                          </td>
                          <td>{formatDate(order.created_at)}</td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowDetails(true);
                              }}
                            >
                              <BsEye className="me-1" /> View
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          No orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
              
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.First 
                      onClick={() => setCurrentPage(1)} 
                      disabled={currentPage === 1} 
                    />
                    <Pagination.Prev 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                      disabled={currentPage === 1} 
                    />
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      return (
                        <Pagination.Item 
                          key={page}
                          active={page === currentPage}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Pagination.Item>
                      );
                    })}
                    <Pagination.Next 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                      disabled={currentPage === totalPages} 
                    />
                    <Pagination.Last 
                      onClick={() => setCurrentPage(totalPages)} 
                      disabled={currentPage === totalPages} 
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Order Details Modal */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Order Details: {selectedOrder?.order_number}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div>
              <div className="d-flex justify-content-between mb-4">
                <div>
                  <h6 className="fw-bold mb-2">Order Information</h6>
                  <p className="mb-1">
                    <span className="text-muted">Date: </span>
                    {formatDate(selectedOrder.created_at)}
                  </p>
                  <p className="mb-1">
                    <span className="text-muted">Status: </span>
                    {getStatusBadge(selectedOrder.status)}
                  </p>
                  <p className="mb-1">
                    <span className="text-muted">Total: </span>
                    <strong>${selectedOrder.total.toFixed(2)}</strong>
                  </p>
                </div>
                <div className="text-end">
                  <h6 className="fw-bold mb-2">Buyer Information</h6>
                  <p className="mb-1">{selectedOrder.buyer.name}</p>
                  <p className="mb-1 text-muted">{selectedOrder.buyer.email}</p>
                  
                  <h6 className="fw-bold mt-3 mb-2">Seller Information</h6>
                  <p className="mb-1">{selectedOrder.seller.name}</p>
                  <p className="mb-1 text-muted">{selectedOrder.seller.email}</p>
                </div>
              </div>

              <h6 className="fw-bold mb-3">Order Items</h6>
              <Table bordered hover className="mb-4">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th className="text-end">Price</th>
                    <th className="text-end">Qty</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items_details.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td className="text-end">${item.price.toFixed(2)}</td>
                      <td className="text-end">{item.quantity}</td>
                      <td className="text-end fw-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="table-light">
                    <td colSpan="3" className="text-end fw-bold">Total</td>
                    <td className="text-end fw-bold">${selectedOrder.total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </Table>

              <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                <div>
                  <Button variant="outline-secondary" size="sm" className="me-2">
                    <BsTruck className="me-1" /> Track Order
                  </Button>
                  <Button variant="outline-secondary" size="sm">
                    <BsCurrencyDollar className="me-1" /> Refund
                  </Button>
                </div>
                <div>
                  <Button variant="primary" size="sm" className="ms-2">
                    Update Status
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminOrders;
