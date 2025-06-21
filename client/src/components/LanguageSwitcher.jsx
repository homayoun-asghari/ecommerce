import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { languages } from '../i18n';
import { Form } from 'react-bootstrap';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  // Set default language to English if not set
  useEffect(() => {
    const savedLang = localStorage.getItem('i18nextLng');
    if (!savedLang) {
      i18n.changeLanguage('en');
    }
  }, [i18n]);

  return (
    <Form.Select 
      aria-label="Select language"
      value={currentLang}
      onChange={(e) => changeLanguage(e.target.value)}
      style={{
        cursor: 'pointer',
        padding: '0.375rem 2.25rem 0.375rem 0.75rem',
        borderColor: '#dee2e6',
        borderRadius: '0.25rem',
        backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3e%3cpath fill=\'none\' stroke=\'%23343a40\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'m2 5 6 6 6-6\'/%3e%3c/svg%3e")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.75rem center',
        backgroundSize: '16px 12px',
        appearance: 'none',
        width: 'auto',
        display: 'inline-block',
        fontSize: '0.875rem',
        maxWidth: '120px'
      }}
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.name}
        </option>
      ))}
    </Form.Select>
  );
}

export default LanguageSwitcher;
