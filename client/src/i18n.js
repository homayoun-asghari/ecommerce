import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

export const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
];

// Log when translations are loaded
i18n.on('languageChanged', (lng) => {
  console.log(`Language changed to: ${lng}`);
  console.log('Current language:', i18n.language);
  console.log('Available languages:', i18n.languages);
  console.log('Available namespaces:', i18n.options.ns);
  
  // Log available translation keys for debugging
  ['common', 'search'].forEach(ns => {
    const resources = i18n.getResourceBundle(lng, ns);
    console.log(`Available keys in ${ns}:`, resources ? Object.keys(resources) : 'No resources found');
  });
});

i18n
  // Load translation using http -> see /public/locales
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  .on('initialized', () => {
    console.log('i18n initialized');
    console.log('Current language:', i18n.language);
    console.log('Available languages:', i18n.languages);
  })
  .on('loaded', (loaded) => {
    console.log('i18n loaded', loaded);
  })
  .on('failedLoading', (lng, ns, msg) => {
    console.error(`Failed loading ${lng} ${ns}:`, msg);
  })
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    supportedLngs: languages.map(lang => lang.code),
    defaultNS: 'common',
    fallbackNS: 'common',
    ns: ['common', 'products', 'cart', 'navigation', 'footer', 'categories', 'contact', 'about', 'carousel', 'search', 'searchResults', 'filters', 'features', 'account', 'navbar'],
    interpolation: {
      escapeValue: false, // Not needed for React as it escapes by default
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    // Configure language detection
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    // React i18next configuration
    react: {
      useSuspense: false, // Disable Suspense to avoid issues with React 18
    }
  });

export default i18n;
