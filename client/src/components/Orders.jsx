import React, { useEffect, useState } from "react";
import Nav from 'react-bootstrap/Nav';
import OrderCard from "./OrderCard";
import { useUser } from "../contexts/UserContext";
import { API_BASE_URL } from "../config";
import { useTranslation } from 'react-i18next';
import { Spinner } from 'react-bootstrap';

function Orders() {
    const { t } = useTranslation('orders');
    const [activeTab, setActiveTab] = useState('pending');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();
    const userId = user?.data?.id;

    useEffect(() => {
        async function getOrders() {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/order?userId=${userId}&status=${activeTab}`);
                const data = await response.json();
                setOrders(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching orders:', error);
                setOrders([]);
            } finally {
                setLoading(false);
            }
        }
        
        if (userId) {
            getOrders();
        } else {
            setLoading(false);
        }
    }, [userId, activeTab]);

    const renderTabLinks = () => {
        const tabKeys = ['pending', 'shipped', 'delivered', 'cancelled'];
        return tabKeys.map((key) => (
            <Nav.Item key={key}>
                <Nav.Link eventKey={key}>{t(`tabs.${key}`)}</Nav.Link>
            </Nav.Item>
        ));
    };

    const renderOrderList = () => {
        if (loading) {
            return (
                <div className="text-center my-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            );
        }

        if (orders.length === 0) {
            return <div className="alert alert-info">{t('noOrders')}</div>;
        }

        return orders.map((order, index) => (
            <OrderCard key={`${order.id || index}`} order={order} />
        ));
    };

    return (
        <div className="orders-container">
            <Nav 
                variant="underline" 
                activeKey={activeTab} 
                onSelect={(selectedKey) => setActiveTab(selectedKey)} 
                className="mb-4"
            >
                {renderTabLinks()}
            </Nav>

            <div className="orders-list">
                {renderOrderList()}
            </div>
        </div>

    );
}

export default Orders;