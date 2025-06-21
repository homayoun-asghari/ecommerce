import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { FaReply, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import {useUser} from "../contexts/UserContext";
import { API_BASE_URL } from "../config";

const AdminMessages = () => {
  const { t } = useTranslation('adminMessages');
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
        const response = await fetch(`${API_BASE_URL}/admin/messages`);
        if (!response.ok) {
          throw new Error(t('errors.fetchFailed'));
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
  }, [t]);

  // Handle reply submission
  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error(t('errors.notAuthenticated'));
      }

      const response = await fetch(`${API_BASE_URL}/admin/messages/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messageId: currentMessage.id,
          reply: replyContent,
          adminId: userId // Hardcoded admin ID - replace with actual admin ID later
        }),
      });

      if (!response.ok) {
        throw new Error(t('errors.replyFailed'));
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

      setSuccess(t('alerts.replySuccess'));
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
    if (window.confirm(t('confirmations.deleteMessage'))) {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/messages/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(t('errors.deleteFailed'));
        }

        // Remove the message from the list
        setMessages(messages.filter(msg => msg.id !== id));
        setSuccess(t('alerts.deleteSuccess'));
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) {
    return <div className="text-center my-5">{t('loading')}</div>;
  }

  if (error) {
    return <Alert variant="danger" className="m-3">Error: {error}</Alert>;
  }

  return (
    <div className="p-3">
      <h2 className="mb-4">{t('title')}</h2>
      
      {success && <Alert variant="success">{success}</Alert>}
      
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>{t('table.headers.number')}</th>
              <th>{t('table.headers.name')}</th>
              <th>{t('table.headers.email')}</th>
              <th>{t('table.headers.subject')}</th>
              <th>{t('table.headers.message')}</th>
              <th>{t('table.headers.date')}</th>
              <th>{t('table.headers.status')}</th>
              <th>{t('table.headers.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {messages.length > 0 ? (
              messages.map((message, index) => (
                <tr key={message.id}>
                  <td>{index + 1}</td>
                  <td>{message.name}</td>
                  <td>{message.email}</td>
                  <td>{message.subject || t('table.subjectDefault')}</td>
                  <td className="text-truncate" style={{ maxWidth: '200px' }} title={message.message}>
                    {message.message}
                  </td>
                  <td>{formatDate(message.created_at)}</td>
                  <td>
                    {message.status === 'resolved' ? (
                      <Badge bg="success">{t('table.statuses.replied')}</Badge>
                    ) : message.status === 'in-progress' ? (
                      <Badge bg="info">{t('table.statuses.inProgress')}</Badge>
                    ) : message.status === 'spam' ? (
                      <Badge bg="secondary">{t('table.statuses.spam')}</Badge>
                    ) : (
                      <Badge bg="warning" text="dark">{t('table.statuses.new')}</Badge>
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
                <td colSpan="8" className="text-center">{t('noMessages')}</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Reply Modal */}
      <Modal show={showReplyModal} onHide={() => setShowReplyModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('modal.title', { name: currentMessage?.name })}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleReplySubmit}>
          <Modal.Body>
            <div className="mb-3">
              <p><strong>{t('modal.subject')}:</strong> {currentMessage?.subject}</p>
              <p><strong>{t('modal.originalMessage')}:</strong> {currentMessage?.message}</p>
            </div>
            <Form.Group className="mb-3">
              <Form.Label>{t('modal.replyLabel')}</Form.Label>
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
              <FaTimes className="me-1" /> {t('modal.cancel')}
            </Button>
            <Button variant="primary" type="submit">
              <FaCheck className="me-1" /> {t('modal.sendReply')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminMessages;
