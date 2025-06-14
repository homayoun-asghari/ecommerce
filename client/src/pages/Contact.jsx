import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // In a real application, you would send the form data to your backend here
    console.log('Form submitted:', formData);
    
    // Show success message
    setSubmitted(true);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <h1 className="text-center mb-4">Contact Us</h1>
          <p className="text-center mb-5">
            Have questions or feedback? We'd love to hear from you! Fill out the form below 
            and we'll get back to you as soon as possible.
          </p>
          
          {submitted && (
            <Alert variant="success" className="mb-4">
              Thank you for your message! We'll get back to you soon.
            </Alert>
          )}
          
          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formName">
              <Form.Label>Full Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email Address <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="formSubject">
              <Form.Label>Subject</Form.Label>
              <Form.Control
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="What's this about?"
              />
            </Form.Group>
            
            <Form.Group className="mb-4" controlId="formMessage">
              <Form.Label>Message <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="textarea"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                placeholder="Type your message here..."
                required
              />
            </Form.Group>
            
            <div className="d-grid">
              <Button variant="primary" type="submit" size="lg">
                Send Message
              </Button>
            </div>
          </Form>
          
          <div className="mt-5">
            <h4>Contact Information</h4>
            <p className="mb-1">
              <i className="bi bi-envelope me-2"></i>
              <a href="mailto:contact@example.com" className="text-decoration-none">
                contact@example.com
              </a>
            </p>
            <p className="mb-1">
              <i className="bi bi-telephone me-2"></i>
              <a href="tel:+1234567890" className="text-decoration-none">
                +1 (234) 567-890
              </a>
            </p>
            <p className="mb-0">
              <i className="bi bi-geo-alt me-2"></i>
              123 Business Street, City, Country
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Contact;
