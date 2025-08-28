import { useState, useEffect } from 'react';
import { translations, Translation } from '../i18n/translations';

type Language = 'en' | 'it';

const STORAGE_KEY = 'lazycal_language';

export const useTranslation = () => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && (saved === 'en' || saved === 'it')) {
      return saved as Language;
    }
    // Detect browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('it')) {
      return 'it';
    }
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const t = translations[language];

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  const getMonthName = (monthIndex: number): string => {
    const monthNames = [
      t.january, t.february, t.march, t.april, t.may, t.june,
      t.july, t.august, t.september, t.october, t.november, t.december
    ];
    return monthNames[monthIndex];
  };

  const getDayNames = (): string[] => {
    return [t.sun, t.mon, t.tue, t.wed, t.thu, t.fri, t.sat];
  };

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', options);
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString(language === 'it' ? 'it-IT' : 'en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return {
    t,
    language,
    changeLanguage,
    getMonthName,
    getDayNames,
    formatDate,
    formatTime,
  };
};