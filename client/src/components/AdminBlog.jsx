import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Card, Badge, Spinner, Alert } from 'react-bootstrap';
import { Pencil, Trash, Plus } from 'react-bootstrap-icons';
// Format date helper function
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const AdminBlog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [currentPost, setCurrentPost] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: ''
  });

  // Fetch all blog posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5050/admin/blog');
      if (!response.ok) throw new Error('Failed to fetch blog posts');
      const data = await response.json();
      setPosts(data.posts || []); // Set posts from the response data
    } catch (err) {
      setError(err.message);
      setPosts([]); // Ensure posts is always an array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

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
        ? `http://localhost:5050/admin/blog/${currentPost.id}`
        : 'http://localhost:5050/admin/blog';
      
      const method = currentPost ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save post');
      
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
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5050/admin/blog/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete post');
      
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
    setModalTitle('Edit Blog Post');
    setShowModal(true);
  };

  // Open modal for creating a new post
  const handleNewPost = () => {
    resetForm();
    setModalTitle('New Blog Post');
    setShowModal(true);
  };


  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Blog Management</h2>
        <Button 
          variant="primary" 
          onClick={handleNewPost}
          disabled={loading}
        >
          <Plus className="me-1" /> New Post
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading && !posts.length ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
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
                    >
                      <Pencil />
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                      disabled={loading}
                    >
                      <Trash />
                    </Button>
                  </div>
                </div>
                <Card.Text className="text-muted small mb-2">
                  Posted on {formatDate(post.created_at)}
                  {post.updated_at && ` • Updated ${formatDate(post.updated_at)}`}
                </Card.Text>
                <Card.Text>{post.content.substring(0, 200)}...</Card.Text>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Image URL (optional)</Form.Label>
              <Form.Control
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
              {formData.image_url && (
                <div className="mt-2">
                  <img 
                    src={formData.image_url} 
                    alt="Preview" 
                    style={{ maxHeight: '150px', maxWidth: '100%' }}
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
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
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Post'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminBlog;
