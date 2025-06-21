import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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
import { API_BASE_URL } from '../config';

const AdminProducts = () => {
    const { t, i18n } = useTranslation('adminProducts');
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

    const [categories, setCategories] = useState([]);
    const [sellers, setSellers] = useState([]);
    const statuses = ['pending', 'approved', 'rejected'];
    const [showViewModal, setShowViewModal] = useState(false);

    const handleView = (product) => {
        setSelectedProduct(product);
        setShowViewModal(true);
    };



    // Fetch products from API
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const queryParams = new URLSearchParams({
                    page: currentPage,
                    limit: itemsPerPage,
                    search: searchTerm,
                    category: filters.category === 'all' ? '' : filters.category,
                    seller: filters.seller === 'all' ? '' : filters.seller,
                    status: filters.status === 'all' ? '' : filters.status
                }).toString();

                const response = await fetch(`${API_BASE_URL}/admin/products?${queryParams}`);
                if (!response.ok) {
                    throw new Error(t('errors.fetchProducts'));
                }

                const data = await response.json();

                setProducts(data.products);
                setTotalPages(data.pagination.pages);

                // Update filters with server data if not already set
                if (data.filters) {
                    if (data.filters.categories && data.filters.categories.length > 0) {
                        setCategories(data.filters.categories);
                    }
                    if (data.filters.sellers && data.filters.sellers.length > 0) {
                        setSellers(data.filters.sellers);
                    }
                }
            } catch (error) {
                console.error('Error fetching products:', error);
                // Optionally show error to user
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            fetchProducts();
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [searchTerm, filters, currentPage, itemsPerPage, t]);

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
            if (action === 'delete') {
                const response = await fetch(`${API_BASE_URL}/admin/product/${selectedProduct.id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error('Failed to delete product');
                }

                // Remove the product from the list
                setProducts(products.filter(p => p.id !== selectedProduct.id));
            } else {
                const status = action === 'approve' ? 'approved' : 'rejected';
                const response = await fetch(`${API_BASE_URL}/admin/product/${selectedProduct.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status })
                });

                if (!response.ok) {
                    throw new Error(t(`errors.${action}Product`));
                }

                // Update the product status in the list
                setProducts(products.map(p =>
                    p.id === selectedProduct.id ? { ...p, status } : p
                ));
            }

            // Close the modal
            setShowApproveModal(false);
            setShowRejectModal(false);
            setShowDeleteModal(false);
            setSelectedProduct(null);

        } catch (error) {
            console.error(`Error ${action}ing product:`, error);
            // Optionally show error to user
        }
    };

    const getStatusBadge = useCallback((status) => {
        const variants = {
            pending: 'warning',
            approved: 'success',
            rejected: 'danger'
        };
        return <Badge bg={variants[status] || 'secondary'}>{t(`status.${status}`, status)}</Badge>;
    }, [t]);

    return (
        <div className="p-3">

            <Card className="mb-4">
                <Card.Header>
                    <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                        <div style={{ maxWidth: '300px' }}>
                            <InputGroup>
                                <InputGroup.Text><BsSearch /></InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder={t('search.placeholder')}
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
                                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                >
                                    <option value="all">{t('search.allCategories')}</option>
                                    {categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </Form.Select>
                            </div>

                            <div className="d-flex align-items-center gap-2">
                                <Form.Select
                                    size="sm"
                                    value={filters.seller}
                                    onChange={(e) => setFilters({ ...filters, seller: e.target.value })}
                                >
                                    <option value="all">{t('search.allSellers')}</option>
                                    {sellers.map(seller => (
                                        <option key={seller.id} value={seller.id}>{seller.name}</option>
                                    ))}

                                </Form.Select>
                            </div>

                            <div className="d-flex align-items-center gap-2">
                                <Form.Select
                                    size="sm"
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                >
                                    <option value="all">{t('search.allStatuses')}</option>
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
                                <span className="visually-hidden">{t('table.loading')}</span>
                            </Spinner>
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <Table hover className="align-middle">
                                    <thead>
                                        <tr>
                                            <th>{t('table.columns.product')}</th>
                                            <th>{t('table.columns.category')}</th>
                                            <th>{t('table.columns.seller')}</th>
                                            <th>{t('table.columns.price')}</th>
                                            <th>{t('table.columns.stock')}</th>
                                            <th>{t('table.columns.status')}</th>
                                            <th>{t('table.columns.dateAdded')}</th>
                                            <th>{t('table.columns.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product) => (
                                            <tr key={product.id}>
                                                <td className="text-nowrap">{product.name}</td>
                                                <td>{product.category}</td>
                                                <td>{product.seller_name}</td>
                                                <td>${product.price}</td>
                                                <td>{product.stock}</td>
                                                <td>{getStatusBadge(product.status)}</td>
                                                <td>{new Date(product.created_at).toLocaleDateString()}</td>
                                                <td>
                                                    <Dropdown>
                                                        <Dropdown.Toggle variant="light" size="sm" id="dropdown-basic">
                                                            <BsThreeDotsVertical />
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu>
                                                            <Dropdown.Item onClick={() => handleView(product)}>
                                                                <BsEye className="me-2" /> {t('table.actions.view')}
                                                            </Dropdown.Item>
                                                            {product.status !== 'approved' && (
                                                                <Dropdown.Item onClick={() => handleApprove(product)}>
                                                                    <BsCheckCircle className="me-2 text-success" /> {t('table.actions.approve')}
                                                                </Dropdown.Item>
                                                            )}
                                                            {product.status !== 'rejected' && (
                                                                <Dropdown.Item onClick={() => handleReject(product)}>
                                                                    <BsXCircle className="me-2 text-warning" /> {t('table.actions.reject')}
                                                                </Dropdown.Item>
                                                            )}
                                                            <Dropdown.Divider />
                                                            <Dropdown.Item
                                                                className="text-danger"
                                                                onClick={() => handleDelete(product)}
                                                            >
                                                                <BsTrash className="me-2" /> {t('table.actions.delete')}
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
                    <Modal.Title>{t('modals.approve.title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {t('modals.approve.message', { productName: selectedProduct?.name })}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowApproveModal(false)}>
                        {t('modals.approve.cancel')}
                    </Button>
                    <Button variant="success" onClick={() => confirmAction('approve')}>
                        {t('modals.approve.confirm')}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Reject Confirmation Modal */}
            <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{t('modals.reject.title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {t('modals.reject.message', { productName: selectedProduct?.name })}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
                        {t('modals.reject.cancel')}
                    </Button>
                    <Button variant="warning" onClick={() => confirmAction('reject')}>
                        {t('modals.reject.confirm')}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton className="bg-danger text-white">
                    <Modal.Title>{t('modals.delete.title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{t('modals.delete.message', { productName: selectedProduct?.name })}</p>
                    <p className="text-danger mb-0">{t('modals.delete.warning')}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        {t('modals.delete.cancel')}
                    </Button>
                    <Button variant="danger" onClick={() => confirmAction('delete')}>
                        {t('modals.delete.confirm')}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* View Product Modal */}
            <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{t('modals.view.title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedProduct ? (
                        <>
                            {selectedProduct.image_url && (
                                <img
                                    src={selectedProduct.image_url}
                                    alt={selectedProduct.name}
                                    style={{ width: '100%', marginBottom: '1rem', borderRadius: '4px' }}
                                />
                            )}
                            <p><strong>{t('modals.view.fields.name')}:</strong> {selectedProduct.name}</p>
                            <p><strong>{t('modals.view.fields.category')}:</strong> {selectedProduct.category}</p>
                            <p><strong>{t('modals.view.fields.seller')}:</strong> {selectedProduct.seller_name}</p>
                            <p><strong>{t('modals.view.fields.description')}:</strong> {selectedProduct.description}</p>
                            <p><strong>{t('modals.view.fields.price')}:</strong> ${selectedProduct.price}</p>
                            <p><strong>{t('modals.view.fields.stock')}:</strong> {selectedProduct.stock}</p>
                            <p><strong>{t('modals.view.fields.status')}:</strong> {t(`status.${selectedProduct.status}`, selectedProduct.status)}</p>
                            <p><strong>{t('modals.view.fields.dateAdded')}:</strong> {new Date(selectedProduct.created_at).toLocaleDateString(i18n.language)}</p>
                        </>
                    ) : (
                        <p>{t('modals.view.noProduct')}</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowViewModal(false)}>
                        {t('modals.view.close')}
                    </Button>
                </Modal.Footer>
            </Modal>


        </div>
    );
};

export default AdminProducts;
