import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import it from './locales/it.json';
import en from './locales/en.json';
import es from './locales/es.json';
import { LINGUA_DI_RISERVA, linguaDispositivo } from './lingue';

const risorse = { it: { translation: it }, en: { translation: en }, es: { translation: es } };

i18n.use(initReactI18next).init({
  resources: risorse,
  lng: linguaDispositivo(),
  fallbackLng: LINGUA_DI_RISERVA,
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

export default i18n;
