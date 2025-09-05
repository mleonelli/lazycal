import React from 'react';
import { Database, Cloud, ExternalLink } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export type StorageMode = 'local' | 'googlesheets';

interface DataStorageSelectorProps {
  currentMode: StorageMode;
  onModeChange: (mode: StorageMode) => void;
  isGoogleSheetsSignedIn: boolean;
  onGoogleSheetsSignIn: () => void;
  onGoogleSheetsSignOut: () => void;
  googleSheetsUrl?: string | null;
  className?: string;
}

const DataStorageSelector: React.FC<DataStorageSelectorProps> = ({
  currentMode,
  onModeChange,
  isGoogleSheetsSignedIn,
  onGoogleSheetsSignIn,
  onGoogleSheetsSignOut,
  googleSheetsUrl,
  className = '',
}) => {
  const { t } = useTranslation();

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.dataStorage}</h3>
      
      <div className="space-y-3">
        {/* Local Storage Option */}
        <div className="flex items-center justify-between p-3 border rounded-lg gap-3">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <div className="font-medium text-gray-900">{t.localStorage}</div>
              <div className="text-sm text-gray-500">{t.localStorageDescription}</div>
            </div>
          </div>
          <input
            type="radio"
            name="storage"
            checked={currentMode === 'local'}
            onChange={() => onModeChange('local')}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
          />
        </div>

        {/* Google Sheets Option */}
        <div className="flex items-center justify-between p-3 border rounded-lg gap-3">
          <div className="flex items-center gap-3">
            <Cloud className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <div className="font-medium text-gray-900">{t.googleSheets}</div>
              <div className="text-sm text-gray-500">{t.googleSheetsDescription}</div>
              {isGoogleSheetsSignedIn && (
                <div className="text-xs text-green-600 mt-1">{t.signedIn}</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isGoogleSheetsSignedIn && googleSheetsUrl && (
              <a
                href={googleSheetsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-gray-500 hover:text-blue-600"
                title={t.openSpreadsheet}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <input
              type="radio"
              name="storage"
              checked={currentMode === 'googlesheets'}
              onChange={() => onModeChange('googlesheets')}
              disabled={!isGoogleSheetsSignedIn}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Google Sheets Authentication */}
        {currentMode === 'googlesheets' && (
          <div className="pl-4 sm:pl-8 space-y-2">
            {!isGoogleSheetsSignedIn ? (
              <button
                onClick={onGoogleSheetsSignIn}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm touch-manipulation"
              >
                {t.signInWithGoogle}
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={onGoogleSheetsSignOut}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm touch-manipulation"
                >
                  {t.signOut}
                </button>
                {googleSheetsUrl && (
                  <a
                    href={googleSheetsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm inline-flex items-center justify-center gap-2 touch-manipulation"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {t.viewSpreadsheet}
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataStorageSelector;