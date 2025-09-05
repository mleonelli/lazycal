import React, { useState, useRef } from 'react';
import { Download, Upload, AlertTriangle, Calendar } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { eventService } from '../services/EventService';
import { Event } from '../types/Event';

const EXPORT_DATE_KEY = 'lazycal_last_export_date';
const EXPORT_WARNING_DAYS_KEY = 'lazycal_export_warning_days';
const DEFAULT_WARNING_DAYS = 30;

const ImportExportManager: React.FC = () => {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [warningDays, setWarningDays] = useState(() => {
    const saved = localStorage.getItem(EXPORT_WARNING_DAYS_KEY);
    return saved ? parseInt(saved) : DEFAULT_WARNING_DAYS;
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getLastExportDate = (): Date | null => {
    const saved = localStorage.getItem(EXPORT_DATE_KEY);
    return saved ? new Date(saved) : null;
  };

  const setLastExportDate = (date: Date): void => {
    localStorage.setItem(EXPORT_DATE_KEY, date.toISOString());
  };

  const getDaysSinceLastExport = (): number | null => {
    const lastExport = getLastExportDate();
    if (!lastExport) return null;
    
    const now = new Date();
    const diffTime = now.getTime() - lastExport.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const shouldShowWarning = (): boolean => {
    const daysSince = getDaysSinceLastExport();
    return daysSince !== null && daysSince >= warningDays;
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const events = await eventService.getEvents();
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        events: events,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lazycal-events-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setLastExportDate(new Date());
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const importData = JSON.parse(text);

      if (!importData.events || !Array.isArray(importData.events)) {
        throw new Error('Invalid file format');
      }

      // Validate and convert events
      const events: Event[] = importData.events.map((eventData: any) => ({
        ...eventData,
        date: {
          ...eventData.date,
          start: eventData.date.start ? new Date(eventData.date.start) : undefined,
          end: eventData.date.end ? new Date(eventData.date.end) : undefined,
        },
        recurrence: eventData.recurrence ? {
          ...eventData.recurrence,
          until: eventData.recurrence.until ? new Date(eventData.recurrence.until) : undefined,
        } : undefined,
        createdAt: new Date(eventData.createdAt),
        updatedAt: new Date(eventData.updatedAt),
      }));

      // Import events
      for (const eventData of events) {
        try {
          await eventService.createEvent(eventData);
        } catch (error) {
          console.error('Error importing event:', eventData.title, error);
        }
      }

      alert(`Successfully imported ${events.length} events.`);
      window.location.reload(); // Refresh to show imported events
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import failed. Please check the file format and try again.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleWarningDaysChange = (days: number) => {
    setWarningDays(days);
    localStorage.setItem(EXPORT_WARNING_DAYS_KEY, days.toString());
  };

  const lastExportDate = getLastExportDate();
  const daysSinceLastExport = getDaysSinceLastExport();
  const showWarning = shouldShowWarning();

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.importExport}</h3>
      
      <div className="space-y-4">
        {/* Export/Import Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 touch-manipulation"
          >
            <Download className="w-4 h-4" />
            {isExporting ? t.exporting : t.exportEvents}
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 touch-manipulation"
          >
            <Upload className="w-4 h-4" />
            {isImporting ? t.importing : t.importEvents}
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>

        {/* Export Status */}
        {lastExportDate && (
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>
              {t.lastExport}: {lastExportDate.toLocaleDateString()}
              {daysSinceLastExport !== null && (
                <span className="ml-1">({daysSinceLastExport} {t.daysAgo})</span>
              )}
            </span>
          </div>
        )}

        {/* Warning Configuration */}
        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.backupReminderDays}
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="number"
              min="1"
              max="365"
              value={warningDays}
              onChange={(e) => handleWarningDaysChange(parseInt(e.target.value) || DEFAULT_WARNING_DAYS)}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <span className="text-sm text-gray-600">{t.days}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {t.backupReminderDescription}
          </p>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• {t.exportDescription}</p>
          <p>• {t.importDescription}</p>
        </div>
      </div>
    </div>
  );
};

export default ImportExportManager;