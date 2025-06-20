import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Button, Table, Badge, Row, Col } from 'react-bootstrap';
import { useCompare } from '../contexts/CompareContext';
import { useSideBar } from '../contexts/SideBarContext';
import { ArrowLeft, Trash } from 'react-bootstrap-icons';
import styled from 'styled-components';

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

const CompareContainer = styled.div`
  .compare-table {
    width: 100%;
    overflow-x: auto;
    margin: 1.5rem 0;
    background: #fff;
    border-radius: 0.5rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    
    table {
      min-width: 100%;
      margin: 0;
      border-collapse: separate;
      border-spacing: 0;
      
      thead {
        th {
          font-weight: 600;
          color: #495057;
          padding: 1.25rem;
          border-bottom: 2px solid #dee2e6;
          white-space: nowrap;
        }
      }
      
      tbody {
        tr {
          transition: background-color 0.2s;
          &:nth-child(odd) {
            background-color: rgba(0, 0, 0, 0.02);
          }
          &:hover {
            background-color: rgba(0, 0, 0, 0.03);
          }
        }
      }
      
      th, td {
        padding: 1.25rem;
        text-align: center;
        vertical-align: middle;
        border: 1px solid #e9ecef;
        min-width: 200px;
        max-width: 250px;
        word-wrap: break-word;
      }
      
      th {
        font-weight: 600;
        color: #495057;
      }
      
      .product-cell {
        position: relative;
        padding: 1.5rem !important;
        
        .remove-btn {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          opacity: 0.8;
          transition: opacity 0.2s;
          z-index: 2;
          
          &:hover {
            opacity: 1;
          }
          background: rgba(0,0,0,0.1);
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          color: #dc3545;
          &:hover {
            background: rgba(220, 53, 69, 0.1);
          }
        }
      }
    }
  }
  
  .empty-state {
    text-align: center;
    padding: 4rem 0;
    
    h3 {
      margin-bottom: 1.5rem;
    }
    
    p {
      color: #6c757d;
      margin-bottom: 2rem;
    }
  }
`;

const Compare = () => {
  const { items, removeFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();
  const { isOpen } = useSideBar();

  // Format price helper function with comprehensive error handling
  const formatPrice = (price) => {
    try {
      if (price === null || price === undefined || price === '') return 'N/A';
      const numPrice = typeof price === 'number' ? price : Number(price);
      if (isNaN(numPrice)) return 'N/A';
      return `$${numPrice.toFixed(2)}`;
    } catch (error) {
      console.error('Error formatting price:', { price, error });
      return 'N/A';
    }
  };
  
  // Helper function to safely calculate discounted price
  const getDiscountedPrice = (price, discount) => {
    try {
      if (price === null || price === undefined || price === '') return 'N/A';
      const numPrice = typeof price === 'number' ? price : Number(price);
      const numDiscount = discount ? (typeof discount === 'number' ? discount : Number(discount)) : 0;
      
      if (isNaN(numPrice) || isNaN(numDiscount)) return 'N/A';
      
      const discountAmount = numPrice * (numDiscount / 100);
      const finalPrice = numPrice - discountAmount;
      return `$${finalPrice.toFixed(2)}`;
    } catch (error) {
      console.error('Error calculating discounted price:', { price, discount, error });
      return 'N/A';
    }
  };
  
  // Debug: Log the items being compared
  useEffect(() => {
    console.log('Comparing items:', items);
    items.forEach((item, index) => {
      console.log(`Item ${index + 1}:`, {
        id: item.id,
        name: item.name,
        price: item.price,
        priceType: typeof item.price,
        discount: item.discount,
        discountType: typeof item.discount
      });
    });
  }, [items]);

  // Redirect to home if no items to compare
  useEffect(() => {
    if (items.length === 0) {
      navigate('/shop');
    }
  }, [items, navigate]);

  if (items.length === 0) {
    return null; // Will redirect immediately
  }

  // Get all unique attributes from all products, excluding those we're already showing
  const allAttributes = new Set();
  const excludedAttributes = ['Category', 'In Stock', 'Rating', 'Reviews', 'SKU'];
  
  items.forEach(product => {
    if (product.attributes) {
      Object.keys(product.attributes).forEach(attr => {
        if (!excludedAttributes.includes(attr)) {
          allAttributes.add(attr);
        }
      });
    }
  });

  const attributeRows = Array.from(allAttributes).map(attr => ({
    name: attr,
    values: items.map(product => {
      const value = product.attributes?.[attr];
      return value !== undefined ? value : '—';
    })
  }));
  
  // Add SKU row manually since it's a common attribute
  const hasSKU = items.some(p => p.id);
  if (hasSKU) {
    attributeRows.unshift({
      name: 'SKU',
      values: items.map(p => p.id || '—')
    });
  }

  return (
    <Container fluid className="py-4 px-0 px-md-3">
      <Row className="position-relative">
        <ContentColumn
          $isOpen={isOpen}
          lg={isOpen ? 9 : 12}
          className="px-0 px-md-3"
        >
          <CompareContainer>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
              <h2 className="mb-0">Compare Products</h2>
              <div className="d-flex flex-wrap gap-2">
                <Button 
                  variant="outline-danger" 
                  onClick={clearCompare}
                  disabled={items.length === 0}
                  size="sm"
                >
                  Clear All
                </Button>
                <Button as={Link} to="/shop" variant="outline-primary" size="sm">
                  <ArrowLeft className="me-1" /> Continue Shopping
                </Button>
              </div>
            </div>

            {items.length === 0 ? (
          <div className="empty-state text-center py-5">
            <h3 className="mb-3">No products to compare</h3>
            <p className="text-muted mb-4">Add products to compare their features side by side</p>
            <Button 
              as={Link} 
              to="/shop" 
              variant="primary"
              className="px-4"
              size="lg"
            >
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="compare-table">
            <Table bordered hover responsive className="mb-0">
              <thead>
                <tr>
                  <th>Product</th>
                  {items.map(product => (
                    <th key={product.id} className="product-cell position-relative" style={{ minWidth: '250px' }}>
                      <Button 
                        variant="danger" 
                        size="sm"
                        className="remove-btn"
                        onClick={() => removeFromCompare(product.id)}
                        title="Remove from compare"
                      >
                        <Trash size={14} />
                      </Button>
                      <Card className="h-100 border-0 bg-transparent">
                        <div className="d-flex justify-content-center align-items-center mb-3" style={{ height: '180px' }}>
                          <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: '0.5rem',
                            overflow: 'hidden',
                            padding: '1rem'
                          }}>
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="img-fluid"
                              style={{ 
                                maxHeight: '100%',
                                maxWidth: '100%',
                                width: 'auto',
                                height: 'auto',
                                objectFit: 'contain'
                              }} 
                            />
                          </div>
                        </div>
                        <Card.Body className="p-3 text-center">
                          <h6 className="mb-2 fw-bold">
                            <Link to={`/product/${product.id}`} className="text-decoration-none text-dark">
                              {product.name}
                            </Link>
                          </h6>
                          <div className="d-flex justify-content-center align-items-center mb-3">
                            <span className="text-danger fw-bold me-2 fs-5">
                              ${(product.price - (product.price * (product.discount || 0) / 100)).toFixed(2)}
                            </span>
                            {product.discount > 0 && (
                              <small className="text-muted text-decoration-line-through">
                                ${product.price.toFixed(2)}
                              </small>
                            )}
                          </div>
                          <Button 
                            as={Link} 
                            to={`/product/${product.id}`} 
                            variant="outline-primary" 
                            size="sm"
                            className="w-100"
                          >
                            View Details
                          </Button>
                        </Card.Body>
                      </Card>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Price</td>
                  {items.map(product => (
                    <td key={`price-${product.id}`}>
                      <div className="d-flex flex-column">
                        <span className="fw-bold">
                          {getDiscountedPrice(product.price, product.discount)}
                        </span>
                        {product.discount && Number(product.discount) > 0 && (
                          <small className="text-muted text-decoration-line-through">
                            {formatPrice(product.price)}
                          </small>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Availability</td>
                  {items.map(product => (
                    <td key={`stock-${product.id}`}>
                      {product.stock > 0 ? (
                        <Badge bg="success" className="px-2 py-1">In Stock</Badge>
                      ) : (
                        <Badge bg="danger" className="px-2 py-1">Out of Stock</Badge>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Rating</td>
                  {items.map(product => (
                    <td key={`rating-${product.id}`}>
                      <div className="d-flex align-items-center justify-content-center">
                        <span className="me-2">{product.avg_rating?.toFixed(1) || '—'}</span>
                        <div className="text-warning">
                          {[...Array(5)].map((_, i) => (
                            <span key={i}>
                              {i < Math.floor(product.avg_rating || 0) ? '★' : '☆'}
                            </span>
                          ))}
                        </div>
                        <small className="text-muted ms-2">
                          ({product.review_count || 0} reviews)
                        </small>
                      </div>
                    </td>
                  ))}
                </tr>
                {attributeRows.map((row, idx) => (
                  <tr key={`attr-${idx}`}>
                    <td>{row.name}</td>
                    {row.values.map((value, i) => (
                      <td key={`attr-${idx}-${i}`}>
                        {Array.isArray(value) ? value.join(', ') : value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
            )}
          </CompareContainer>
        </ContentColumn>
      </Row>
    </Container>
  );
};

export default Compare;
