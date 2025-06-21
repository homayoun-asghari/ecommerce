import React, { useState } from 'react';
import { API_BASE_URL } from '../config';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { useLanguage } from '../hooks/useLanguage';

const Contact = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setError(t('contact:form.validation.required'));
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError(t('contact:form.validation.email'));
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Send form data to the backend using fetch
      const response = await fetch(`${API_BASE_URL}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim() || 'General Inquiry',
          message: formData.message.trim()
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || t('contact:form.validation.failed'));
      }
      
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
      
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.message || t('contact:form.validation.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <h1 className="text-center mb-4">{t('contact:title')}</h1>
          <p className="text-center mb-5">
            {t('contact:description')}
          </p>
          
          {submitted && (
            <Alert variant="success" className="mb-4">
              {t('contact:form.success')}
            </Alert>
          )}
          
          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formName">
              <Form.Label>
                {t('contact:form.name')} 
                <span className="text-danger">{t('contact:form.required')}</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('contact:form.namePlaceholder')}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>
                {t('contact:form.email')} 
                <span className="text-danger">{t('contact:form.required')}</span>
              </Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('contact:form.emailPlaceholder')}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="formSubject">
              <Form.Label>{t('contact:form.subject')}</Form.Label>
              <Form.Control
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder={t('contact:form.subjectPlaceholder')}
              />
            </Form.Group>
            
            <Form.Group className="mb-4" controlId="formMessage">
              <Form.Label>
                {t('contact:form.message')} 
                <span className="text-danger">{t('contact:form.required')}</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                placeholder={t('contact:form.messagePlaceholder')}
                required
              />
            </Form.Group>
            
            <div className="d-grid">
              <Button 
                variant="primary" 
                type="submit" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? t('contact:form.sending') : t('contact:form.submit')}
              </Button>
            </div>
          </Form>
          
          <div className="mt-5">
            <h4>{t('contact:contactInfo.title')}</h4>
            <p className="mb-1">
              <i className={`bi bi-${t('contact:icons.email')} me-2`}></i>
              <a href={`mailto:${t('contact:contactInfo.email')}`} className="text-decoration-none">
                {t('contact:contactInfo.email')}
              </a>
            </p>
            <p className="mb-1">
              <i className={`bi bi-${t('contact:icons.phone')} me-2`}></i>
              <a href={`tel:${t('contact:contactInfo.phone').replace(/\D/g, '')}`} className="text-decoration-none">
                {t('contact:contactInfo.phone')}
              </a>
            </p>
            <p className="mb-0">
              <i className={`bi bi-${t('contact:icons.address')} me-2`}></i>
              {t('contact:contactInfo.address')}
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Contact;
