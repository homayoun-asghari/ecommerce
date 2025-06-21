import React, { useEffect, useState } from "react";
import Nav from 'react-bootstrap/Nav';
import OrderCard from "./OrderCard";
import { useUser } from "../contexts/UserContext";
import { API_BASE_URL } from "../config";

function Orders() {
    const [activeTab, setActiveTab] = useState('pending');
    const [orders, setOrders] = useState([]);
    const { user } = useUser();
    const userId = user?.data?.id;

    useEffect(() => {
        async function getOrders() {
            const response = await fetch(`${API_BASE_URL}/order?userId=${userId}&status=${activeTab}`);
            const data = await response.json();
            setOrders(data);
        }
        getOrders();
    }, [userId, activeTab]);

    return (
        <div >
            <Nav variant="underline" activeKey={activeTab} onSelect={(selectedKey) => setActiveTab(selectedKey)} className="mb-3">
                <Nav.Item>
                    <Nav.Link eventKey="pending">Pending</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="shipped">Shipped</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="delivered">Delivered</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="cancelled">Cancelled</Nav.Link>
                </Nav.Item>
            </Nav>

            {orders.map(order => <OrderCard order={order}/>)}
        </div>

    );
}

export default Orders;