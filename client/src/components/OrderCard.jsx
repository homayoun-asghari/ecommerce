import React, { useState } from "react";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Collapse from 'react-bootstrap/Collapse';
import { Rating } from '@mui/material';
import Form from 'react-bootstrap/Form';
import { useUser } from "../contexts/UserContext";
import { Link } from 'react-router-dom';

function OrderCard({ order }) {
    const { user } = useUser();
    const userId = user?.data?.id;
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [comments, setComments] = useState({});

    const toggleDetails = (orderId) => {
        setExpandedOrderId(prev => (prev === orderId ? null : orderId));
    };

    async function handleReview(Event, productId) {
        Event.preventDefault();
        const formData = new FormData(Event.target);
        const formDataObj = Object.fromEntries(formData.entries());
        console.log(formDataObj);
        const response = await fetch(`http://localhost:5050/review/updatereview?userId=${userId}&productId=${productId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formDataObj)
        });

        if (response.ok) {
            alert("Review Posted");
        }
    }

    return (
        <>
            <Card key={order.order_id} className="mb-3">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <span>Order #{order.order_id}</span>
                    <Button
                        variant="primary"
                        onClick={() => toggleDetails(order.order_id)}
                    >
                        {expandedOrderId === order.order_id ? "Hide Details" : "View Details"}
                    </Button>
                </Card.Header>

                {/* Preview thumbnails */}
                {expandedOrderId !== order.order_id && (
                    <Card.Body className="d-flex gap-3 flex-wrap">
                        {order.products.map((product, idx) => (
                            <div key={idx}>
                                <Card className="position-relative" style={{ width: "100px" }}>
                                    <Card.Img
                                        variant="top"
                                        src={product.image_url}
                                        style={{ height: "100px", objectFit: "cover" }}
                                    />
                                    <Badge
                                        bg="dark"
                                        className="position-absolute top-0 start-0 m-1"
                                    >
                                        {product.quantity}
                                    </Badge>
                                </Card>
                            </div>
                        ))}
                    </Card.Body>
                )}

                {/* Expandable section with animation */}
                <Collapse in={expandedOrderId === order.order_id}>
                    <div>
                        <Card.Body>
                            {order.products.map((product, idx) => {
                                return (<div key={idx} style={{ marginBottom: "1rem" }}>
                                    <Card.Title>{product.name}</Card.Title>
                                    <Card.Text>
                                        Quantity: {product.quantity} <br />
                                        Price: ${product.price} <br />
                                        <img src={product.image_url} alt={product.name} style={{ width: "100px", height: "100px", objectFit: "cover" }} />
                                        <Form onSubmit={(e) => handleReview(e, product.product_id)}>
                                            <Rating
                                                name="rating"
                                                defaultValue={product.rating}
                                                precision={0.5}
                                                sx={{
                                                    '& .MuiRating-iconEmpty': {
                                                        color: 'lightgray',
                                                    },
                                                    '& .MuiRating-iconFilled': {
                                                        color: 'gold',
                                                    }
                                                }}
                                            />
                                            <Form.Group className="mb-3" >
                                                <Form.Label>Write Review</Form.Label>
                                                <Form.Control name="comment" as="textarea" rows={3} value={comments[product.product_id] ?? product.comment ?? ""} onChange={(e) => setComments(prev => ({ ...prev, [product.product_id]: e.target.value }))} />
                                            </Form.Group>
                                            <Button variant="primary" type="submit">
                                                Submit
                                            </Button>
                                            <Link className="btn btn-outline-primary m-3" style={{ cursor: "default" }} to={`/product/${product.product_id}`}> View Product</Link>
                                        </Form>
                                    </Card.Text>
                                    <hr />
                                </div>
                                )
                            })}
                        </Card.Body>
                    </div>
                </Collapse>
            </Card>
        </>
    );
}

export default OrderCard;
