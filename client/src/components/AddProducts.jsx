import React, { useState, useEffect, useCallback } from 'react';
import { 
    Card, 
    Form, 
    Button, 
    Alert, 
    Modal, 
    Spinner, 
    Badge,
    InputGroup,
    Row,
    Col
} from 'react-bootstrap';
import { Pencil, Trash, Search, Plus } from 'react-bootstrap-icons';
// Remove UserContext import as we don't need authentication
import styled from 'styled-components';
import { useUser } from "../contexts/UserContext";
import { API_BASE_URL } from "../config";
// Styled Components
const ProductsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    padding: 1rem 0;
    
    @media (max-width: 1200px) {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }
    
    @media (max-width: 768px) {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }
    
    @media (max-width: 400px) {
        grid-template-columns: 1fr;
    }
    
    @media (max-width: 576px) {
        grid-template-columns: 1fr;
    }
`;

const ProductCardWrapper = styled(Card)`
    transition: transform 0.2s, box-shadow 0.2s;
    height: 100%;
    overflow: hidden;
    
    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
    
    .card-img-top {
        height: 200px;
        object-fit: cover;
        transition: transform 0.3s ease;
    }
    
    &:hover .card-img-top {
        transform: scale(1.05);
    }
`;

// Removed unused ActionButton styled component

const AddProducts = () => {
    // Remove unused navigate since we're not doing any navigation in this component
    // No need for user context or authentication
    
    // State
    const [products, setProducts] = useState([]);
    const [editingProductId, setEditingProductId] = useState(null);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const { user } = useUser();
    const userId = user?.data?.id;
    
    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    
    // Modal state
    const [showModal, setShowModal] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        discount: '',
        image: null,
        imagePreview: ''
    });
    
    // Available categories
    const [categories, setCategories] = useState([
        'Electronics',
        'Clothing',
        'Books',
        'Home',
        'Beauty',
        'Toys',
        'Food & Grocery'
    ]);

    // Fetch seller's products
    const fetchProducts = useCallback(async () => {
        if (!userId) return;
        
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/product/sellersproducts?userId=${userId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const data = await response.json();
            setProducts(data);
            setFilteredProducts(data);
            // Extract unique categories
            const uniqueCategories = [...new Set(data.map(p => p.category))];
            setCategories(uniqueCategories);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError(err.message || 'Error fetching products. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // Initial fetch
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);
    
    // Filter products based on search and category
    useEffect(() => {
        let result = [...products];
        
        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(product => 
                product.name.toLowerCase().includes(term) ||
                (product.description && product.description.toLowerCase().includes(term))
            );
        }
        
        // Apply category filter
        if (categoryFilter !== 'all') {
            result = result.filter(product => 
                product.category && 
                product.category.toLowerCase() === categoryFilter.toLowerCase()
            );
        }
        
        setFilteredProducts(result);
    }, [searchTerm, categoryFilter, products]);
    
    // Handle form input changes
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        
        if (name === 'image' && files && files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    image: files[0],
                    imagePreview: reader.result
                }));
            };
            reader.readAsDataURL(files[0]);
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };
    
    // Handle form submission (add/edit product)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        // Basic validation
        if (!formData.name || !formData.price || !formData.category || formData.stock === '') {
            setError('Please fill in all required fields');
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('price', formData.price);
        formDataToSend.append('category', formData.category);
        formDataToSend.append('stock', formData.stock);
        
        // Only append discount if it has a value
        if (formData.discount !== '') {
            formDataToSend.append('discount', formData.discount);
        }
        
        if (formData.image) {
            formDataToSend.append('image', formData.image);
        }

        try {
            setIsSubmitting(true);
            const token = localStorage.getItem('token');
            
            let response;
            if (editingProductId) {
                // Update existing product
                response = await fetch(`${API_BASE_URL}/product/${editingProductId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formDataToSend
                });
            } else {
                // Add new product
                if (!formData.image) {
                    setError('Product image is required');
                    setIsSubmitting(false);
                    return;
                }
                response = await fetch(`${API_BASE_URL}/product`, {
                    method: 'POST',
                    body: formDataToSend
                });
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            setSuccess(editingProductId ? 'Product updated successfully' : 'Product added successfully');
            fetchProducts();
            handleClose();
        } catch (err) {
            console.error('Error saving product:', err);
            setError(err.message || 'Failed to save product');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Handle edit button click
    const handleEdit = (product) => {
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price,
            category: product.category,
            stock: product.stock,
            discount: product.discount || '',
            image: null,
            imagePreview: product.image_url || ''
        });
        setEditingProductId(product.id);
        setShowModal(true);
    };
    
    // Handle delete button click
    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/product/${productId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to delete product');
                }

                setSuccess('Product deleted successfully');
                // Refresh the products list
                await fetchProducts();
            } catch (err) {
                console.error('Error deleting product:', err);
                setError(err.message || 'Failed to delete product');
            } finally {
                setLoading(false);
            }
        }
    };
    
    // Reset form to initial state
    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            category: '',
            stock: '',
            discount: '',
            image: null,
            imagePreview: ''
        });
        setError('');
        setEditingProductId(null);
    };
    
    // Handle modal close
    const handleClose = () => {
        setShowModal(false);
        resetForm();
        setEditingProductId(null);
    };
    
    // Handle add new product button click
    const handleAddNew = () => {
        resetForm();
        setEditingProductId(null);
        setShowModal(true);
    };

    return (
        <>
            {/* Header with Add Product Button */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">My Products</h2>
                <Button 
                    variant="primary" 
                    onClick={handleAddNew}
                    disabled={loading}
                >
                    <Plus className="me-2" />
                    Add New Product
                </Button>
            </div>

            {/* Search and Filter Controls */}
            <div className="row mb-4 g-3">
                <div className="col-md-8">
                    <InputGroup>
                        <InputGroup.Text>
                            <Search />
                        </InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </div>
                <div className="col-md-4">
                    <Form.Select 
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="all">All Categories</option>
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </Form.Select>
                </div>
            </div>

            {/* Status Messages */}
            {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
            {success && <Alert variant="success" className="mb-4">{success}</Alert>}

            {/* Loading State */}
            {loading && !filteredProducts.length ? (
                <div className="text-center py-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <p className="mt-2">Loading products...</p>
                </div>
            ) : (
                /* Products Grid */
                <ProductsGrid>
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <ProductCardWrapper key={product.id}>
                                {product.image_url && (
                                    <Card.Img 
                                        variant="top" 
                                        src={product.image_url} 
                                        alt={product.name}
                                        className="card-img-top"
                                    />
                                )}
                                <Card.Body className="d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <Card.Title className="h5 mb-1">{product.name}</Card.Title>
                                        <Badge bg="secondary">{product.category}</Badge>
                                    </div>
                                    <Card.Text className="text-muted small mb-3">
                                        {product.description?.length > 100 
                                            ? `${product.description.substring(0, 100)}...` 
                                            : product.description || 'No description'}
                                    </Card.Text>
                                    <div className="mt-auto">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <span className="h5 mb-0">${parseFloat(product.price).toFixed(2)}</span>
                                            <span className={product.stock > 0 ? 'text-success' : 'text-danger'}>
                                                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                            </span>
                                        </div>
                                        <div className="d-flex">
                                            <Button 
                                                variant="outline-primary" 
                                                size="sm" 
                                                className="me-2 flex-grow-1"
                                                onClick={() => handleEdit(product)}
                                                disabled={loading}
                                            >
                                                <Pencil className="me-1" /> Edit
                                            </Button>
                                            <Button 
                                                variant="outline-danger" 
                                                size="sm"
                                                className="flex-grow-1"
                                                onClick={() => handleDelete(product.id)}
                                                disabled={loading}
                                            >
                                                <Trash className="me-1" /> Delete
                                            </Button>
                                        </div>
                                    </div>
                                </Card.Body>
                            </ProductCardWrapper>
                        ))
                    ) : (
                        <div className="col-12 text-center py-5">
                            <h4 className="text-muted">
                                {searchTerm || categoryFilter !== 'all' 
                                    ? 'No products match your filters' 
                                    : 'No products found. Add your first product!'}
                            </h4>
                        </div>
                    )}
                </ProductsGrid>
            )}

            {/* Add/Edit Product Modal */}
            <Modal
                show={showModal}
                onHide={handleClose}
                centered
                size="lg"
                backdrop="static"
            >
                <Modal.Header closeButton closeVariant={isSubmitting ? 'white' : undefined}>
                    <Modal.Title>{editingProductId ? 'Edit Product' : 'Add New Product'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Product Name <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                disabled={isSubmitting}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={formData.description || ''}
                                onChange={handleChange}
                                disabled={isSubmitting}
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Price ($) <span className="text-danger">*</span></Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text>$</InputGroup.Text>
                                        <Form.Control
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            min="0"
                                            step="0.01"
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Stock Quantity <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        min="0"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Discount (%)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="discount"
                                        value={formData.discount}
                                        onChange={handleChange}
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        placeholder="Enter discount percentage"
                                        disabled={isSubmitting}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Category <span className="text-danger">*</span></Form.Label>
                            <Form.Select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                disabled={isSubmitting}
                            >
                                <option value="">Select a category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>Product Image {!editingProductId && <span className="text-danger">*</span>}</Form.Label>
                            {formData.imagePreview && (
                                <div className="mb-3 text-center">
                                    <img 
                                        src={formData.imagePreview} 
                                        alt="Preview" 
                                        className="img-thumbnail" 
                                        style={{ maxHeight: '200px' }}
                                    />
                                </div>
                            )}
                            <Form.Control
                                type="file"
                                name="image"
                                onChange={handleChange}
                                accept="image/*"
                                required={!editingProductId}
                                disabled={isSubmitting}
                            />
                            {editingProductId && (
                                <Form.Text className="text-muted">
                                    Leave empty to keep the current image
                                </Form.Text>
                            )}
                        </Form.Group>

                        {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
                        
                        <div className="d-flex justify-content-end gap-2">
                            <Button 
                                variant="outline-secondary" 
                                onClick={handleClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Spinner as="span" size="sm" animation="border" role="status" className="me-2" />
                                        {editingProductId ? 'Updating...' : 'Adding...'}
                                    </>
                                ) : editingProductId ? (
                                    'Update Product'
                                ) : (
                                    'Add Product'
                                )}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default AddProducts; 