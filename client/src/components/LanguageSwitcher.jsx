import React, { useEffect } from 'react';
import { MenuItem, Select } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
];

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const handleChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
  };

  // Set default language to English if not set
  useEffect(() => {
    const savedLang = localStorage.getItem('i18nextLng');
    if (!savedLang) {
      i18n.changeLanguage('en');
    }
  }, [i18n]);

  return (
    <Select
      value={currentLang || 'en'}
      onChange={(e) => handleChange(e.target.value)}
      size="small"
      variant="outlined"
      sx={{
        minWidth: 120,
        color: 'inherit',
        '& .MuiSelect-select': {
          padding: '6px 32px 6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'transparent',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: 'rgba(255, 255, 255, 0.23)',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: 'rgba(255, 255, 255, 0.5)',
        },
        '& .MuiSelect-icon': {
          color: 'inherit',
        },
        '& .MuiPaper-root': {
          backgroundColor: 'background.paper',
          color: 'text.primary',
        },
      }}
      MenuProps={{
        PaperProps: {
          sx: {
            bgcolor: 'background.paper',
            '& .MuiMenuItem-root': {
              display: 'flex',
              gap: '8px',
              padding: '8px 16px',
            },
          },
        },
      }}
    >
      {languages.map((lang) => (
        <MenuItem key={lang.code} value={lang.code}>
          <span>{lang.flag}</span>
          <span>{lang.name}</span>
        </MenuItem>
      ))}
    </Select>
  );
}

export default LanguageSwitcher;
