import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Alert, Modal } from 'react-bootstrap';
import ProductCard from './ProductCard';
// import '../styles/AddProducts.css';
import { useUser } from "../contexts/UserContext.jsx"

const AddProducts = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        image: null
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const { user } = useUser();
    const userId = user?.data?.id;

    // Fetch seller's products
    useEffect(() => {
        const fetchProducts = async () => {
            if (!userId) {
                setError('User ID not found. Please log in again.');
                return;
            }

            try {
                const response = await fetch(`http://localhost:5050/product/sellersproducts?userId=${userId}`);

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch products');
                }

                const data = await response.json();
                setProducts(data);
                setError(''); // Clear any previous errors
            } catch (err) {
                console.error('Error fetching products:', err);
                setError(err.message || 'Error fetching products. Please try again.');
            }
        };

        fetchProducts();
    }, [userId]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: files ? files[0] : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
      
        try {
          if (!formData.image) {
            throw new Error('Please select an image');
          }
      
          const formDataToSend = new FormData();
          formDataToSend.append('name', formData.name);
          formDataToSend.append('description', formData.description);
          formDataToSend.append('price', formData.price);
          formDataToSend.append('category', formData.category);
          formDataToSend.append('stock', formData.stock);
          formDataToSend.append('image', formData.image);
          formDataToSend.append('seller_id', userId);
      
          const response = await fetch('http://localhost:5050/product', {
            method: 'POST',
            body: formDataToSend,
          });
      
          const data = await response.json();
      
          if (!response.ok) {
            if (data.error === 'A product with this name already exists') {
              setFormData(prev => ({ ...prev, image: null }));
              throw new Error('A product with this name already exists. Please choose a different name.');
            }
            throw new Error(data.error || 'Error adding product');
          }
      
          // Refresh products list for this seller
          const updatedResponse = await fetch(`http://localhost:5050/product/sellersproducts?userId=${userId}`);
          if (!updatedResponse.ok) throw new Error('Failed to refresh products list');
          const updatedData = await updatedResponse.json();
          setProducts(updatedData);
      
          // Reset form and close modal
          setFormData({
            name: '',
            description: '',
            price: '',
            category: '',
            stock: '',
            image: null,
          });
          setShowModal(false);
        } catch (err) {
          console.error('Error adding product:', err);
          setError(err.message || 'Error adding product. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      

    const handleClose = () => {
        setShowModal(false);
        setError('');
        setFormData({
            name: '',
            description: '',
            price: '',
            category: '',
            stock: '',
            image: null
        });
    };

    return (
        <div className="products-container">
            <div className="products-header d-flex justify-content-between align-items-center mb-3">
                <h2>My Products</h2>
                <Button
                    variant="primary"
                    onClick={() => setShowModal(true)}
                >
                    Add New Product
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <div className="products-grid scroll-wrapper">
                {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>

            {/* Add Product Modal */}
            <Modal
                show={showModal}
                onHide={handleClose}
                centered
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Add New Product</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Product Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Price</Form.Label>
                            <Form.Control
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Category</Form.Label>
                            <Form.Select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select a category</option>
                                <option value="electronics">Electronics</option>
                                <option value="clothing">Clothing</option>
                                <option value="books">Books</option>
                                <option value="home">Home & Garden</option>
                                <option value="sports">Sports</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Stock Quantity</Form.Label>
                            <Form.Control
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                min="0"
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>Product Image</Form.Label>
                            <Form.Control
                                type="file"
                                name="image"
                                onChange={handleChange}
                                accept="image/*"
                                required
                            />
                        </Form.Group>

                        <div className="d-grid">
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Adding Product...' : 'Add Product'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default AddProducts; 