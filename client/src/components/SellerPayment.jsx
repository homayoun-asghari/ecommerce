import React, { useEffect, useState } from 'react';
import { ListGroup, Card } from 'react-bootstrap';
import { useUser } from "../contexts/UserContext.jsx"
import { API_BASE_URL } from "../config";

const SellerPayment = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useUser();
    const userId = user?.data?.id;

    useEffect(() => {
        const fetchPayments = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_BASE_URL}/payment?userId=${userId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch payments');
                }
                const data = await response.json();
                setPayments(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, [userId]);

    if (loading) return <p>Loading payments...</p>;
    if (error) return <p>Error: {error}</p>;
    if (payments.length === 0) return <p>No payments found.</p>;

    return (
        <>
            {payments.map(payment => (
                <Card className='mb-3'>
                    <Card.Header>Payment ID: {payment.id}</Card.Header>
                    <Card.Body>
                        <Card.Text>Order ID: {payment.order_id}</Card.Text>
                        <Card.Text>Amount: ${payment.amount}</Card.Text>
                        <Card.Text>Status: {payment.status}</Card.Text>
                        <Card.Text>Date: {new Date(payment.created_at).toLocaleString()}</Card.Text>
                    </Card.Body>
                </Card>
            ))}
        </>
    );
};

export default SellerPayment;
