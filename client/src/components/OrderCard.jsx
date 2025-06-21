import React, { useState } from "react";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Collapse from 'react-bootstrap/Collapse';
import { Rating } from '@mui/material';
import Form from 'react-bootstrap/Form';
import { useUser } from "../contexts/UserContext";
import { Link } from 'react-router-dom';
import { API_BASE_URL } from "../config";
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

function OrderCard({ order }) {
    const { t } = useTranslation(['orders', 'common']);
    const { user } = useUser();
    const userId = user?.data?.id;
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [comments, setComments] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleDetails = (orderId) => {
        setExpandedOrderId(prev => (prev === orderId ? null : orderId));
    };

    async function handleReview(event, productId) {
        event.preventDefault();
        setIsSubmitting(true);
        try {
            const formData = new FormData(event.target);
            const formDataObj = Object.fromEntries(formData.entries());
            
            const response = await fetch(
                `${API_BASE_URL}/review/updatereview?userId=${userId}&productId=${productId}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formDataObj)
                }
            );

            if (response.ok) {
                toast.success(t('review.submitted'));
            } else {
                const error = await response.json();
                throw new Error(error.message || t('common:error.submitFailed'));
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error(error.message || t('common:error.unknown'));
        } finally {
            setIsSubmitting(false);
        }
    }

    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'PPp');
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
        }
    };

    const getStatusVariant = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered':
                return 'success';
            case 'shipped':
                return 'primary';
            case 'cancelled':
                return 'danger';
            case 'pending':
                return 'warning';
            default:
                return 'secondary';
        }
    };

    if (!order) return null;

    return (
        <Card key={order.order_id} className="mb-4 border-0 shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <div>
                    <span className="fw-bold me-2">{t('order.orderNumber', { orderNumber: order.order_id })}</span>
                    <Badge bg={getStatusVariant(order.status)} className="text-capitalize">
                        {t(`status.${order.status?.toLowerCase()}`) || order.status}
                    </Badge>
                    <div className="text-muted small mt-1">
                        {t('order.date', { date: formatDate(order.createdAt || order.order_date) })}
                    </div>
                </div>
                <Button
                    variant={expandedOrderId === order.order_id ? 'outline-primary' : 'primary'}
                    onClick={() => toggleDetails(order.order_id)}
                    size="sm"
                >
                    {expandedOrderId === order.order_id 
                        ? t('common:hideDetails') 
                        : t('common:viewDetails')}
                </Button>
            </Card.Header>

                {/* Preview thumbnails */}
                {expandedOrderId !== order.order_id && (
                    <Card.Body className="d-flex gap-3 flex-wrap">
                        {order.products?.map((product, idx) => (
                            <div key={`${product.product_id || idx}`}>
                                <Card className="position-relative" style={{ width: "100px" }}>
                                    <Card.Img
                                        variant="top"
                                        src={product.image_url}
                                        style={{ height: "100px", objectFit: "cover" }}
                                        alt={product.name}
                                    />
                                    <Badge
                                        bg="dark"
                                        className="position-absolute top-0 start-0 m-1"
                                    >
                                        {product.quantity}
                                    </Badge>
                                </Card>
                            </div>
                        ))}
                    </Card.Body>
                )}

                {/* Expandable section with animation */}
                <Collapse in={expandedOrderId === order.order_id}>
                    <div>
                        <Card.Body>
                            {order.products?.map((product, idx) => (
                                <div key={`${product.product_id || idx}`} style={{ marginBottom: "1rem" }}>
                                    <Card.Title>{product.name}</Card.Title>
                                    <Card.Text>
                                        {t('order.quantity')}: {product.quantity} <br />
                                        {t('order.price')}: ${product.price} <br />
                                        <img 
                                            src={product.image_url} 
                                            alt={product.name} 
                                            style={{ width: "100px", height: "100px", objectFit: "cover" }} 
                                            className="my-2"
                                        />
                                        <Form onSubmit={(e) => handleReview(e, product.product_id)}>
                                            <div className="mb-2">
                                                <Rating
                                                    name="rating"
                                                    defaultValue={product.rating}
                                                    precision={0.5}
                                                    sx={{
                                                        '& .MuiRating-iconEmpty': {
                                                            color: 'lightgray',
                                                        },
                                                        '& .MuiRating-iconFilled': {
                                                            color: 'gold',
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <Form.Group className="mb-3">
                                                <Form.Label>{t('order.writeReview')}</Form.Label>
                                                <Form.Control 
                                                    name="comment" 
                                                    as="textarea" 
                                                    rows={3} 
                                                    value={comments[product.product_id] ?? product.comment ?? ""} 
                                                    onChange={(e) => setComments(prev => ({ ...prev, [product.product_id]: e.target.value }))} 
                                                />
                                            </Form.Group>
                                            <div className="d-flex gap-2">
                                                <Button 
                                                    variant="primary" 
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                            {t('common:actions.submitting')}...
                                                        </>
                                                    ) : t('common:actions.submit')}
                                                </Button>
                                                <Link 
                                                    className="btn btn-outline-primary" 
                                                    to={`/product/${product.product_id}`}
                                                >
                                                    {t('order.viewProduct')}
                                                </Link>
                                            </div>
                                        </Form>
                                    </Card.Text>
                                    {idx < order.products.length - 1 && <hr className="my-4" />}
                                </div>
                            ))}
                        </Card.Body>
                    </div>
                </Collapse>
            </Card>
    );
}

export default OrderCard;
