// client/src/components/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Card, ListGroup, ProgressBar, Row, Col } from 'react-bootstrap';
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
      <h3 className="mb-4">Admin Dashboard</h3>
      
      <div className="row g-4 mb-4">
        {/* Users Card */}
        <div className="col-md-6 col-lg-3">
          <Card>
            <Card.Body>
              <Card.Title>Users</Card.Title>
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
          <Card>
            <Card.Body>
              <Card.Title>Products</Card.Title>
              <Card.Text>Total: {data.products || 0}</Card.Text>
            </Card.Body>
          </Card>
        </div>

        {/* Orders Card */}
        <div className="col-md-6 col-lg-3">
          <Card>
            <Card.Body>
              <Card.Title>Orders</Card.Title>
              <Card.Text>
                Total: {data.orders.total || 0} <br />
                Revenue: ${(data.orders.revenue || 0).toFixed(2)}
              </Card.Text>
            </Card.Body>
          </Card>
        </div>

        {/* Pending Items Card */}
        <div className="col-md-6 col-lg-3">
          <Card>
            <Card.Body>
              <Card.Title>Pending</Card.Title>
              <Card.Text>
                Tickets: {data.pending.tickets || 0} <br />
                Reviews: {data.pending.reviews || 0}
              </Card.Text>
            </Card.Body>
          </Card>
        </div>
      </div>

      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>Orders Per Month</Card.Header>
            <Card.Body>
              {data.ordersPerMonth && data.ordersPerMonth.length > 0 ? (
                data.ordersPerMonth.map((item, idx) => (
                  <div key={idx} className="mb-2">
                    <strong>{item.month || 'N/A'}:</strong>
                    <ProgressBar now={item.count || 0} label={item.count || 0} />
                  </div>
                ))
              ) : (
                <p>No order data available</p>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>Monthly Overview</Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>Total Orders: {data.orders?.total || 0}</ListGroup.Item>
                <ListGroup.Item>Total Revenue: ${(data.orders?.revenue || 0).toFixed(2)}</ListGroup.Item>
                <ListGroup.Item>Pending Tickets: {data.pending?.tickets || 0}</ListGroup.Item>
                <ListGroup.Item>Pending Reviews: {data.pending?.reviews || 0}</ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="mt-4">
        <h4>Sales Trends</h4>
        <AdminSalesChart fetchMonthlyOrders={fetchMonthlyOrders} />
      </div>
    </div>
  );
};

export default AdminDashboard;