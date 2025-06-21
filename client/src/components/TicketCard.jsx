import React, { useState } from "react";
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';
import { useUser } from "../contexts/UserContext";
import { Row, Col } from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { Send } from "react-bootstrap-icons";
import { API_BASE_URL } from "../config";
import { useTranslation } from 'react-i18next';

function TicketCard({ ticket }) {
    const { t } = useTranslation('tickets');
    const [expanded, setExpanded] = useState(false);
    const [messages, setMessages] = useState([]);
    const { user } = useUser();
    const userId = user?.data?.id;

    async function handleClick() {
        if (!expanded) {
            const response = await fetch(`${API_BASE_URL}/ticket/ticktMessage?ticketId=${ticket.id}`);
            const data = await response.json();
            if (response.ok) setMessages(data);
        }
        setExpanded(prev => !prev);
    }

    async function handleSend(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        formData.append("ticketId", ticket.id);
        formData.append("senderId", userId);
        formData.append("senderType", user.data.role);

        const response = await fetch(`${API_BASE_URL}/ticket/addTicketMessage`, {
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

    async function handleClose(){
        const response = await fetch(`${API_BASE_URL}/ticket/closeticket?userId=${userId}&ticketId=${ticket.id}`);
        if(response.ok){
            window.location.reload();
        }
    }


    return (
        <Card className="mb-3">
            <Card.Header className="d-flex justify-content-between align-items-center">
                {t('ticket.category', { category: t(ticket.category) })}
                <div >
                    {ticket.status !== "closed" && <Button onClick={handleClose} variant="outline-danger" className="m-1">
                        {t('ticket.closeTicket')}
                    </Button>}

                    <Button onClick={handleClick} variant="outline-success">
                        {expanded ? t('ticket.hideMessages') : t('ticket.showMessages')}
                    </Button>
                </div>
            </Card.Header>
            <Card.Body>
                <Card.Title>{t('ticket.subject', { subject: ticket.subject })}</Card.Title>
                <Collapse in={expanded}>
                    <div>
                        {messages.map((message, i) => (
                            <Row key={i} className="mb-2">
                                <Col xs={12} className={`d-flex ${message.sender_id === userId ? 'justify-content-end' : 'justify-content-start'}`}>
                                    <div style={{
                                        maxWidth: "75%",
                                        backgroundColor: message.sender_id === userId ? "#0d6efd" : "#e9ecef",
                                        color: message.sender_id === userId ? "#fff" : "#000",
                                        borderRadius: "15px",
                                        padding: "10px 15px",
                                        position: "relative"
                                    }}>
                                        <div>{message.message}</div>
                                        <div style={{
                                            fontSize: "0.75rem",
                                            color: message.sender_id === userId ? "#cfe2ff" : "#6c757d",
                                            textAlign: "right",
                                            marginTop: "5px"
                                        }}>
                                            {new Date(message.created_at).toLocaleString()}
                                        </div>
                                        {message.attachment && (
                                            /\.(jpg|jpeg|png|gif|webp)$/i.test(message.attachment) && (
                                                <img src={message.attachment} alt="attachment" style={{ maxWidth: "200px" }} />
                                            )
                                        )}

                                    </div>
                                </Col>
                            </Row>

                        ))}
                        {ticket.status !== "closed" && <Form className="mt-3" onSubmit={handleSend}>
                            <Form.Group className="mb-3">
                                <Form.Label>{t('attachFile')}</Form.Label>
                                <Form.Control type="file" name="attachment" accept=".jpg,.jpeg,.png" />
                            </Form.Group>
                            <InputGroup>
                                <Form.Control name="message" as="textarea" aria-label="With textarea" style={{ resize: "none" }} rows={3} />
                                <Button variant="primary" type="submit"><Send /> {t('send')}</Button>
                            </InputGroup>

                        </Form>}
                    </div>
                </Collapse>
            </Card.Body>
        </Card>
    );
}

export default TicketCard;
