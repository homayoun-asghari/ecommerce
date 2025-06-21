import React, { useState, useEffect, useCallback } from 'react';
import { Card } from 'react-bootstrap';
import AdminSalesChart from './AdminSalesChart';
import { API_BASE_URL } from '../config';
import { useTranslation } from 'react-i18next';

const AdminDashboard = () => {
    const { t } = useTranslation('adminDashboard');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch dashboard overview data
    useEffect(() => {
        const fetchOverview = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/admin/overview`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || t('errors.fetchOverview'));
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
    }, [t]); // Added t as a dependency

    // Memoized function to fetch monthly orders
    const fetchMonthlyOrdersMemoized = useCallback(async (month) => {
        try {
            const url = new URL(`${API_BASE_URL}/admin/monthly-orders`);
            if (month) {
                url.searchParams.append('month', month);
            }

            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || t('errors.fetchMonthlyOrders'));
            }
            return await response.json();
        } catch (err) {
            console.error('Error in fetchMonthlyOrders:', err);
            setError(err.message);
            return [];
        }
    }, [t]);

    useEffect(() => {
        const fetchMonthlyOrdersData = async () => {
            const monthlyOrders = await fetchMonthlyOrdersMemoized();
            setData(prev => ({ ...prev, ordersPerMonth: monthlyOrders }));
        };

        fetchMonthlyOrdersData();
    }, [fetchMonthlyOrdersMemoized]);

    if (loading) return <div>{t('loading')}</div>;
    if (error) return <div>{t('errorLoading', { error })}</div>;
    if (!data) return <div>{t('noDataAvailable')}</div>;

    return (
        <div className="p-3">

            <div className="mb-4">
                <AdminSalesChart />
            </div>

            <div className="row g-4 mb-4">
                {/* Users Card */}
                <div className="col-md-6 col-lg-3">
                    <Card style={{ height: "10rem" }}>
                        <Card.Header>{t('cards.users.title')}</Card.Header>
                        <Card.Body>
                            <Card.Text>
                                {t('cards.users.total', { count: data.users.total || 0 })} <br />
                                {t('cards.users.buyers', { count: data.users.buyers || 0 })} <br />
                                {t('cards.users.sellers', { count: data.users.sellers || 0 })}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </div>

                {/* Products Card */}
                <div className="col-md-6 col-lg-3">
                    <Card style={{ height: "10rem" }}>
                        <Card.Header>{t('cards.products.title')}</Card.Header>
                        <Card.Body>
                            <Card.Text>{t('cards.products.total', { count: data.products || 0 })}</Card.Text>
                        </Card.Body>
                    </Card>
                </div>

                {/* Orders Card */}
                <div className="col-md-6 col-lg-3">
                    <Card style={{ height: "10rem" }}>
                        <Card.Header>{t('cards.orders.title')}</Card.Header>
                        <Card.Body>
                            <Card.Text>
                                {t('cards.orders.total', { count: data.orders.total || 0 })} <br />
                                {t('cards.orders.revenue', { amount: (data.orders.revenue || 0).toFixed(2) })}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </div>

                {/* Pending Items Card */}
                <div className="col-md-6 col-lg-3">
                    <Card style={{ height: "10rem" }}>
                        <Card.Header>{t('cards.pending.title')}</Card.Header>
                        <Card.Body>
                            <Card.Text>
                                {t('cards.pending.tickets', { count: data.pending.tickets || 0 })} <br />
                                {t('cards.pending.reviews', { count: data.pending.reviews || 0 })}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;