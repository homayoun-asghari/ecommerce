import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Form,
  Modal,
  Badge,
  ListGroup,
  InputGroup,
  FormControl,
  Spinner,
  Alert,
  ButtonGroup,
  Dropdown,
  Tab,
  Tabs,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap';
import { 
  BellFill, 
  Trash, 
  Envelope, 
  EnvelopeOpen, 
  Search, 
  Funnel, 
  XCircle,
  Star,
  StarFill,
  Plus,
  CheckCircle,
  ExclamationCircle
} from 'react-bootstrap-icons';

const AdminNotifications = () => {
  // State for notifications list
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetUsers: 'all', // 'all' or 'specific'
    userIds: ''
  });

  // Fetch notifications
  const fetchNotifications = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page,
        limit: pagination.limit,
        status: activeTab === 'all' ? '' : activeTab,
        search: searchTerm
      });

      const response = await fetch(`http://localhost:5050/admin/notifications?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      setNotifications(data.data);
      setPagination({
        ...pagination,
        page: data.pagination.page,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages
      });
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [activeTab, searchTerm]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
// In AdminNotifications.jsx
const handleCreateNotification = async (e) => {
  e.preventDefault();
  try {
    setLoading(true);
    
    const payload = {
      title: formData.title,
      message: formData.message,
      // Send empty array for global, or array of user IDs for specific
      userIds: formData.targetUsers === 'specific' 
        ? formData.userIds.split(',').map(id => id.trim()).filter(Boolean)
        : []
    };

    const response = await fetch('http://localhost:5050/admin/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create notification');
    }

    // Refresh notifications and reset form
    await fetchNotifications();
    setShowCreateModal(false);
    setFormData({
      title: '',
      message: '',
      targetUsers: 'all',
      userIds: ''
    });
  } catch (err) {
    console.error('Error:', err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  // Handle notification deletion
  const handleDeleteNotification = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:5050/admin/notifications/${selectedNotification.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      // Refresh notifications
      await fetchNotifications(pagination.page);
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle read status
  const toggleReadStatus = async (notification) => {
    try {
      const response = await fetch(`http://localhost:5050/admin/notifications/${notification.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: !notification.is_read })
      });

      if (!response.ok) {
        throw new Error('Failed to update notification status');
      }

      // Update local state
      setNotifications(notifications.map(n => 
        n.id === notification.id 
          ? { ...n, is_read: !n.is_read } 
          : n
      ));
    } catch (err) {
      console.error('Error updating notification status:', err);
      setError(err.message);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Notifications</h2>
        <Button 
          variant="primary" 
          onClick={() => setShowCreateModal(true)}
          className="d-flex align-items-center gap-2"
        >
          <Plus /> New Notification
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible className="mb-4">
          {error}
        </Alert>
      )}

      {/* Filters and Search */}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
            <div className="w-100">
              <InputGroup>
                <InputGroup.Text>
                  <Search />
                </InputGroup.Text>
                <FormControl
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button 
                    variant="outline-secondary" 
                    onClick={clearSearch}
                  >
                    <XCircle />
                  </Button>
                )}
              </InputGroup>
            </div>
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-0"
            >
              <Tab eventKey="all" title={
                <span>
                  <BellFill className="me-1" /> All
                </span>
              } />
              <Tab eventKey="unread" title={
                <span>
                  <Envelope className="me-1" /> Unread
                </span>
              } />
              <Tab eventKey="read" title={
                <span>
                  <EnvelopeOpen className="me-1" /> Read
                </span>
              } />
            </Tabs>
          </div>
        </Card.Body>
      </Card>

      {/* Notifications List */}
      <Card>
        <Card.Body className="p-0">
          {loading && notifications.length === 0 ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No notifications found</p>
            </div>
          ) : (
            <ListGroup variant="flush">
              {notifications.map((notification) => (
                <ListGroup.Item 
                  key={notification.id}
                  className={`p-3 ${!notification.is_read ? 'bg-success' : ''}`}
                  action
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="d-flex align-items-start flex-grow-1">
                      <div className="me-3">
                        <Button 
                          variant="link" 
                          className="p-0 me-2"
                          onClick={() => toggleReadStatus(notification)}
                          title={notification.is_read ? 'Mark as unread' : 'Mark as read'}
                        >
                          {notification.is_read ? (
                            <EnvelopeOpen className="text-muted" />
                          ) : (
                            <Envelope className="text-primary" />
                          )}
                        </Button>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center">
                          <h6 className="mb-0 me-2">
                            {notification.title}
                            {notification.is_important && (
                              <span className="ms-2 text-warning">
                                <StarFill size={14} />
                              </span>
                            )}
                          </h6>
                          <small className="text-muted">
                            {formatDate(notification.created_at)}
                          </small>
                        </div>
                        <p className="mb-0 mt-1">{notification.message}</p>
                        {notification.user_name && (
                          <small className="text-muted">
                            Sent to: {notification.user_name}
                            {notification.user_email && ` (${notification.user_email})`}
                          </small>
                        )}
                      </div>
                    </div>
                    <div className="d-flex">
                      <Button
                        variant="link"
                        className="text-danger p-0"
                        onClick={() => {
                          setSelectedNotification(notification);
                          setShowDeleteModal(true);
                        }}
                        title="Delete notification"
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center p-3 border-top">
              <div>
                Showing {notifications.length} of {pagination.total} notifications
              </div>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => fetchNotifications(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <div className="d-flex align-items-center px-3">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => fetchNotifications(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Create Notification Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Form onSubmit={handleCreateNotification}>
          <Modal.Header closeButton>
            <Modal.Title>Create New Notification</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter notification title"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Enter notification message"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Send to</Form.Label>
              <div className="d-flex gap-3">
                <Form.Check
                  type="radio"
                  id="allUsers"
                  label="All Users"
                  name="targetUsers"
                  value="all"
                  checked={formData.targetUsers === 'all'}
                  onChange={handleInputChange}
                />
                <Form.Check
                  type="radio"
                  id="specificUsers"
                  label="Specific Users"
                  name="targetUsers"
                  value="specific"
                  checked={formData.targetUsers === 'specific'}
                  onChange={handleInputChange}
                />
              </div>
              
              {formData.targetUsers === 'specific' && (
                <Form.Control
                  type="text"
                  placeholder="Enter user IDs separated by commas (e.g., 1, 2, 3)"
                  name="userIds"
                  value={formData.userIds}
                  onChange={handleInputChange}
                  className="mt-2"
                />
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Notification'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Notification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this notification? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteNotification} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminNotifications;
