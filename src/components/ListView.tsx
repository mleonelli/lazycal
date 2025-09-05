import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, ExternalLink, Edit2, Trash2, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { EventInstance } from '../types/Event';
import { eventService } from '../services/EventService';

interface ListViewProps {
  onEventClick: (eventId: string) => void;
  onDeleteEvent: (eventId: string) => void;
}

const ListView: React.FC<ListViewProps> = ({ onEventClick, onDeleteEvent }) => {
  const { t, getMonthName, formatDate, formatTime } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [eventInstances, setEventInstances] = useState<EventInstance[]>([]);
  const [loading, setLoading] = useState(true);
  
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
    setLoading(true);
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    try {
      const instances = await eventService.getEventInstances(startOfMonth, endOfMonth);
      setEventInstances(instances);
    } catch (error) {
      console.error('Error loading event instances:', error);
    } finally {
      setLoading(false);
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

  const groupEventsByDate = (instances: EventInstance[]) => {
    const groups: { [key: string]: EventInstance[] } = {};
    
    instances.forEach(instance => {
      const dateKey = instance.instanceDate.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(instance);
    });

    return Object.entries(groups).sort(([a], [b]) => 
      new Date(a).getTime() - new Date(b).getTime()
    );
  };

  const handleDelete = async (eventId: string) => {
    if (window.confirm(t.deleteConfirmation)) {
      try {
        await onDeleteEvent(eventId);
        loadEventInstances(); // Reload the list
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">{t.loadingEvents}</div>
        </div>
      </div>
    );
  }

  const groupedEvents = groupEventsByDate(eventInstances);

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

      {/* List Header */}
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
            {t.thisMonth}
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Events List */}
      {groupedEvents.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noEventsThisMonth}</h3>
          <p className="text-gray-500">{t.addFirstEvent}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedEvents.map(([dateString, instances]) => (
            <div key={dateString} className="border-l-4 border-blue-500 pl-3 sm:pl-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                {formatDate(new Date(dateString))}
              </h3>
              
              <div className="space-y-2 sm:space-y-3">
                {instances.map((instance, index) => (
                  <div
                    key={`${instance.event.id}-${index}`}
                    className="bg-gray-50 rounded-lg p-3 sm:p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                          {instance.event.title}
                        </h4>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {instance.instanceDate.toLocaleDateString()}
                              {instance.instanceEnd && (
                                <> - {instance.instanceEnd.toLocaleDateString()}</>
                              )}
                            </span>
                          </div>
                          
                          {instance.event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>
                                {instance.event.location.name || instance.event.location.address}
                              </span>
                            </div>
                          )}
                        </div>

                        {instance.event.description && (
                          <p className="text-gray-700 text-sm mb-2">
                            {instance.event.description}
                          </p>
                        )}

                        {instance.event.url && (
                          <a
                            href={instance.event.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {t.visitEvent}
                          </a>
                        )}
                      </div>

                      <div className="flex gap-2 sm:ml-4 justify-end sm:justify-start">
                        <button
                          onClick={() => onEventClick(instance.event.id)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors touch-manipulation"
                          title={t.editEvent}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(instance.event.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-manipulation"
                          title={t.deleteEvent}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListView;