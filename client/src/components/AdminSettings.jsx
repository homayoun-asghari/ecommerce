import React, { useState, useEffect } from 'react';
import { Button, Form, Tabs, Tab, Spinner, Alert, Card } from 'react-bootstrap';
import { Gear, FileEarmarkText, Save, ExclamationTriangle } from 'react-bootstrap-icons';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // General settings state
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    siteTitle: '',
    contactEmail: '',
    itemsPerPage: 10
  });

  // Documents state
  const [documents, setDocuments] = useState({
    terms: { id: null, content: '' },
    privacy: { id: null, content: '' },
    about: { id: null, content: '' }
  });

  // Email templates state
  const [emailTemplates, setEmailTemplates] = useState({
    welcome: { subject: '', content: '' },
    orderConfirmation: { subject: '', content: '' },
    passwordReset: { subject: '', content: '' }
  });

  // Fetch settings and documents
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch settings
        const settingsRes = await fetch('http://localhost:5050/admin/settings');
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          // The backend already returns an object with key-value pairs
          setSettings(prev => ({
            ...prev,
            maintenanceMode: settingsData.maintenanceMode || false,
            siteTitle: settingsData.siteTitle || '',
            contactEmail: settingsData.contactEmail || '',
            itemsPerPage: settingsData.itemsPerPage || 10
          }));
        }

        // Fetch documents
        const docsRes = await fetch('http://localhost:5050/admin/documents');
        if (docsRes.ok) {
          const docsData = await docsRes.json();
          const docsObj = {};
          docsData.forEach(doc => {
            docsObj[doc.type] = { id: doc.id, content: doc.content };
          });
          setDocuments(prev => ({ ...prev, ...docsObj }));
        }

      } catch (err) {
        setError('Failed to load settings. Please try again.');
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle settings change
  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle document content change
  const handleDocumentChange = (type, content) => {
    setDocuments(prev => ({
      ...prev,
      [type]: { ...prev[type], content }
    }));
  };

  // Handle email template change
  const handleEmailTemplateChange = (template, field, value) => {
    setEmailTemplates(prev => ({
      ...prev,
      [template]: {
        ...prev[template],
        [field]: value
      }
    }));
  };

  // Save settings
  const saveSettings = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Convert settings to array of {key, value} objects
      const settingsToSave = [
        { key: 'maintenanceMode', value: settings.maintenanceMode },
        { key: 'siteTitle', value: settings.siteTitle },
        { key: 'contactEmail', value: settings.contactEmail },
        { key: 'itemsPerPage', value: settings.itemsPerPage }
      ];

      const response = await fetch('http://localhost:5050/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsToSave)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }
      
      setSuccess('Settings saved successfully');
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save settings. Please try again.');
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  // Save document
  const saveDocument = async (type) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const doc = documents[type];
      
      const response = await fetch('http://localhost:5050/admin/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          content: doc.content
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to save ${type}`);
      }
      
      const savedDoc = await response.json();
      setDocuments(prev => ({
        ...prev,
        [type]: { ...prev[type], id: savedDoc.id }
      }));
      
      const typeName = type === 'terms' ? 'Terms and Conditions' : 
                      type === 'privacy' ? 'Privacy Policy' : 'About Us';
      
      setSuccess(`${typeName} saved successfully`);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || `Failed to save ${type}. Please try again.`);
      console.error(`Error saving ${type}:`, err);
    } finally {
      setSaving(false);
    }
  };

  // Save email template
  const saveEmailTemplate = async (template) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const templateData = emailTemplates[template];
      
      const response = await fetch('http://localhost:5050/admin/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template,
          subject: templateData.subject,
          content: templateData.content
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to save ${template} template`);
      }
      
      const templateName = template === 'welcome' ? 'Welcome email' : 
                         template === 'orderConfirmation' ? 'Order confirmation email' : 
                         'Password reset email';
      
      setSuccess(`${templateName} template saved successfully`);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || `Failed to save template. Please try again.`);
      console.error(`Error saving ${template} template:`, err);
    } finally {
      setSaving(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="p-3">
      <h2 className="mb-4">
        <Gear className="me-2" />
        Settings
      </h2>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="general" title="General">
          <Card className="mb-4">
            <Card.Body>
              <h5 className="mb-4">Site Settings</h5>
              
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="maintenance-mode"
                  label="Maintenance Mode"
                  checked={settings.maintenanceMode || false}
                  onChange={handleSettingChange}
                  name="maintenanceMode"
                />
                <Form.Text className="text-muted">
                  When enabled, only administrators can access the site.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Site Title</Form.Label>
                <Form.Control
                  type="text"
                  name="siteTitle"
                  value={settings.siteTitle || ''}
                  onChange={handleSettingChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Contact Email</Form.Label>
                <Form.Control
                  type="email"
                  name="contactEmail"
                  value={settings.contactEmail || ''}
                  onChange={handleSettingChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Items Per Page</Form.Label>
                <Form.Select
                  name="itemsPerPage"
                  value={settings.itemsPerPage || 10}
                  onChange={handleSettingChange}
                >
                  {[5, 10, 20, 30, 50, 100].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button 
                  variant="primary" 
                  onClick={saveSettings}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Tab>


        <Tab eventKey="documents" title="Documents">
          <Card className="mb-4">
            <Card.Body>
              <h5 className="mb-4">Legal Documents</h5>
              
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6>Terms and Conditions</h6>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => saveDocument('terms')}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
                <Form.Control
                  as="textarea"
                  rows={10}
                  value={documents.terms?.content || ''}
                  onChange={(e) => handleDocumentChange('terms', e.target.value)}
                  placeholder="Enter terms and conditions..."
                />
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6>Privacy Policy</h6>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => saveDocument('privacy')}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
                <Form.Control
                  as="textarea"
                  rows={10}
                  value={documents.privacy?.content || ''}
                  onChange={(e) => handleDocumentChange('privacy', e.target.value)}
                  placeholder="Enter privacy policy..."
                />
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6>About Us</h6>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => saveDocument('about')}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
                <Form.Control
                  as="textarea"
                  rows={10}
                  value={documents.about?.content || ''}
                  onChange={(e) => handleDocumentChange('about', e.target.value)}
                  placeholder="Enter about us content..."
                />
              </div>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="email" title="Email Templates">
          <Card className="mb-4">
            <Card.Body>
              <h5 className="mb-4">Email Templates</h5>
              
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6>Welcome Email</h6>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => saveEmailTemplate('welcome')}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
                <Form.Group className="mb-3">
                  <Form.Label>Subject</Form.Label>
                  <Form.Control
                    type="text"
                    value={emailTemplates.welcome.subject || ''}
                    onChange={(e) => handleEmailTemplateChange('welcome', 'subject', e.target.value)}
                    placeholder="Welcome to our platform!"
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Content</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={8}
                    value={emailTemplates.welcome.content || ''}
                    onChange={(e) => handleEmailTemplateChange('welcome', 'content', e.target.value)}
                    placeholder="Welcome {name}, thank you for joining our platform!"
                  />
                  <Form.Text className="text-muted">
                    Use {'{name}'} to insert the user's name.
                  </Form.Text>
                </Form.Group>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6>Order Confirmation</h6>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => saveEmailTemplate('orderConfirmation')}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
                <Form.Group className="mb-3">
                  <Form.Label>Subject</Form.Label>
                  <Form.Control
                    type="text"
                    value={emailTemplates.orderConfirmation.subject || ''}
                    onChange={(e) => handleEmailTemplateChange('orderConfirmation', 'subject', e.target.value)}
                    placeholder="Your Order #{orderNumber}"
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Content</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={8}
                    value={emailTemplates.orderConfirmation.content || ''}
                    onChange={(e) => handleEmailTemplateChange('orderConfirmation', 'content', e.target.value)}
                    placeholder="Hello {name}, thank you for your order!"
                  />
                  <Form.Text className="text-muted">
                    Available variables: {'{name}'}, {'{orderNumber}'}, {'{orderTotal}'}
                  </Form.Text>
                </Form.Group>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6>Password Reset</h6>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => saveEmailTemplate('passwordReset')}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
                <Form.Group className="mb-3">
                  <Form.Label>Subject</Form.Label>
                  <Form.Control
                    type="text"
                    value={emailTemplates.passwordReset.subject || ''}
                    onChange={(e) => handleEmailTemplateChange('passwordReset', 'subject', e.target.value)}
                    placeholder="Reset Your Password"
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Content</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={8}
                    value={emailTemplates.passwordReset.content || ''}
                    onChange={(e) => handleEmailTemplateChange('passwordReset', 'content', e.target.value)}
                    placeholder="Hello {name}, click the link below to reset your password: {resetLink}"
                  />
                  <Form.Text className="text-muted">
                    Use {'{name}'} for the user's name and {'{resetLink}'} for the password reset link.
                  </Form.Text>
                </Form.Group>
              </div>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
