'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { dictionaries, Language, Dictionary } from './dictionaries';

interface LanguageContextType {
  language: Language;
  dictionary: Dictionary;
  setLanguage: (lang: Language) => void;
  dir: 'rtl' | 'ltr';
}

const defaultLanguage: Language = 'ar';

const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  dictionary: dictionaries[defaultLanguage],
  setLanguage: () => {},
  dir: 'rtl',
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);

  useEffect(() => {
    // Try to get from local storage on mount
    const stored = localStorage.getItem('app-language') as Language;
    if (stored && (stored === 'ar' || stored === 'en')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [dir, language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        dictionary: dictionaries[language],
        setLanguage,
        dir,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
