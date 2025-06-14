import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { FaReply, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import {useUser} from "../contexts/UserContext";

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [success, setSuccess] = useState('');
  const {user} = useUser();
  const userId = user?.data?.id;

  // Fetch all messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('http://localhost:5050/admin/messages');
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        const { data } = await response.json();
        // Map the status field to replied boolean for the frontend
        const formattedMessages = data.map(msg => ({
          ...msg,
          replied: msg.status === 'resolved'
        }));
        setMessages(formattedMessages);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  // Handle reply submission
  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      const response = await fetch('http://localhost:5050/admin/messages/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId: currentMessage.id,
          reply: replyContent
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reply');
      }

      // Update the message in the list
      setMessages(messages.map(msg => 
        msg.id === currentMessage.id 
          ? { 
              ...msg, 
              status: 'resolved',
              response_text: replyContent,
              replied: true,
              responded_at: new Date().toISOString()
            } 
          : msg
      ));

      setSuccess('Reply sent successfully!');
      setShowReplyModal(false);
      setReplyContent('');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Handle message deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        const response = await fetch(`http://localhost:5050/admin/messages/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete message');
        }

        // Remove the message from the list
        setMessages(messages.filter(msg => msg.id !== id));
        setSuccess('Message deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) {
    return <div className="text-center my-5">Loading messages...</div>;
  }

  if (error) {
    return <Alert variant="danger" className="m-3">Error: {error}</Alert>;
  }

  return (
    <div className="p-3">
      <h2 className="mb-4">Customer Messages</h2>
      
      {success && <Alert variant="success">{success}</Alert>}
      
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Subject</th>
              <th>Message</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {messages.length > 0 ? (
              messages.map((message, index) => (
                <tr key={message.id}>
                  <td>{index + 1}</td>
                  <td>{message.name}</td>
                  <td>{message.email}</td>
                  <td>{message.subject || 'General Inquiry'}</td>
                  <td className="text-truncate" style={{ maxWidth: '200px' }} title={message.message}>
                    {message.message}
                  </td>
                  <td>{formatDate(message.created_at)}</td>
                  <td>
                    {message.status === 'resolved' ? (
                      <Badge bg="success">Replied</Badge>
                    ) : message.status === 'in-progress' ? (
                      <Badge bg="info">In Progress</Badge>
                    ) : message.status === 'spam' ? (
                      <Badge bg="secondary">Spam</Badge>
                    ) : (
                      <Badge bg="warning" text="dark">New</Badge>
                    )}
                  </td>
                  <td>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="me-2"
                      onClick={() => {
                        setCurrentMessage(message);
                        setShowReplyModal(true);
                      }}
                      disabled={message.replied}
                    >
                      <FaReply />
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDelete(message.id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">No messages found</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Reply Modal */}
      <Modal show={showReplyModal} onHide={() => setShowReplyModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reply to {currentMessage?.name}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleReplySubmit}>
          <Modal.Body>
            <div className="mb-3">
              <p><strong>Subject:</strong> {currentMessage?.subject}</p>
              <p><strong>Message:</strong> {currentMessage?.message}</p>
            </div>
            <Form.Group className="mb-3">
              <Form.Label>Your Reply</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowReplyModal(false)}>
              <FaTimes className="me-1" /> Cancel
            </Button>
            <Button variant="primary" type="submit">
              <FaCheck className="me-1" /> Send Reply
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminMessages;
