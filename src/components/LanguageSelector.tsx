import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface LanguageSelectorProps {
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '' }) => {
  const { t, language, changeLanguage } = useTranslation();

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <input
            type="radio"
            id="lang-en"
            name="language"
            checked={language === 'en'}
            onChange={() => changeLanguage('en')}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="lang-en" className="text-sm text-gray-700 cursor-pointer">
            {t.english}
          </label>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="radio"
            id="lang-it"
            name="language"
            checked={language === 'it'}
            onChange={() => changeLanguage('it')}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="lang-it" className="text-sm text-gray-700 cursor-pointer">
            {t.italian}
          </label>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;