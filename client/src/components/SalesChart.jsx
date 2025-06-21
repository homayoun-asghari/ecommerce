import React, { useEffect, useState } from "react";
import {
    ResponsiveContainer, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";
import { useUser } from "../contexts/UserContext";
import { API_BASE_URL } from "../config";
import Card from 'react-bootstrap/Card';
import Col from "react-bootstrap/Col";
import { useTranslation } from 'react-i18next';

function SalesChart() {
    const { t, i18n } = useTranslation('salesChart');
    const [deliveredData, setDeliveredData] = useState([]);
    const [pendingData, setPendingData] = useState([]);
    const [totalSales, setTotalSales] = useState(0);
    const [summary, setSummary] = useState([]);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const year = new Date().getFullYear();
    const { user } = useUser();
    const userId = user?.data?.id;

    // Ensure months is always an array
    const getMonths = () => {
        try {
            const translatedMonths = t('months', { returnObjects: true });
            if (Array.isArray(translatedMonths) && translatedMonths.length === 12) {
                return translatedMonths;
            }
        } catch (e) {
            console.warn('Error loading translated months:', e);
        }
        // Fallback to English months
        return [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
    };
    
    const months = getMonths();

    useEffect(() => {
        async function fetchChartData() {
            setDeliveredData([]);
            setPendingData([]);
            setTotalSales(0);

            const res = await fetch(`${API_BASE_URL}/order/saleStats?userId=${userId}&month=${month}&year=${year}`);
            const raw = await res.json();

            if (res.ok) {
                const delivered = [];
                const pending = [];

                raw.daily.forEach(item => {
                    const entry = {
                        day: new Date(item.day).getDate(),
                        orders: item.order_count,
                        sales: Number(item.total_sales),
                    };

                    if (item.status === 'delivered') delivered.push(entry);
                    else if (item.status === 'pending') pending.push(entry);
                });

                setDeliveredData(delivered);
                setPendingData(pending);
                setTotalSales(delivered.reduce((sum, d) => sum + d.sales, 0));
                setSummary(raw.summary);
            }
        }
        if (userId) fetchChartData();
    }, [userId, month, year]);

    return (
        <>
            <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5>{t('totalSales')}: ${totalSales.toFixed(2)}</h5>
                    <select 
                        value={month} 
                        onChange={e => setMonth(Number(e.target.value))}
                        className="form-select form-select-sm"
                        style={{ width: 'auto' }}
                    >
                        {months && months.length > 0 ? (
                            months.map((name, i) => (
                                <option key={i} value={i + 1}>{name}</option>
                            ))
                        ) : (
                            <option value={month}>
                                {new Date(year, month - 1).toLocaleString(i18n.language, { month: 'long' })}
                            </option>
                        )}
                    </select>
                </Card.Header>
                <Card.Body>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" type="number" domain={[1, 31]} />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Line data={deliveredData} type="monotone" dataKey="orders" stroke="#28a745" name={t('deliveredOrders')} />
                            <Line data={pendingData} type="monotone" dataKey="orders" stroke="#ffc107" name={t('pendingOrders')} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card.Body>
            </Card>

            <div className="d-flex justify-content-between align-items-center gap-1 mt-3">
                <Col lg={6}>
                    <Card>
                        <Card.Header>{t('totalOrders')}</Card.Header>
                        <Card.Body>
                            <Card.Title>{summary.reduce((total, item) => total + Number(item.order_count), 0)}
                            </Card.Title>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={6}>
                    <Card >
                        <Card.Header>{t('totalSalesAmount')}</Card.Header>
                        <Card.Body>
                            <Card.Title>{summary.find(item => item.status === 'delivered')?.total_sales || 0} $</Card.Title>
                        </Card.Body>
                    </Card>
                </Col>
            </div>

            <div className="d-flex justify-content-between align-items-center gap-1 mt-3">
                <Col lg={3}>
                    <Card>
                        <Card.Header>{t('totalDelivered')}</Card.Header>
                        <Card.Body>
                            <Card.Title>{summary.find(item => item.status === 'delivered')?.order_count || 0}</Card.Title>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3}>
                    <Card >
                        <Card.Header>{t('totalShipped')}</Card.Header>
                        <Card.Body>
                            <Card.Title>{summary.find(item => item.status === 'shipped')?.order_count || 0}</Card.Title>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3}>
                    <Card>
                        <Card.Header>{t('totalPending')}</Card.Header>
                        <Card.Body>
                            <Card.Title>{summary.find(item => item.status === 'pending')?.order_count || 0}</Card.Title>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3}>
                    <Card >
                        <Card.Header>{t('totalCanceled')}</Card.Header>
                        <Card.Body>
                            <Card.Title>{summary.find(item => item.status === 'cancealed')?.order_count || 0}</Card.Title>
                        </Card.Body>
                    </Card>
                </Col>
            </div>

        </>
    );
}

export default SalesChart;
