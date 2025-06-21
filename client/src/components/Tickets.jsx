import React, { useState, useEffect } from "react";
import Nav from 'react-bootstrap/Nav';
import TicketCard from "./TicketCard";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useUser } from "../contexts/UserContext";
import { API_BASE_URL } from "../config";
import { useTranslation } from 'react-i18next';

function Tickets() {
    const { t } = useTranslation('tickets');
    const [activeTab, setActiveTab] = useState('open');
    const [category, setCategory] = useState("");
    const [tickets, setTickets] = useState([]);
    const [orders, setOrders] = useState([]);
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const { user } = useUser();
    const userId = user?.data?.id;

    async function handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        formData.append("userId", userId);
        formData.append("userRole", user.data.role);

        const response = await fetch(`${API_BASE_URL}/ticket/addTicket`, {
            method: "POST",
            body: formData,
        });
        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            window.location.reload();
        } else {
            alert(data.error);
        }
    }

    useEffect(() => {
        async function fetchTickets() {
            const response = await fetch(`${API_BASE_URL}/ticket?userId=${userId}&status=${activeTab}`);
            const data = await response.json();
            if (response.ok) {
                setTickets(data);
            }
        }
        fetchTickets();
    }, [userId, activeTab]);

    useEffect(() => {
            async function getOrders() {
                const response = await fetch(`${API_BASE_URL}/order?userId=${userId}`);
                const data = await response.json();
                setOrders(data);
            }
            getOrders();
        }, [userId]);

    return (
        <div>
            <div className="d-flex justify-content-between mb-3">
                <Nav variant="underline" activeKey={activeTab} onSelect={(selectedKey) => setActiveTab(selectedKey)}>
                    <Nav.Item>
                        <Nav.Link eventKey="open">{t('tabs.open')}</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="pending">{t('tabs.pending')}</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="resolved">{t('tabs.resolved')}</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="closed">{t('tabs.closed')}</Nav.Link>
                    </Nav.Item>
                </Nav>

                <Button variant="primary" onClick={handleShow}>{t('addNewTicket')}</Button>

                <Modal show={show} onHide={handleClose} centered >
                    <Modal.Header closeButton>
                        <Modal.Title>{t('addNewTicket')}</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>{t('category')}</Form.Label>
                                <Form.Select name="category" value={category} onChange={(e) => setCategory(e.target.value)} required>
                                    <option value="">{t('selectCategory')}</option>
                                    <option value="order">{t('order')}</option>
                                    <option value="payment">{t('payment')}</option>
                                    <option value="account">{t('account')}</option>
                                    <option value="technical">{t('technical')}</option>
                                    <option value="other">{t('other')}</option>
                                </Form.Select>
                            </Form.Group>
                            {category === "order" && (
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('selectRelatedOrder')}</Form.Label>
                                    <Form.Select name="order_id">
                                        <option value="">{t('selectAnOrder')}</option>
                                        {orders.map(order => (
                                            <option key={order.order_id} value={order.order_id}>{t('orderNumber', { number: order.order_id })}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            )}

                            <Form.Group className="mb-3">
                                <Form.Label>{t('subject')}</Form.Label>
                                <Form.Control type="text" name="subject" required />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>{t('message')}</Form.Label>
                                <Form.Control as="textarea" rows={3} name="message" required />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>{t('attachFile')}</Form.Label>
                                <Form.Control type="file" name="attachment" accept=".jpg,.jpeg,.png" />
                            </Form.Group>

                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleClose}>
                                    {t('cancel')}
                                </Button>
                                <Button variant="primary" type="submit">
                                    {t('send')}
                                </Button>
                            </Modal.Footer>
                        </Form>
                    </Modal.Body>
                </Modal>
            </div>

            {tickets.map((ticket, index) => <TicketCard key={index} ticket={ticket} />)}

        </div>
    );
}

export default Tickets;