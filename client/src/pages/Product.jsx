import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Rating from '@mui/material/Rating';
import Badge from 'react-bootstrap/Badge';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import { Cart, Heart, HeartFill, Wallet, ShieldCheck, Share, ArrowLeftRight, Check2, ArrowRight } from 'react-bootstrap-icons';
import { useCompare } from '../contexts/CompareContext';
import styled from 'styled-components';
import Countdown from "../components/Countdown";
import ProductCard from "../components/ProductCard";
import { useCart } from "../contexts/CartContext";
import { useWishList } from "../contexts/WishListContext";
import { useSideBar } from "../contexts/SideBarContext";
import { API_BASE_URL } from "../config";

const ContentColumn = styled(Col)`
  transition: all 0.3s ease-in-out;
  margin-left: 0;
  width: 100%;
  padding: 0 15px;
  
  @media (min-width: 998px) {
    margin-left: ${({ $isOpen }) => ($isOpen ? '300px' : '0')};
    width: ${({ $isOpen }) => ($isOpen ? 'calc(100% - 300px)' : '100%')};
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 1rem 0;
  width: 100%;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
`;


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


    const { isOpen } = useSideBar();
    const [shareSuccess, setShareSuccess] = useState(false);
    const { 
      addToCompare, 
      isInCompare, 
      items: compareItems, 
      maxItems: MAX_COMPARE_ITEMS,
      remainingItems 
    } = useCompare();
    const [compareSuccess, setCompareSuccess] = useState(false);
    const navigate = useNavigate();
    const { t } = useTranslation(['productPage', 'common']);

    // Format price helper function with better null/undefined handling
    const formatPrice = (price) => {
        if (price === null || price === undefined) return 'N/A';
        const numPrice = Number(price);
        return isNaN(numPrice) ? 'N/A' : `$${numPrice.toFixed(2)}`;
    };
    
    // Helper function to safely calculate discounted price
    const getDiscountedPrice = (price, discount) => {
        if (price === null || price === undefined) return 'N/A';
        const numPrice = Number(price);
        const numDiscount = Number(discount) || 0;
        if (isNaN(numPrice)) return 'N/A';
        const finalPrice = numPrice - (numPrice * numDiscount / 100);
        return `$${finalPrice.toFixed(2)}`;
    };

    const handleShare = useCallback(async () => {
        const shareData = {
            title: name,
            text: `Check out ${name} on our store - ${description.substring(0, 100)}...`,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback for browsers that don't support Web Share API
                await navigator.clipboard.writeText(window.location.href);
                setShareSuccess(true);
                setTimeout(() => setShareSuccess(false), 2000);
                
                // Show a toast notification
                const toast = document.createElement('div');
                toast.textContent = 'Link copied to clipboard!';
                toast.style.position = 'fixed';
                toast.style.bottom = '20px';
                toast.style.left = '50%';
                toast.style.transform = 'translateX(-50%)';
                toast.style.backgroundColor = '#28a745';
                toast.style.color = 'white';
                toast.style.padding = '10px 20px';
                toast.style.borderRadius = '4px';
                toast.style.zIndex = '9999';
                document.body.appendChild(toast);
                setTimeout(() => {
                    document.body.removeChild(toast);
                }, 2000);
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    }, [name, description]);

    const handleCompare = useCallback(() => {
        // Create toast element
        const toast = document.createElement('div');
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.padding = '10px 20px';
        toast.style.borderRadius = '4px';
        toast.style.zIndex = '9999';
        
        try {
            // Ensure all number values are properly converted
            const productToCompare = {
                id: String(id),
                name: String(name || 'Unnamed Product'),
                description: String(description || ''),
                price: Number(price) || 0,
                discount: Number(discount) || 0,
                category: String(category || 'Uncategorized'),
                image_url: String(image_url || ''),
                stock: Number(stock) || 0,
                avg_rating: Number(avg_rating) || 0,
                review_count: Number(reviews?.length) || 0,
                attributes: {
                    'Category': String(category || 'Uncategorized'),
                    'In Stock': Number(stock) > 0 ? 'Yes' : 'No',
                    'Rating': `${Number(avg_rating) || 0}/5`,
                    'Reviews': Number(reviews?.length) || 0,
                    'SKU': String(id)
                }
            };
            
            console.log('Adding to compare:', productToCompare);
            addToCompare(productToCompare);
            setCompareSuccess(true);
            
            // Show success toast
            toast.textContent = 'Added to compare!';
            toast.style.backgroundColor = '#0d6efd';
            toast.style.color = 'white';
            
        } catch (error) {
            console.error('Error adding to compare:', {
                error,
                productData: { id, name, price, discount, stock }
            });
            
            // Show error toast
            toast.textContent = 'Failed to add to comparison';
            toast.style.backgroundColor = '#dc3545';
            toast.style.color = 'white';
            
            document.body.appendChild(toast);
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 3000);
            return;
        }
        
        // Show success toast
        document.body.appendChild(toast);
        setTimeout(() => {
            document.body.removeChild(toast);
            setCompareSuccess(false);
        }, 2000);
    }, [id, name, description, price, discount, category, image_url, stock, avg_rating, reviews.length, addToCompare]);
    
    const handleViewComparison = useCallback((e) => {
        e.preventDefault();
        navigate('/compare');
    }, [navigate]);

    return (
        <ContentColumn $isOpen={isOpen} className="py-4">
            <Row className="gx-4">
                <Col lg={6} md={12} className="d-flex flex-column justify-content-center align-items-center gap-3 mb-4 mb-lg-0">
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
                <Col lg={6} md={12} className="d-flex flex-column justify-content-center gap-3">
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
                        <Badge bg="light" text="dark">
                      {t('reviews.count', { count: review_count, defaultValue: '{{count}} reviews' })}
                    </Badge>
                    </div>
                    <p>{description}</p>
                    <p className="text-muted">
                      {getDiscountedPrice(price, discount)}
                      {discount > 0 && (
                        <span className="ms-2 text-muted" style={{ textDecoration: "line-through" }}>
                          {formatPrice(price)}
                        </span>
                      )}
                    </p>

                    {discount > 0 && (
                      <div className="w-100 d-flex flex-column justify-content-center align-items-center especial-offers-card py-3 rounded">
                        <h6 className="text-nowrap">{t('specialOffers')}: </h6>
                        <Countdown />
                      </div>
                    )}

                    {!isInCart(product.id) ? (
                      <Link 
                        className="btn btn-outline-success d-flex align-items-center justify-content-center gap-2" 
                        onClick={() => addToCart(product)}
                        disabled={stock <= 0}
                      >
                        <Cart size={24} />
                        {stock > 0 ? t('addToCart') : t('outOfStock')}
                      </Link>
                    ) : (
                      <div className="qty-controls d-flex justify-content-center gap-1">
                        <button 
                          className="btn btn-outline-success" 
                          onClick={() => decrement(product.id)}
                          style={{ width: '40px' }}
                        >
                          -
                        </button>
                        <div 
                          className="d-flex align-items-center justify-content-center" 
                          style={{ 
                            width: '40px', 
                            border: '1px solid #198754',
                            borderRadius: '0.375rem'
                          }}
                        >
                          {getQty(product.id)}
                        </div>
                        <button 
                          className="btn btn-outline-success" 
                          onClick={() => getQty(id) < stock && increment(id)}
                          disabled={getQty(id) >= stock}
                          style={{ width: '40px' }}
                        >
                          +
                        </button>
                      </div>
                    )}

                    <div className="d-grid gap-2">
                      <Card body className="d-flex align-items-start gap-2">
                        <Wallet size={24} className="flex-shrink-0 mt-1" />
                        <div>
                          <strong>{t('payment.title')}.</strong> {t('payment.description')}
                        </div>
                      </Card>

                      <Card body className="d-flex align-items-start gap-2">
                        <ShieldCheck size={24} className="flex-shrink-0 mt-1" />
                        <div>
                          <strong>{t('warranty.title')}.</strong> {t('warranty.description')}
                        </div>
                      </Card>
                    </div>

                    <div className="d-flex flex-row flex-wrap justify-content-center align-items-center gap-2">
                        <Link 
                          onClick={handleClick} 
                          className="btn btn-outline-danger text-nowrap d-flex align-items-center gap-1"
                        >
                          {wishList.some(item => item.id === id) ? (
                            <HeartFill size={24} className="text-danger" />
                          ) : (
                            <Heart size={24} />
                          )}
                          {wishList.some(item => item.id === id) ? t('inWishlist') : t('addToWishlist')}
                        </Link>
                        <button 
                          onClick={handleShare} 
                          className="btn btn-outline-primary text-nowrap d-flex align-items-center gap-1"
                          disabled={shareSuccess}
                        >
                          {shareSuccess ? (
                            <>
                              <Check2 size={24} /> {t('copied')}
                            </>
                          ) : (
                            <>
                              <Share size={24} /> {t('share')}
                            </>
                          )}
                        </button>
                        {isInCompare(product.id) ? (
                            <button 
                              onClick={handleViewComparison}
                              className="btn btn-primary text-nowrap d-flex align-items-center gap-1"
                            >
                              <ArrowRight size={24} /> {t('compare.view', { 
                                current: compareItems.length, 
                                max: MAX_COMPARE_ITEMS 
                              })}
                            </button>
                        ) : (
                            <div className="position-relative">
                              <button 
                                onClick={handleCompare}
                                className="btn btn-outline-primary text-nowrap d-flex align-items-center gap-1"
                                disabled={compareSuccess || remainingItems <= 0}
                                title={remainingItems <= 0 
                                  ? t('compare.maxItems', { count: MAX_COMPARE_ITEMS })
                                  : t('compare.itemsLeft', { 
                                      count: remainingItems,
                                      items: t(`compare.${remainingItems === 1 ? 'item' : 'items'}`)
                                    })}
                              >
                                {compareSuccess ? (
                                  <>
                                    <Check2 size={24} /> {t('compare.added')}
                                  </>
                                ) : (
                                  <>
                                    <ArrowLeftRight size={24} />
                                    <span>
                                      {t('compare.add')}
                                      {compareItems.length > 0 && ` (${compareItems.length}/${MAX_COMPARE_ITEMS})`}
                                    </span>
                                  </>
                                )}
                              </button>
                              {compareItems.length >= MAX_COMPARE_ITEMS && (
                                <div className="position-absolute top-100 start-50 translate-middle-x mt-1 small text-muted">
                                  {t('compare.maxItems', { count: MAX_COMPARE_ITEMS })}
                                </div>
                              )}
                            </div>
                        )}
                    </div>

                </Col>
            </Row>

            <Row className="py-5">
                <Col>
                    <h5 style={{ marginBottom: "0px", padding: "var(--space-xs) 0" }}>
                      {t('reviews.title')} ({reviews.length})
                    </h5>
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
                  <h5 style={{ marginBottom: "0px", padding: "var(--space-xs) 0" }}>
                    {t('relatedProducts')}
                  </h5>
                </div>
                <Col>
                    <ProductsGrid>
                        {related.map((product) => (
                            <div key={product.id} className="card-wrapper">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </ProductsGrid>
                </Col>
            </Row>}
        </ContentColumn>
    );
}

export default Product;