import React, { useEffect, useState } from 'react';
import { ListGroup, Card, Button } from 'react-bootstrap';
import { useUser } from "../contexts/UserContext.jsx"

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const userId = user?.data?.id;

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:5050/order/sellerorders?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        console.log(data);
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p>Error: {error}</p>;
  if (orders.length === 0) return <p>No orders found for this seller.</p>;

  return (
    <>
      {orders.map(order => (
        <Card className='mb-3'>
          <Card.Header>Order ID: {order.order_id}</Card.Header>
          <Card.Body>
            <Card.Text>Status: {order.status}</Card.Text>
            <Card.Text>
              Date: {new Date(order.created_at).toLocaleString()}
            </Card.Text>
            <Card.Text>Name: {order.buyer_name}</Card.Text>
            <Card.Text>Address: {order.shipping_address.street}  {order.shipping_address.city} {order.shipping_address.state} {order.shipping_address.country} {order.shipping_address.postal_code} {order.shipping_address.phone}</Card.Text>
            <Card.Text>Total: ${order.total}</Card.Text>
          </Card.Body>
        </Card>
      ))}
    </>
  );
};

export default SellerOrders;
