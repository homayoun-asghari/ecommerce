// client/src/components/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import AdminSalesChart from './AdminSalesChart';

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch dashboard overview data
    useEffect(() => {
        const fetchOverview = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:5050/admin/overview');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch overview data');
                }
                const result = await response.json();
                setData(prev => ({ ...prev, ...result }));
                setError(null);
            } catch (err) {
                console.error('Error in fetchOverview:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOverview();
    }, []);

    // Function to fetch monthly orders
    const fetchMonthlyOrders = async (month) => {
        try {
            const url = new URL('http://localhost:5050/admin/monthly-orders');
            if (month) {
                url.searchParams.append('month', month);
            }

            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch monthly orders');
            }
            return await response.json();
        } catch (err) {
            console.error('Error in fetchMonthlyOrders:', err);
            setError(err.message);
            return [];
        }
    };

    useEffect(() => {
        const fetchMonthlyOrdersData = async () => {
            const monthlyOrders = await fetchMonthlyOrders();
            setData(prev => ({ ...prev, ordersPerMonth: monthlyOrders }));
        };

        fetchMonthlyOrdersData();
    }, []);

    if (loading) return <div>Loading dashboard...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!data) return <div>No data available</div>;

    return (
        <div className="p-3">

            <div className="mb-4">
                <AdminSalesChart />
            </div>

            <div className="row g-4 mb-4">
                {/* Users Card */}
                <div className="col-md-6 col-lg-3">
                    <Card style={{ height: "10rem" }}>
                        <Card.Header>Users</Card.Header>
                        <Card.Body>
                            <Card.Text>
                                Total: {data.users.total || 0} <br />
                                Buyers: {data.users.buyers || 0} <br />
                                Sellers: {data.users.sellers || 0}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </div>

                {/* Products Card */}
                <div className="col-md-6 col-lg-3">
                    <Card style={{ height: "10rem" }}>
                        <Card.Header>Products</Card.Header>
                        <Card.Body>
                            <Card.Text>Total: {data.products || 0}</Card.Text>
                        </Card.Body>
                    </Card>
                </div>

                {/* Orders Card */}
                <div className="col-md-6 col-lg-3">
                    <Card style={{ height: "10rem" }}>
                        <Card.Header>Orders</Card.Header>
                        <Card.Body>
                            <Card.Text>
                                Total: {data.orders.total || 0} <br />
                                Revenue: ${(data.orders.revenue || 0).toFixed(2)}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </div>

                {/* Pending Items Card */}
                <div className="col-md-6 col-lg-3">
                    <Card style={{ height: "10rem" }}>
                        <Card.Header>Pending</Card.Header>
                        <Card.Body>
                            <Card.Text>
                                Tickets: {data.pending.tickets || 0} <br />
                                Reviews: {data.pending.reviews || 0}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;