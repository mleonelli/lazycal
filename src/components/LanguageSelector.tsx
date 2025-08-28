import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface LanguageSelectorProps {
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '' }) => {
  const { t, language, changeLanguage } = useTranslation();

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-gray-500" />
        <select
          value={language}
          onChange={(e) => changeLanguage(e.target.value as 'en' | 'it')}
          className="text-sm border-none bg-transparent focus:ring-0 focus:outline-none text-gray-700 cursor-pointer"
        >
          <option value="en">{t.english}</option>
          <option value="it">{t.italian}</option>
        </select>
      </div>
    </div>
  );
};

export default LanguageSelector;