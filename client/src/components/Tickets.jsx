import React, { useState, useEffect } from "react";
import Nav from 'react-bootstrap/Nav';
import TicketCard from "./TicketCard";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useUser } from "../contexts/UserContext";

function Tickets() {
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

        const response = await fetch(`http://localhost:5050/ticket/addTicket`, {
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
            const response = await fetch(`http://localhost:5050/ticket?userId=${userId}&status=${activeTab}`);
            const data = await response.json();
            if (response.ok) {
                setTickets(data);
            }
        }
        fetchTickets();
    }, [userId, activeTab]);

    useEffect(() => {
            async function getOrders() {
                const response = await fetch(`http://localhost:5050/order?userId=${userId}`);
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
                        <Nav.Link eventKey="open">Open</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="pending">Pending</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="resolved">Resolved</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="closed">Closed</Nav.Link>
                    </Nav.Item>
                </Nav>

                <Button variant="primary" onClick={handleShow}>Add New Ticket</Button>

                <Modal show={show} onHide={handleClose} centered >
                    <Modal.Header closeButton>
                        <Modal.Title>Add New Ticket</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Category</Form.Label>
                                <Form.Select name="category" value={category} onChange={(e) => setCategory(e.target.value)} required>
                                    <option value="">Select Category</option>
                                    <option value="order">Order</option>
                                    <option value="payment">Payment</option>
                                    <option value="account">Account</option>
                                    <option value="technical">Technical</option>
                                    <option value="other">Other</option>
                                </Form.Select>
                            </Form.Group>
                            {category === "order" && (
                                <Form.Group className="mb-3">
                                    <Form.Label>Select Related Order</Form.Label>
                                    <Form.Select name="order_id">
                                        <option value="">Select an order</option>
                                        {orders.map(order => (
                                            <option key={order.order_id} value={order.order_id}>Order #{order.order_id}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            )}

                            <Form.Group className="mb-3">
                                <Form.Label>Subject</Form.Label>
                                <Form.Control type="text" name="subject" required />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Message</Form.Label>
                                <Form.Control as="textarea" rows={3} name="message" required />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Attach File (jpg | jpeg | png, optional)</Form.Label>
                                <Form.Control type="file" name="attachment" accept=".jpg,.jpeg,.png" />
                            </Form.Group>

                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleClose}>
                                    Cancel
                                </Button>
                                <Button variant="primary" type="submit">
                                    Send
                                </Button>
                            </Modal.Footer>
                        </Form>
                    </Modal.Body>
                </Modal>
            </div>

            {tickets.map(ticket => <TicketCard ticket={ticket} />)}

        </div>
    );
}

export default Tickets;