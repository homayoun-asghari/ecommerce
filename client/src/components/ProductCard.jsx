import React from "react";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import { Cart, Heart, HeartFill } from "react-bootstrap-icons";
import Badge from 'react-bootstrap/Badge';
import Rating from '@mui/material/Rating';
import { useCart } from "../contexts/CartContext";
import { useWishList } from "../contexts/WishListContext";
import styled, { keyframes } from 'styled-components';

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0.9; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
`;

const StyledCard = styled(Card)`
  transition: all 0.3s ease-in-out;
  animation: ${fadeIn} 0.3s ease-out;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }
  
  .card {
    border: none;
    transition: transform 0.3s ease-in-out;
  }
  
  &:hover .card {
    transform: scale(1.02);
  }
  
  .card-img-top {
    transition: transform 0.3s ease-in-out;
  }
  
  &:hover .card-img-top {
    transform: scale(1.05);
  }
`;

const WishlistButton = styled(Link)`
  transition: all 0.2s ease-in-out;
  
  &:hover {
    transform: scale(1.1);
  }
`;

function ProductCard({ product }) {
    const { id, name, description, price, stock, category, image_url, discount, avg_rating, review_count } = product;
    const {wishList, addToWishList, removeFromWishList} = useWishList();
    const { addToCart, isInCart, increment, decrement, getQty } = useCart();

    function letterCont(str, num) {
        return str.slice(0, num) + " ...";
    }

    function handleClick(){
        const find = wishList.some(item => item.id === id);
        if(find){
            removeFromWishList(id);
        }else{
            addToWishList(id);
        }
    }

    const letterLimit = 15;
    return (
        <Row className='d-flex justify-content-center align-items-center gap-5'>
            <Link to={`/product/${id}`} style={{ textDecoration: "none", color: 'inherit' }}>
                <Col className='d-flex justify-content-center align-items-center'>
                    <StyledCard style={{ width: '18rem' }}>
                        <Card className="border-0">
                            <Card.Img 
                                variant="top" 
                                src={image_url} 
                                style={{ 
                                    height: "200px", 
                                    objectFit: "cover",
                                    borderTopLeftRadius: '0.375rem',
                                    borderTopRightRadius: '0.375rem'
                                }} 
                            />
                            <Card.ImgOverlay className="d-flex justify-content-between align-items-start p-2">
                                {discount > 0 && (
                                    <Badge bg="danger" className="shadow-sm">{discount}%</Badge>
                                )}
                                <Badge bg="success" className="shadow-sm">{letterCont(category, letterLimit)}</Badge>
                            </Card.ImgOverlay>
                        </Card>
                        <Card.Body className="position-relative">
                            <div className="position-absolute" style={{ top: '-15px', right: '15px' }}>
                                <WishlistButton 
                                    className="btn btn-light rounded-circle shadow-sm" 
                                    style={{ width: '55px', height: '55px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleClick();
                                    }}
                                >
                                    {wishList.some(item => item.id === id) ? 
                                        <HeartFill size={18} className="text-danger" /> : 
                                        <Heart size={18} className="text-secondary" />
                                    }
                                </WishlistButton>
                            </div>
                            <Card.Title className="mt-3 mb-2 fw-bold">{letterCont(name, letterLimit)}</Card.Title>
                            <Card.Text className="text-muted small mb-3">{letterCont(description, letterLimit)}</Card.Text>
                            <div className="d-flex flex-row justify-content-start align-items-center gap-2 mb-2">
                                <Rating
                                    name="read-only"
                                    value={avg_rating || 0}
                                    precision={0.5}
                                    readOnly
                                    size="small"
                                    sx={{
                                        '& .MuiRating-iconEmpty': {
                                            color: 'lightgray',
                                        },
                                        '& .MuiRating-iconFilled': {
                                            color: '#ffc107',
                                        }
                                    }}
                                />
                                <Badge bg="light" text="dark" className="shadow-sm">{review_count} reviews</Badge>
                            </div>
                            <Card.Text className="mb-3">
                                <span className="h5 fw-bold">${(price - (price * discount / 100)).toFixed(2)}</span>
                                {discount > 0 && (
                                    <small className="text-muted ms-2" style={{ textDecoration: "line-through" }}>${price}</small>
                                )}
                            </Card.Text>
                            <div className="d-grid">
                                {!isInCart(id) ? (
                                    <button 
                                        className="btn btn-outline-success d-flex align-items-center justify-content-center gap-2"
                                        style={{ height: '38px' }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            addToCart(product);
                                        }}
                                    >
                                        <Cart size={18} />
                                        <span>Add to Cart</span>
                                    </button>
                                ) : (
                                    <div className="qty-controls d-flex justify-content-center gap-1">
                                        <button 
                                            className="btn btn-outline-success rounded-circle d-flex align-items-center justify-content-center" 
                                            style={{ width: '36px', height: '36px' }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                decrement(id);
                                            }}
                                        >
                                            -
                                        </button>
                                        <div 
                                            className="border d-flex align-items-center justify-content-center" 
                                            style={{ width: '36px', height: '36px', borderRadius: '50%' }}
                                        >
                                            {getQty(id)}
                                        </div>
                                        <button 
                                            className="btn btn-outline-success rounded-circle d-flex align-items-center justify-content-center" 
                                            style={{ width: '36px', height: '36px' }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if (getQty(id) < stock) increment(id);
                                            }}
                                        >
                                            +
                                        </button>
                                    </div>
                                )}
                            </div>
                        </Card.Body>
                    </StyledCard>
                </Col>
            </Link>
        </Row>
    );
}

export default ProductCard;