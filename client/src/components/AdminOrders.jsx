import React, { useState, useEffect, useCallback } from 'react';
import {
    Card,
    Form,
    InputGroup,
    Table,
    Badge,
    Button,
    Modal,
    Pagination,
    Spinner,
    Alert
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
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [editingStatus, setEditingStatus] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage] = useState(10);
    const [availableStatuses, setAvailableStatuses] = useState([
        'pending', 'processing', 'shipped', 'delivered', 'cancelled'
    ]);

    // Generate status options for the filter dropdown
    const statuses = [
        { value: 'all', label: 'All Statuses' },
        ...availableStatuses.map(status => ({
            value: status,
            label: status.charAt(0).toUpperCase() + status.slice(1)
        }))
    ];

    // Fetch orders from API
    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                page: currentPage,
                limit: itemsPerPage,
                status: statusFilter === 'all' ? '' : statusFilter,
                search: searchTerm
            });

            const response = await fetch(`http://localhost:5050/admin/orders?${params}`);

            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }

            const data = await response.json();

            setOrders(data.orders || []);
            setTotalPages(data.pagination?.pages || 1);

            // Update available statuses if provided by the API
            if (data.filters?.statuses?.length) {
                setAvailableStatuses(prev => [...new Set([...prev, ...data.filters.statuses])]);
            }

        } catch (err) {
            console.error('Error fetching orders:', err);
            setError(err.message || 'Failed to load orders. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [currentPage, itemsPerPage, statusFilter, searchTerm]);

    // Fetch orders when filters or pagination changes
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);



    // Fetch order details
    const fetchOrderDetails = useCallback(async (orderId) => {
        try {
            const response = await fetch(`http://localhost:5050/admin/orders/${orderId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch order details');
            }

            return await response.json();
        } catch (err) {
            console.error('Error fetching order details:', err);
            throw err;
        }
    }, []);

    // Get status badge variant
    const getStatusBadge = (status) => {
        const variants = {
            pending: 'warning',
            processing: 'info',
            shipped: 'primary',
            delivered: 'success',
            cancelled: 'danger'
        };
        return (
            <Badge bg={variants[status] || 'secondary'} className="text-capitalize">
                {status}
            </Badge>
        );
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString; // Return as is if parsing fails
        }
    };

    // Handle view order details
    const handleViewOrder = useCallback(async (order) => {
        try {
            setLoading(true);
            const orderDetails = await fetchOrderDetails(order.id);
            setSelectedOrder(orderDetails);
            setShowDetails(true);
        } catch (err) {
            setError('Failed to load order details');
        } finally {
            setLoading(false);
        }
    }, [fetchOrderDetails]);

    // Handle status update button click
    const handleStatusUpdateClick = useCallback(async () => {
        if (!selectedOrder || !editingStatus) return;

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`http://localhost:5050/admin/orders/${selectedOrder.id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: editingStatus })
            });

            if (!response.ok) {
                throw new Error('Failed to update order status');
            }

            // Update the selected order with new status
            setSelectedOrder(prev => ({
                ...prev,
                status: editingStatus
            }));

            // Refresh orders list
            await fetchOrders();
            return true;
        } catch (err) {
            console.error('Error updating order status:', err);
            setError(err.message || 'Failed to update order status');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [selectedOrder, editingStatus, fetchOrders]);

    // Set editing status when modal opens
    useEffect(() => {
        if (selectedOrder) {
            setEditingStatus(selectedOrder.status);
        }
    }, [selectedOrder]);

    // The status update functionality is now handled by handleStatusUpdateClick

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

    // Handle search with debounce
    const handleSearch = useCallback((e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page when searching
    }, []);

    // Handle status filter change
    const handleStatusChange = useCallback((e) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1); // Reset to first page when filter changes
    }, []);



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
                                    placeholder="Search orders..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="me-2"
                                    style={{ width: '250px' }}
                                    disabled={loading}
                                />
                            </InputGroup>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            <BsFilterLeft size={20} />
                            <Form.Select
                                value={statusFilter}
                                onChange={handleStatusChange}
                                className="me-2"
                                style={{ width: '180px' }}
                                disabled={loading}
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
                    {error && (
                        <Alert variant="danger" className="mt-3">
                            {error}
                        </Alert>
                    )}
                    {loading && orders.length === 0 ? (
                        <div className="text-center my-5">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading orders...</span>
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
                                                    <td className="fw-semibold">{order.id}</td>
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
                                                    <td>{order.item_count || 0} item{order.item_count !== 1 ? 's' : ''}</td>
                                                    <td className="fw-semibold">${Number(order.total || 0).toFixed(2)}</td>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            {getStatusIcon(order.status)}
                                                            {getStatusBadge(order.status)}
                                                        </div>
                                                    </td>
                                                    <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                                                    <td>
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() => handleViewOrder(order)}
                                                            disabled={loading}
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
                                    <div className="mb-3">
                                        <div className="d-flex align-items-center">
                                            <span className="text-muted me-2">Status: </span>
                                            <Form.Select
                                                size="sm"
                                                className="w-auto me-2"
                                                value={editingStatus || ''}
                                                onChange={(e) => setEditingStatus(e.target.value)}
                                                disabled={loading}
                                            >
                                                {availableStatuses.map(status => (
                                                    <option key={status} value={status}>
                                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                                    </option>
                                                ))}
                                            </Form.Select>

                                        </div>
                                    </div>
                                    <p className="mb-1">
                                        <span className="text-muted">Total: </span>
                                        <strong>${Number(selectedOrder.total || 0).toFixed(2)}</strong>
                                    </p>
                                </div>
                                <div className="text-end">
                                    <h6 className="fw-bold mb-2">Buyer Information</h6>
                                    <p className="mb-1">{selectedOrder.buyer.name}</p>
                                    <p className="mb-1 text-muted">{selectedOrder.buyer.email}</p>

                                    {selectedOrder.items?.[0]?.seller && (
                                        <>
                                            <h6 className="fw-bold mt-3 mb-2">Seller Information</h6>
                                            <p className="mb-1">{selectedOrder.items[0].seller.name}</p>
                                            <p className="mb-1 text-muted">{selectedOrder.items[0].seller.email}</p>
                                        </>
                                    )}
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
                                    {selectedOrder.items.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.product_name || 'Product'}</td>
                                            <td className="text-end">${Number(item.price || 0).toFixed(2)}</td>
                                            <td className="text-end">{item.quantity}</td>
                                            <td className="text-end fw-semibold">
                                                ${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="table-light">
                                        <td colSpan="3" className="text-end fw-bold">Total</td>
                                        <td className="text-end fw-bold">${Number(selectedOrder.total || 0).toFixed(2)}</td>
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
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={handleStatusUpdateClick}
                                        disabled={loading || !editingStatus || editingStatus === selectedOrder?.status}
                                    >
                                        {loading ? 'Updating...' : 'Update Status'}
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
