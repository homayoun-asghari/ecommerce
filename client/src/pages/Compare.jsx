import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Button, Table, Badge } from 'react-bootstrap';
import { useCompare } from '../contexts/CompareContext';
import { ArrowLeft, Trash } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const CompareContainer = styled.div`
  .compare-table {
    width: 100%;
    overflow-x: auto;
    margin: 2rem 0;
    
    table {
      min-width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      
      th, td {
        padding: 1rem;
        text-align: center;
        vertical-align: middle;
        border: 1px solid #dee2e6;
        min-width: 200px;
      }
      
      th {
        background-color: #f8f9fa;
        font-weight: 600;
        text-align: left;
      }
      
      .product-cell {
        position: relative;
        .remove-btn {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
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

  // Get all unique attributes from all products
  const allAttributes = new Set();
  items.forEach(product => {
    if (product.attributes) {
      Object.keys(product.attributes).forEach(attr => {
        allAttributes.add(attr);
      });
    }
  });

  const attributeRows = Array.from(allAttributes).map(attr => ({
    name: attr,
    values: items.map(product => product.attributes?.[attr] || '—')
  }));

  return (
    <CompareContainer>
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Compare Products</h2>
          <div>
            <Button 
              variant="outline-danger" 
              onClick={clearCompare}
              className="me-2"
              disabled={items.length === 0}
            >
              Clear All
            </Button>
            <Button as={Link} to="/shop" variant="outline-primary">
              <ArrowLeft className="me-1" /> Continue Shopping
            </Button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <h3>No products to compare</h3>
            <p>Add products to compare their features side by side</p>
            <Button as={Link} to="/shop" variant="primary">
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="compare-table">
            <Table bordered responsive>
              <thead>
                <tr>
                  <th>Product</th>
                  {items.map(product => (
                    <th key={product.id} className="product-cell">
                      <Button 
                        variant="link" 
                        className="remove-btn p-0" 
                        onClick={() => removeFromCompare(product.id)}
                        title="Remove from compare"
                      >
                        <Trash size={16} />
                      </Button>
                      <Card className="h-100 border-0">
                        <div className="d-flex justify-content-center mb-2" style={{ height: '150px' }}>
                          <img 
                            src={product.image_url} 
                            alt={product.name} 
                            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} 
                          />
                        </div>
                        <Card.Body className="p-2">
                          <h6 className="mb-1">
                            <Link to={`/product/${product.id}`} className="text-decoration-none">
                              {product.name}
                            </Link>
                          </h6>
                          <div className="d-flex justify-content-center align-items-center mb-2">
                            <span className="text-danger fw-bold me-2">
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
                        <Badge bg="success">In Stock</Badge>
                      ) : (
                        <Badge bg="danger">Out of Stock</Badge>
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
      </Container>
    </CompareContainer>
  );
};

export default Compare;
