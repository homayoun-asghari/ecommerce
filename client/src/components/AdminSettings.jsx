import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, Tabs, Tab, Spinner, Alert, Card } from 'react-bootstrap';
import { Gear } from 'react-bootstrap-icons';
import { API_BASE_URL } from '../config';

const AdminSettings = () => {
  const { t } = useTranslation('adminSettings');
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
    privacy_policy: { id: null, content: '' }
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
        const settingsRes = await fetch(`${API_BASE_URL}/admin/settings`);
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
        const docsRes = await fetch(`${API_BASE_URL}/admin/documents`);
        if (docsRes.ok) {
          const docsData = await docsRes.json();
          const docsObj = { terms: { content: '' }, privacy_policy: { content: '' } };
          
          // Map document types to our state structure
          docsData.forEach(doc => {
            if (doc.type === 'terms' || doc.type === 'privacy_policy') {
              docsObj[doc.type] = { id: doc.id, content: doc.content };
            }
          });
          
          setDocuments(docsObj);
        }

      } catch (err) {
        setError(t('common.error.loadFailed'));
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t]);

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

      const response = await fetch(`${API_BASE_URL}/admin/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsToSave)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('common.error.saveFailed'));
      }
      
      setSuccess(t('common.success'));
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || t('common.error.saveFailed'));
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
      
      const response = await fetch(`${API_BASE_URL}/admin/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          content: doc.content
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('common.error.documentSaveFailed'));
      }
      
      const savedDoc = await response.json();
      setDocuments(prev => ({
        ...prev,
        [type]: { ...prev[type], id: savedDoc.id }
      }));
      
      setSuccess(t(`documents.${type}.title`) + ' ' + t('common.saveSuccess'));
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || t('common.error.documentSaveFailed'));
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
      
      const response = await fetch(`${API_BASE_URL}/admin/email-templates`, {
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
        throw new Error(errorData.error || t('common.error.templateSaveFailed'));
      }
      
      setSuccess(t(`emailTemplates.${template}.title`) + ' ' + t('common.saveSuccess'));
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || t('common.error.templateSaveFailed'));
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
          <span className="visually-hidden">{t('common.loading')}</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="p-3">
      <h2 className="mb-4">
        <Gear className="me-2" />
        {t('title')}
      </h2>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="general" title={t('tabs.general')}>
          <Card className="mb-4">
            <Card.Body>
              <h5 className="mb-4">{t('general.title')}</h5>
              
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="maintenance-mode"
                  label={t('general.maintenanceMode.label')}
                  checked={settings.maintenanceMode || false}
                  onChange={handleSettingChange}
                  name="maintenanceMode"
                />
                <Form.Text className="text-muted">
                  {t('general.maintenanceMode.help')}
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>{t('general.siteTitle')}</Form.Label>
                <Form.Control
                  type="text"
                  name="siteTitle"
                  value={settings.siteTitle || ''}
                  onChange={handleSettingChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>{t('general.contactEmail')}</Form.Label>
                <Form.Control
                  type="email"
                  name="contactEmail"
                  value={settings.contactEmail || ''}
                  onChange={handleSettingChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>{t('general.itemsPerPage')}</Form.Label>
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
                  {saving ? t('common.saving') : t('general.saveButton')}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Tab>


        <Tab eventKey="documents" title={t('tabs.documents')}>
          <Card className="mb-4">
            <Card.Body>
              <h5 className="mb-4">{t('documents.title')}</h5>
              
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6>{t('documents.terms.title')}</h6>
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
                  placeholder={t('documents.terms.placeholder')}
                />
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6>{t('documents.privacyPolicy.title')}</h6>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => saveDocument('privacy_policy')}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
                <Form.Control
                  as="textarea"
                  rows={10}
                  value={documents.privacy_policy?.content || ''}
                  onChange={(e) => handleDocumentChange('privacy_policy', e.target.value)}
                  placeholder={t('documents.privacyPolicy.placeholder')}
                />
              </div>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="email" title={t('tabs.email')}>
          <Card className="mb-4">
            <Card.Body>
              <h5 className="mb-4">{t('emailTemplates.title')}</h5>
              
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6>{t('emailTemplates.welcome.title')}</h6>
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
                    placeholder={t('emailTemplates.welcome.subjectPlaceholder')}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Content</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={8}
                    value={emailTemplates.welcome.content || ''}
                    onChange={(e) => handleEmailTemplateChange('welcome', 'content', e.target.value)}
                    placeholder={t('emailTemplates.welcome.contentPlaceholder')}
                  />
                  <Form.Text className="text-muted">
                    {t('emailTemplates.welcome.help')}
                  </Form.Text>
                </Form.Group>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6>{t('emailTemplates.orderConfirmation.title')}</h6>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => saveEmailTemplate('orderConfirmation')}
                    disabled={saving}
                  >
                    {saving ? t('common.saving') : t('common.save')}
                  </Button>
                </div>
                <Form.Group className="mb-3">
                  <Form.Label>{t('emailTemplates.welcome.subject')}</Form.Label>
                  <Form.Control
                    type="text"
                    value={emailTemplates.orderConfirmation.subject || ''}
                    onChange={(e) => handleEmailTemplateChange('orderConfirmation', 'subject', e.target.value)}
                    placeholder={t('emailTemplates.orderConfirmation.subjectPlaceholder')}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>{t('emailTemplates.welcome.content')}</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={8}
                    value={emailTemplates.orderConfirmation.content || ''}
                    onChange={(e) => handleEmailTemplateChange('orderConfirmation', 'content', e.target.value)}
                    placeholder={t('emailTemplates.orderConfirmation.contentPlaceholder')}
                  />
                  <Form.Text className="text-muted">
                    {t('emailTemplates.orderConfirmation.help')}
                  </Form.Text>
                </Form.Group>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6>{t('emailTemplates.passwordReset.title')}</h6>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => saveEmailTemplate('passwordReset')}
                    disabled={saving}
                  >
                    {saving ? t('common.saving') : t('common.save')}
                  </Button>
                </div>
                <Form.Group className="mb-3">
                  <Form.Label>{t('emailTemplates.welcome.subject')}</Form.Label>
                  <Form.Control
                    type="text"
                    value={emailTemplates.passwordReset.subject || ''}
                    onChange={(e) => handleEmailTemplateChange('passwordReset', 'subject', e.target.value)}
                    placeholder={t('emailTemplates.passwordReset.subjectPlaceholder')}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>{t('emailTemplates.welcome.content')}</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={8}
                    value={emailTemplates.passwordReset.content || ''}
                    onChange={(e) => handleEmailTemplateChange('passwordReset', 'content', e.target.value)}
                    placeholder={t('emailTemplates.passwordReset.contentPlaceholder')}
                  />
                  <Form.Text className="text-muted">
                    {t('emailTemplates.passwordReset.help')}
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
