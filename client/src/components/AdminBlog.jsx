import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Form, Card, Spinner, Alert } from 'react-bootstrap';
import { Pencil, Trash, Plus } from 'react-bootstrap-icons';
import { API_BASE_URL } from "../config";
// Format date helper function with i18n support
const formatDate = (dateString, locale = 'en-US') => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const AdminBlog = () => {
  const { t, i18n } = useTranslation('adminBlog');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: ''
  });

  // Fetch all blog posts
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/blog`);
      if (!response.ok) throw new Error(t('errors.fetchFailed'));
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (err) {
      setError(err.message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission (create/update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const url = currentPost 
        ? `${API_BASE_URL}/admin/blog/${currentPost.id}`
        : `${API_BASE_URL}/admin/blog`;
      
      const method = currentPost ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error(t('errors.saveFailed'));
      
      setShowModal(false);
      fetchPosts();
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete post
  const handleDelete = async (id) => {
    if (!window.confirm(t('modals.deleteConfirm'))) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/blog/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error(t('errors.deleteFailed'));
      
      fetchPosts();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      image_url: ''
    });
    setCurrentPost(null);
  };

  // Open modal for editing a post
  const handleEdit = (post) => {
    setCurrentPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      image_url: post.image_url || ''
    });
    setIsEditing(true);
    setShowModal(true);
  };

  // Open modal for creating a new post
  const handleNewPost = () => {
    resetForm();
    setIsEditing(false);
    setShowModal(true);
  };


  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{t('title')}</h2>
        <Button 
          variant="primary" 
          onClick={handleNewPost}
          disabled={loading}
        >
          <Plus className="me-1" /> {t('buttons.newPost')}
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading && !posts.length ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">{t('loading')}</span>
          </Spinner>
        </div>
      ) : (
        <div className="blog-list">
          {posts.map(post => (
            <Card key={post.id} className="mb-3">
              {post.image_url && (
                <Card.Img 
                  variant="top" 
                  src={post.image_url} 
                  alt={post.title}
                  style={{ maxHeight: '200px', objectFit: 'cover' }}
                />
              )}
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <Card.Title>{post.title}</Card.Title>
                  <div>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="me-2"
                      onClick={() => handleEdit(post)}
                      disabled={loading}
                      title={t('buttons.edit')}
                    >
                      <Pencil />
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                      disabled={loading}
                      title={t('buttons.delete')}
                    >
                      <Trash />
                    </Button>
                  </div>
                </div>
                <Card.Text className="text-muted small mb-2">
                  {t('post.postedOn', { date: formatDate(post.created_at, i18n.language) })}
                  {post.updated_at && ` • ${t('post.updatedOn', { date: formatDate(post.updated_at, i18n.language) })}`}
                </Card.Text>
                <Card.Text>
                  {post.content.substring(0, 200)}
                  {post.content.length > 200 && (
                    <span>{t('post.readMore')}</span>
                  )}
                </Card.Text>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? t('modals.editPost') : t('modals.newPost')}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>{t('modals.form.title')}</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>{t('modals.form.imageUrl')}</Form.Label>
              <Form.Control
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder={t('modals.form.imagePlaceholder')}
              />
              {formData.image_url && (
                <div className="mt-2">
                  <img 
                    src={formData.image_url} 
                    alt={t('modals.previewAlt')} 
                    style={{ maxHeight: '150px', maxWidth: '100%' }}
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>{t('modals.form.content')}</Form.Label>
              <Form.Control
                as="textarea"
                name="content"
                rows={8}
                value={formData.content}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => setShowModal(false)}
              disabled={loading}
            >
              {t('buttons.cancel')}
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={loading}
            >
              {loading ? t('buttons.saving') : t('buttons.save')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminBlog;
