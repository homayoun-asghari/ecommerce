import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Rating from '@mui/material/Rating';
import Badge from 'react-bootstrap/Badge';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import { Cart, Heart, Wallet, ShieldCheck, HeartFill } from "react-bootstrap-icons";
import IosShareIcon from '@mui/icons-material/IosShare';
import CompareIcon from '@mui/icons-material/Compare';
import Countdown from "../components/Countdown";
import ProductCard from "../components/ProductCard";
import { useCart } from "../contexts/CartContext";
import { useWishList } from "../contexts/WishListContext";
import { API_BASE_URL } from "../config";


function Product() {
    let id = useParams().id;
    id = Number(id);
    const [product, setProduct] = useState({});
    const [reviews, setReviews] = useState([]);
    const [related, setRelated] = useState([]);
    const { name, description, price, stock, category, image_url, discount, avg_rating, review_count } = product;
    const { wishList, addToWishList, removeFromWishList } = useWishList();
    const { addToCart, isInCart, increment, decrement, getQty } = useCart();

    useEffect(() => {
        async function fetchProduct() {
            try {
                const response = await fetch(`${API_BASE_URL}/product?id=${id}`);
                const data = await response.json();
                setProduct(data[0]);
            } catch (err) {
                console.error("Error fetching product:", err);
            }
        }
        if (id) {
            fetchProduct();
        }
    }, [id]);

    useEffect(() => {
        async function fetchReviews() {
            try {
                const response = await fetch(`${API_BASE_URL}/review?id=${id}`);
                const data = await response.json();
                setReviews(data);
            } catch (err) {
                console.error("Error fetching review:", err);
            }
        }
        if (id) {
            fetchReviews();
        }
    }, [id]);

    useEffect(() => {
        async function fetchRelated() {
            try {
                const response = await fetch(`${API_BASE_URL}/product/related?category=${category}`);
                const data = await response.json();
                setRelated(data);
            } catch (err) {
                console.error("Error fetching related:", err);
            }
        }
        if (category) {
            fetchRelated();
        }
    }, [category]);

    function handleClick() {
        const find = wishList.some(item => item.id === id);
        if (find) {
            removeFromWishList(id);
        } else {
            addToWishList(id);
        }
    }


    return (
        <Row className="d-flex justify-content-center align-items-center gap-5">
            <Row>
                <Col lg={6} md={12} className="d-flex flex-column justify-content-center align-items-center gap-3">
                    <Card style={{ width: "100%" }}>
                        <Card.Img variant="top" src={image_url} style={{ width: "100%", height: "500px", objectFit: "cover" }} />
                        <Card.ImgOverlay className="d-flex justify-content-between align-items-start">
                            {discount > 0 && (
                                <Badge bg="danger">{discount}%</Badge>
                            )}
                            <Badge bg="success">{category}</Badge>
                        </Card.ImgOverlay>
                    </Card>
                </Col>
                <Col lg={6} md={12} className="d-flex flex-column justify-content-center align-items-start gap-3">
                    <h1>{name}</h1>
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
                    <p>{description}</p>
                    <p className="text-muted">{(price - (price * discount / 100)).toFixed(2)}&nbsp;&nbsp;&nbsp;{discount > 0 && (
                        <span style={{ textDecoration: "line-through" }}>{price}</span>
                    )}</p>

                    {discount > 0 && <div className="w-100 d-flex flex-column justify-content-center align-items-center  especial-offers-card py-3 rounded">
                        <h6 className="text-nowrap">Special Offers: </h6><Countdown />
                    </div>}

                    {!isInCart(product.id) ? (
                        <Link className="btn btn-outline-success" onClick={() => addToCart(product)}><Cart size={24} /> Add To Cart</Link>
                    ) : (
                        <div className="qty-controls">
                            <Link className="btn btn-outline-success" onClick={() => decrement(product.id)}>-</Link>
                            <Link className="btn btn-outline-success" style={{ cursor: "default" }}>{getQty(product.id)}</Link>
                            <Link className="btn btn-outline-success" onClick={() => getQty(id) < stock && increment(id)}>+</Link>
                        </div>
                    )}

                    <div>
                        <Card body ><Wallet size={24} /> <span style={{ fontWeight: "bold" }}>Payment.</span> Payment upon receipt of goods, Payment by card in the department, Google Pay,
                            Online card, -5% discount in case of payment</Card>

                        <Card body ><ShieldCheck size={24} /> <span style={{ fontWeight: "bold" }}>Warranty.</span> The Consumer Protection Act does not provide for the return of this product of proper
                            quality.</Card>
                    </div>

                    <div className="d-flex flex-row justify-content-center align-items-center gap-1">
                        <Link onClick={handleClick} className="btn btn-outline-danger text-nowrap">{wishList.some(item => item.id === id) === true ? <HeartFill size={24} /> : <Heart size={24} />} Add To Wish List</Link>
                        <Link to="/shop" className="btn btn-outline-primary text-nowrap"><IosShareIcon size={24} /> Share</Link>
                        <Link to="/shop" className="btn btn-outline-primary text-nowrap"><CompareIcon size={24} /> Compare</Link>
                    </div>

                </Col>
            </Row>

            <Row className="py-5">
                <Col>
                    <h5 style={{ marginBottom: "0px", padding: "var(--space-xs) 0" }}>Reviews({reviews.length}) </h5>
                    {reviews.map((review) => {
                        return (
                            <div key={review.id}>
                                <p style={{ marginBottom: "0px" }}>{review.username}:</p>
                                <Rating
                                    name="read-only"
                                    value={review.rating || 0}
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
                                <p className="py-3 border-bottom"> {review.comment}</p>
                            </div>
                        );
                    })}

                </Col>
            </Row>

            {related.length > 0 && <Row className="py-5">
                <div>
                    <h5 style={{ marginBottom: "0px", padding: "var(--space-xs) 0" }}>Related Products</h5>
                </div>
                <Col className="scroll-wrapper">
                    {related.map((product) => (
                        <Col key={product.id} >
                            <div className="card-wrapper">
                                <ProductCard product={product} />
                            </div>
                        </Col>
                    ))}
                </Col>
            </Row>}

        </Row>
    );
}

export default Product;