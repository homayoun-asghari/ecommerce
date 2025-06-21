import React, { useEffect, useState } from 'react';
import { Card, Badge, ListGroup, Accordion } from 'react-bootstrap';
import { useUser } from "../contexts/UserContext.jsx";
import { API_BASE_URL } from "../config";
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

// Styled components
const StatusBadge = styled(Badge)`
  font-size: 0.9rem;
  padding: 0.5em 0.8em;
  margin-left: 0.5em;
`;

const OrderCard = styled(Card)`
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s ease-in-out;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const OrderHeader = styled(Card.Header)`
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
`;

const OrderItem = styled(ListGroup.Item)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.25rem;
  border-left: none;
  border-right: none;
  
  &:first-child {
    border-top: none;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemDetails = styled.div`
  flex: 1;
`;

const ItemPrice = styled.div`
  font-weight: 600;
`;

const OrderTotal = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  text-align: right;
  margin-top: 1rem;
`;

const formatDate = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

const getStatusVariant = (status) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'cancelled':
      return 'danger';
    case 'shipped':
      return 'info';
    default:
      return 'secondary';
  }
};

const SellerPayment = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useUser();
    const { t } = useTranslation('sellerPayment');
    const userId = user?.data?.id;
    const [activeKey, setActiveKey] = useState(null);

    useEffect(() => {
        const fetchPayments = async () => {
            if (!userId) return;
            
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_BASE_URL}/payment?userId=${userId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch payments');
                }
                const data = await response.json();
                setPayments(data);
                // Set the first order as active by default if available
                if (data.length > 0) {
                    setActiveKey(`order-${data[0].id}`);
                }
            } catch (err) {
                console.error('Error fetching payments:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, [userId]);

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">{t('loading')}</span></div></div>;
    if (error) return <div className="alert alert-danger">{t('errorLoadingPayments', { error })}</div>;
    if (payments.length === 0) return <div className="alert alert-info">{t('noPaymentsFound')}</div>;

    return (
        <div className="seller-payments">
            <h2 className="mb-4">{t('paymentHistory')}</h2>
            <Accordion activeKey={activeKey} onSelect={(key) => setActiveKey(key)}>
                {payments.map((payment) => (
                    <OrderCard key={payment.id} className="mb-3">
                        <Accordion.Item eventKey={`order-${payment.id}`} className="border-0">
                            <OrderHeader>
                                <div className="d-flex align-items-center">
                                    <span className="me-3">
                                        {t('paymentId', { id: payment.id })} ({t('orderId', { id: payment.order_id })})
                                    </span>
                                    <StatusBadge bg={getStatusVariant(payment.status)}>
                                        {t(`status.${payment.status.toLowerCase()}`, t('status.default'))}
                                    </StatusBadge>
                                </div>
                                <div className="text-muted small">
                                    {formatDate(payment.created_at)}
                                </div>
                            </OrderHeader>
                            <Accordion.Body className="p-0">
                                <ListGroup variant="flush">
                                    {payment.items && payment.items.map((item, index) => (
                                        <OrderItem key={index}>
                                            <ItemDetails>
                                                <div className="fw-medium">{item.product_name}</div>
                                                <div className="small">
                                                    {t('quantity', { 
                                                        quantity: item.quantity, 
                                                        price: item.price.toFixed(2) 
                                                    })}
                                                </div>
                                            </ItemDetails>
                                            <ItemPrice>
                                                ${(item.quantity * item.price).toFixed(2)}
                                            </ItemPrice>
                                        </OrderItem>
                                    ))}
                                    <div className="p-3">
                                        <OrderTotal>
                                            {t('paymentAmount', { amount: parseFloat(payment.amount).toFixed(2) })}
                                        </OrderTotal>
                                    </div>
                                </ListGroup>
                            </Accordion.Body>
                        </Accordion.Item>
                    </OrderCard>
                ))}
            </Accordion>
        </div>
    );
};

export default SellerPayment;
