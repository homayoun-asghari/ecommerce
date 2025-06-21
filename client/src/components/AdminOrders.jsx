import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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
import { API_BASE_URL } from '../config';

const AdminOrders = () => {
    const { t, i18n } = useTranslation('adminOrders');
    
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
        { value: 'all', label: t('search.allStatuses') },
        ...availableStatuses.map(status => ({
            value: status,
            label: t(`status.${status}`, status.charAt(0).toUpperCase() + status.slice(1))
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

            const response = await fetch(`${API_BASE_URL}/admin/orders?${params}`);

            if (!response.ok) {
                throw new Error(t('errors.fetchOrders'));
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
            setError(err.message || t('errors.fetchOrders'));
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
            const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`);

            if (!response.ok) {
                throw new Error(t('errors.fetchOrderDetails'));
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
                {t(`status.${status}`, status)}
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
            setError(t('errors.loadOrderDetails'));
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
            const response = await fetch(`${API_BASE_URL}/admin/orders/${selectedOrder.id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: editingStatus })
            });

            if (!response.ok) {
                throw new Error(t('errors.updateOrderStatus'));
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
                                    placeholder={t('search.placeholder')}
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
                                <span className="visually-hidden">{t('table.loading')}</span>
                            </Spinner>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover className="align-middle">
                                <thead>
                                    <tr>
                                        <th>{t('table.columns.orderNumber')}</th>
                                        <th>{t('table.columns.buyer')}</th>
                                        <th>{t('table.columns.seller')}</th>
                                        <th>{t('table.columns.items')}</th>
                                        <th>{t('table.columns.total')}</th>
                                        <th>{t('table.columns.status')}</th>
                                        <th>{t('table.columns.date')}</th>
                                        <th>{t('table.columns.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.length > 0 ? (
                                        orders.map((order) => (
                                            <tr key={order.id}>
                                                <td className="fw-semibold">{order.id}</td>
                                                <td>
                                                    <div className="d-flex flex-column">
                                                        <span>{order.buyer?.name || 'N/A'}</span>
                                                        <small className="text-muted">{order.buyer?.email || 'N/A'}</small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex flex-column">
                                                        <span>{order.seller?.name || 'N/A'}</span>
                                                        <small className="text-muted">{order.seller?.email || 'N/A'}</small>
                                                    </div>
                                                </td>
                                                <td>{t('table.itemsCount', { count: order.item_count || 0 })}</td>
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
                                                        <BsEye className="me-1" /> {t('table.viewButton')}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center py-4">
                                                {t('table.noOrders')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Order Details Modal */}
            <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {t('modals.orderDetails.title', { orderNumber: selectedOrder?.order_number || '' })}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedOrder && (
                        <div>
                            <div className="d-flex justify-content-between mb-4">
                                <div>
                                    <h6 className="fw-bold mb-2">{t('modals.orderDetails.orderInfo')}</h6>
                                    <p className="mb-1">
                                        <span className="text-muted">{t('modals.orderDetails.date')}: </span>
                                        {formatDate(selectedOrder.created_at)}
                                    </p>
                                    <div className="mb-3">
                                        <div className="d-flex align-items-center">
                                            <span className="text-muted me-2">{t('modals.orderDetails.status')}: </span>
                                            <Form.Select
                                                size="sm"
                                                className="w-auto me-2"
                                                value={editingStatus || ''}
                                                onChange={(e) => setEditingStatus(e.target.value)}
                                                disabled={loading}
                                            >
                                                {availableStatuses.map(status => (
                                                    <option key={status} value={status}>
                                                        {t(`status.${status}`, status.charAt(0).toUpperCase() + status.slice(1))}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </div>
                                    </div>
                                    <p className="mb-1">
                                        <span className="text-muted">{t('modals.orderDetails.total')}: </span>
                                        <strong>${Number(selectedOrder.total || 0).toFixed(2)}</strong>
                                    </p>
                                </div>
                                <div className="text-end">
                                    <h6 className="fw-bold mb-2">{t('modals.orderDetails.buyerInfo')}</h6>
                                    <p className="mb-1">{selectedOrder.buyer?.name || 'N/A'}</p>
                                    <p className="mb-1 text-muted">{selectedOrder.buyer?.email || 'N/A'}</p>

                                    {selectedOrder.items?.[0]?.seller && (
                                        <>
                                            <h6 className="fw-bold mt-3 mb-2">{t('modals.orderDetails.sellerInfo')}</h6>
                                            <p className="mb-1">{selectedOrder.items[0].seller.name}</p>
                                            <p className="mb-1 text-muted">{selectedOrder.items[0].seller.email}</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <h6 className="fw-bold mb-3">{t('modals.orderDetails.orderItems')}</h6>
                            <Table bordered hover className="mb-4">
                                <thead>
                                    <tr>
                                        <th>{t('modals.orderDetails.product')}</th>
                                        <th className="text-end">{t('modals.orderDetails.price')}</th>
                                        <th className="text-end">{t('modals.orderDetails.quantity')}</th>
                                        <th className="text-end">{t('modals.orderDetails.subtotal')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.items?.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.product_name || t('modals.orderDetails.product')}</td>
                                            <td className="text-end">${Number(item.price || 0).toFixed(2)}</td>
                                            <td className="text-end">{item.quantity}</td>
                                            <td className="text-end fw-semibold">
                                                ${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="table-light">
                                        <td colSpan="3" className="text-end fw-bold">{t('modals.orderDetails.total')}</td>
                                        <td className="text-end fw-bold">${Number(selectedOrder.total || 0).toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </Table>

                            <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                                <div>
                                    <Button variant="outline-secondary" size="sm" className="me-2">
                                        <BsTruck className="me-1" /> {t('modals.orderDetails.trackOrder')}
                                    </Button>
                                    <Button variant="outline-secondary" size="sm">
                                        <BsCurrencyDollar className="me-1" /> {t('modals.orderDetails.refund')}
                                    </Button>
                                </div>
                                <div>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={handleStatusUpdateClick}
                                        disabled={loading || !editingStatus || editingStatus === selectedOrder?.status}
                                    >
                                        {loading ? t('modals.orderDetails.updating') : t('modals.orderDetails.updateStatus')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetails(false)}>
                        {t('modals.orderDetails.close')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminOrders;
