import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { useUser } from "../contexts/UserContext.jsx";
import { API_BASE_URL } from '../config';
import { useTranslation } from 'react-i18next';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const { t } = useTranslation('sellerOrders');
  const userId = user?.data?.id;

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/order/sellerorders?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  if (loading) return <p>{t('loadingOrders')}</p>;
  if (error) return <p>{t('errorLoadingOrders', { error })}</p>;
  if (orders.length === 0) return <p>{t('noOrdersFound')}</p>;

  return (
    <>
      {orders.map(order => (
        <Card key={order.order_id} className='mb-3'>
          <Card.Header>{t('orderId', { id: order.order_id })}</Card.Header>
          <Card.Body>
            <Card.Text>{t('status', { status: order.status })}</Card.Text>
            <Card.Text>
              {t('date', { date: new Date(order.created_at).toLocaleString() })}
            </Card.Text>
            <Card.Text>{t('name', { name: order.buyer_name })}</Card.Text>
            <Card.Text>
              {t('address', {
                street: order.shipping_address.street,
                city: order.shipping_address.city,
                state: order.shipping_address.state,
                country: order.shipping_address.country,
                postalCode: order.shipping_address.postal_code
              })}
            </Card.Text>
            <Card.Text>{t('phone', { phone: order.shipping_address.phone })}</Card.Text>
            <Card.Text>{t('total', { total: order.total })}</Card.Text>
          </Card.Body>
        </Card>
      ))}
    </>
  );
};

export default SellerOrders;
