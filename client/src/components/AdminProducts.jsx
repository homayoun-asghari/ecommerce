import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Badge, 
  Form, 
  InputGroup, 
  Modal,
  Dropdown,
  Pagination,
  Spinner
} from 'react-bootstrap';
import { 
  BsSearch, 
  BsFilterLeft, 
  BsThreeDotsVertical,
  BsCheckCircle,
  BsXCircle,
  BsTrash,
  BsEye
} from 'react-icons/bs';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    seller: 'all',
    status: 'all'
  });
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Mock categories and sellers (in real app, these would come from an API)
  const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Other'];
  const sellers = ['Seller 1', 'Seller 2', 'Seller 3'];
  const statuses = ['pending', 'approved', 'rejected'];

  // Fetch products (mocked for now)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an actual API call
        // const response = await fetch(`http://localhost:5050/admin/products?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}&category=${filters.category}&seller=${filters.seller}&status=${filters.status}`);
        // const data = await response.json();
        
        // Mock response
        const mockProducts = Array(8).fill().map((_, i) => ({
          id: i + 1,
          name: `Product ${i + 1}`,
          category: categories[Math.floor(Math.random() * categories.length)],
          seller: sellers[Math.floor(Math.random() * sellers.length)],
          price: (Math.random() * 1000).toFixed(2),
          status: statuses[Math.floor(Math.random() * statuses.length)],
          stock: Math.floor(Math.random() * 100),
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
        }));
        
        setProducts(mockProducts);
        setTotalPages(3); // Mock total pages
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, filters, currentPage]);

  const handleApprove = async (product) => {
    setSelectedProduct(product);
    setShowApproveModal(true);
  };

  const handleReject = async (product) => {
    setSelectedProduct(product);
    setShowRejectModal(true);
  };

  const handleDelete = async (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const confirmAction = async (action) => {
    if (!selectedProduct) return;
    
    try {
      // In a real app, this would be an actual API call
      // const response = await fetch(`http://localhost:5050/admin/products/${selectedProduct.id}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ action })
      // });
      // const data = await response.json();
      
      // Update local state to reflect the change
      setProducts(products.map(p => 
        p.id === selectedProduct.id 
          ? { ...p, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : p.status }
          : p
      ));
      
      // Close the modal
      setShowApproveModal(false);
      setShowRejectModal(false);
      setShowDeleteModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error(`Error ${action}ing product:`, error);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div className="p-3">
      <h2 className="mb-4">Product Management</h2>
      
      <Card className="mb-4">
        <Card.Header>
          <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
            <div style={{ maxWidth: '300px' }}>
              <InputGroup>
                <InputGroup.Text><BsSearch /></InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </div>
            
            <div className="d-flex flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2">
                <BsFilterLeft size={20} />
                <Form.Select
                  size="sm"
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Form.Select>
              </div>
              
              <div className="d-flex align-items-center gap-2">
                <Form.Select
                  size="sm"
                  value={filters.seller}
                  onChange={(e) => setFilters({...filters, seller: e.target.value})}
                >
                  <option value="all">All Sellers</option>
                  {sellers.map(seller => (
                    <option key={seller} value={seller}>{seller}</option>
                  ))}
                </Form.Select>
              </div>
              
              <div className="d-flex align-items-center gap-2">
                <Form.Select
                  size="sm"
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                  <option value="all">All Statuses</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </Form.Select>
              </div>
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
                      <th>Product</th>
                      <th>Category</th>
                      <th>Seller</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Date Added</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="text-nowrap">{product.name}</td>
                        <td>{product.category}</td>
                        <td>{product.seller}</td>
                        <td>${product.price}</td>
                        <td>{product.stock}</td>
                        <td>{getStatusBadge(product.status)}</td>
                        <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Dropdown>
                            <Dropdown.Toggle variant="light" size="sm" id="dropdown-basic">
                              <BsThreeDotsVertical />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item onClick={() => {}}>
                                <BsEye className="me-2" /> View
                              </Dropdown.Item>
                              {product.status !== 'approved' && (
                                <Dropdown.Item onClick={() => handleApprove(product)}>
                                  <BsCheckCircle className="me-2 text-success" /> Approve
                                </Dropdown.Item>
                              )}
                              {product.status !== 'rejected' && (
                                <Dropdown.Item onClick={() => handleReject(product)}>
                                  <BsXCircle className="me-2 text-warning" /> Reject
                                </Dropdown.Item>
                              )}
                              <Dropdown.Divider />
                              <Dropdown.Item 
                                className="text-danger" 
                                onClick={() => handleDelete(product)}
                              >
                                <BsTrash className="me-2" /> Delete
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              
              <div className="d-flex justify-content-center mt-4">
                <Pagination>
                  <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
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
            </>
          )}
        </Card.Body>
      </Card>

      {/* Approve Confirmation Modal */}
      <Modal show={showApproveModal} onHide={() => setShowApproveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Approve Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to approve <strong>{selectedProduct?.name}</strong>? This will make it visible to all users.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApproveModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={() => confirmAction('approve')}>
            Approve
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reject Confirmation Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to reject <strong>{selectedProduct?.name}</strong>? The seller will be notified.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={() => confirmAction('reject')}>
            Reject
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Delete Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete <strong>{selectedProduct?.name}</strong>? This action cannot be undone.</p>
          <p className="text-danger mb-0">All product data including images will be permanently removed.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => confirmAction('delete')}>
            Delete Permanently
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminProducts;
