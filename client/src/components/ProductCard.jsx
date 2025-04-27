import React, { useState } from "react";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import { Cart, Heart } from "react-bootstrap-icons";
import Badge from 'react-bootstrap/Badge';
import Rating from '@mui/material/Rating';


function ProductCard({ product }) {
    const { id, name, description, price, stock, category, image_url, discount, avg_rating, review_count } = product;
    console.log("ProductCard", product);
    const [count, setCount] = useState(0);

    function handleIncrement() {
        if (count < stock) setCount(count + 1);
    }

    function handleDecrement() {
        if (count > 0) {
            setCount(count - 1);
        }
    }

    function letterCont(str, num) {
        return str.slice(0, num) + " ...";
    }

    const letterLimit = 15;
    return (
        <Row className='d-flex justify-content-center align-items-center gap-5'>
            <Link to={`/product/${id}`} state={{ count }} style={{ textDecoration: "none" }}>
                <Col className='d-flex justify-content-center align-items-center'>
                    <Card style={{ width: '18rem' }}>
                        <Card>
                            <Card.Img variant="top" src={image_url} style={{ height: "200px", objectFit: "cover" }} />
                            <Card.ImgOverlay className="d-flex justify-content-between align-items-start">
                                {discount > 0 && (
                                    <Badge bg="danger">{discount}%</Badge>
                                )}
                                <Badge bg="success">{letterCont(category, letterLimit)}</Badge>
                            </Card.ImgOverlay>
                        </Card>
                        <Card.Body>
                            <div className="d-flex justify-content-end mb-2">
                                <Link to="/shop" className="btn btn-outline-danger">
                                    <Heart size={24} />
                                </Link>
                            </div>
                            <Card.Title>{letterCont(name, letterLimit)}</Card.Title>
                            <Card.Text>{letterCont(description, letterLimit)}</Card.Text>
                            <div className="d-flex flex-row justify-content-start align-items-center gap-2">
                                <Rating
                                    name="read-only"
                                    value={avg_rating || 0}
                                    precision={0.5}
                                    readOnly
                                    sx={{
                                        '& .MuiRating-iconEmpty': {
                                            color: 'lightgray',
                                        },
                                        '& .MuiRating-iconFilled': {
                                            color: 'gold',
                                        }
                                    }}
                                />
                                <Badge bg="light" text="dark">{review_count} reviews</Badge>
                            </div>
                            <Card.Text className="text-muted">{(price - (price * discount / 100)).toFixed(2)}&nbsp;&nbsp;&nbsp;{discount > 0 && (
                                <span style={{ textDecoration: "line-through" }}>{price}</span>
                            )}</Card.Text>
                            <Link to="/shop" className="btn btn-outline-success px-5"><Cart size={24} /></Link>
                            <Link onClick={handleDecrement} style={{ width: "35px" }} className="btn btn-outline-primary m-1">-</Link>
                            <Link className="btn btn-outline-primary" style={{ cursor: "default" }}>{count}</Link>
                            <Link onClick={handleIncrement} style={{ width: "35px" }} className="btn btn-outline-primary m-1">+</Link>
                        </Card.Body>
                    </Card>
                </Col>
            </Link>
        </Row>
    );
}

export default ProductCard;