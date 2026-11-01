import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem('disasteraid_lang');
      if (saved && translations[saved]) {
        return saved;
      }
    } catch (e) {
      // ignore localStorage errors
    }
    return DEFAULT_LANGUAGE;
  });

  useEffect(() => {
    try {
      localStorage.setItem('disasteraid_lang', currentLanguage);
      document.documentElement.lang = currentLanguage;
    } catch (e) {
      // ignore
    }
  }, [currentLanguage]);

  const changeLanguage = (langCode) => {
    if (translations[langCode]) {
      setCurrentLanguage(langCode);
    }
  };

  /**
   * Helper function to retrieve nested translated keys.
   * Usage: t('nav.home') or t('citizen.report.titleLabel')
   */
  const t = (path, fallback = '') => {
    if (!path) return fallback;

    const getNested = (obj, keyPath) => {
      return keyPath.split('.').reduce((acc, part) => {
        return acc && acc[part] !== undefined ? acc[part] : undefined;
      }, obj);
    };

    // 1. Try current language
    const currentDict = translations[currentLanguage];
    let val = getNested(currentDict, path);

    // 2. Fallback to English if not found
    if (val === undefined && currentLanguage !== 'en') {
      val = getNested(translations['en'], path);
    }

    // 3. Fallback to passed fallback or key path
    return val !== undefined ? val : fallback || path;
  };

  const activeLangMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) ||
    SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        changeLanguage,
        t,
        languages: SUPPORTED_LANGUAGES,
        activeLangMeta,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
