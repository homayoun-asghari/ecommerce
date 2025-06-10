import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector) // Detect browser or saved language
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          welcome: "Welcome",
          logout: "Log Out",
          // ...
        },
      },
      de: {
        translation: {
          welcome: "Willkommen",
          logout: "Abmelden",
        },
      },
      fa: {
        translation: {
          welcome: "خوش آمدید",
          logout: "خروج",
        },
      },
    },
  });

export default i18n;
