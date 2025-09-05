import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Clock, ExternalLink, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { EventInstance } from '../types/Event';
import { eventService } from '../services/EventService';

interface CalendarProps {
  onEventClick: (eventId: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ onEventClick }) => {
  const { t, getMonthName, getDayNames, formatTime } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [eventInstances, setEventInstances] = useState<EventInstance[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventInstance | null>(null);
  
  // Backup warning logic
  const getLastExportDate = (): Date | null => {
    const saved = localStorage.getItem('lazycal_last_export_date');
    return saved ? new Date(saved) : null;
  };

  const getDaysSinceLastExport = (): number | null => {
    const lastExport = getLastExportDate();
    if (!lastExport) return null;
    
    const now = new Date();
    const diffTime = now.getTime() - lastExport.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const getWarningDays = (): number => {
    const saved = localStorage.getItem('lazycal_export_warning_days');
    return saved ? parseInt(saved) : 30;
  };

  const shouldShowWarning = (): boolean => {
    const daysSince = getDaysSinceLastExport();
    const warningDays = getWarningDays();
    return daysSince !== null && daysSince >= warningDays;
  };

  useEffect(() => {
    loadEventInstances();
  }, [currentDate]);

  const loadEventInstances = async () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    try {
      const instances = await eventService.getEventInstances(startOfMonth, endOfMonth);
      setEventInstances(instances);
    } catch (error) {
      console.error('Error loading event instances:', error);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const getEventsForDay = (date: Date) => {
    return eventInstances.filter(instance => {
      const instanceDate = new Date(instance.instanceDate);
      return instanceDate.toDateString() === date.toDateString();
    });
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const dayNames = getDayNames();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Backup Warning */}
      {shouldShowWarning() && (
        <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <strong>{t.backupWarning}</strong> {t.backupWarningMessage.replace('{days}', getDaysSinceLastExport()?.toString() || '0')}
          </div>
        </div>
      )}

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            {t.today}
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day Headers */}
        {dayNames.map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {getDaysInMonth().map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonthDay = isCurrentMonth(day);
          const isTodayDay = isToday(day);

          return (
            <div
              key={index}
              className={`min-h-[100px] p-2 border border-gray-100 ${
                isCurrentMonthDay ? 'bg-white' : 'bg-gray-50'
              } ${isTodayDay ? 'bg-blue-50 border-blue-200' : ''}`}
            >
              <div className={`text-sm font-medium mb-1 ${
                isCurrentMonthDay ? 'text-gray-900' : 'text-gray-400'
              } ${isTodayDay ? 'text-blue-600' : ''}`}>
                {day.getDate()}
              </div>
              
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map((instance, eventIndex) => (
                  <div
                    key={`${instance.event.id}-${eventIndex}`}
                    onClick={() => setSelectedEvent(instance)}
                    className="text-xs p-1 bg-blue-100 text-blue-800 rounded cursor-pointer hover:bg-blue-200 transition-colors truncate"
                  >
                    {instance.event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{dayEvents.length - 2} {t.more}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 pr-2">
                {selectedEvent.event.title}
              </h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600 text-xl touch-manipulation p-1"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  {selectedEvent.instanceDate.toLocaleDateString()}
                  {selectedEvent.instanceEnd && (
                    <> - {selectedEvent.instanceEnd.toLocaleDateString()}</>
                  )}
                </span>
              </div>

              {selectedEvent.event.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedEvent.event.location.name || selectedEvent.event.location.address}</span>
                </div>
              )}

              {selectedEvent.event.description && (
                <div className="text-sm text-gray-700">
                  {selectedEvent.event.description}
                </div>
              )}

              {selectedEvent.event.url && (
                <a
                  href={selectedEvent.event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t.visitEventPage}
                </a>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-6">
              <button
                onClick={() => onEventClick(selectedEvent.event.id)}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors touch-manipulation"
              >
                {t.editEvent}
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors touch-manipulation"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;