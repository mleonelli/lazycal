import React, { useState, useEffect } from 'react';
import { Save, X, MapPin, Calendar, Clock, Repeat, ExternalLink } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { Event, EventLocation, RecurrenceRule } from '../types/Event';
import { eventService } from '../services/EventService';
import { geolocationService } from '../services/GeolocationService';

interface EventFormProps {
  eventId?: string;
  onSave: () => void;
  onCancel: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ eventId, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    location: {
      name: '',
      address: '',
      latitude: undefined as number | undefined,
      longitude: undefined as number | undefined,
    },
    date: {
      mode: 'exact' as 'exact' | 'timeOfMonth',
      start: '',
      end: '',
      weekPosition: 'first' as 'first' | 'second' | 'third' | 'fourth',
      weekdays: [] as ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[],
    },
    recurrence: {
      enabled: false,
      frequency: 'monthly' as const,
      month: undefined as number | undefined,
      count: undefined as number | undefined,
      until: '',
    },
  });

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  const loadEvent = async () => {
    if (!eventId) return;
    
    try {
      const event = await eventService.getEvent(eventId);
      if (event) {
        setFormData({
          title: event.title,
          description: event.description || '',
          url: event.url || '',
          location: {
            name: event.location?.name || '',
            address: event.location?.address || '',
            latitude: event.location?.latitude,
            longitude: event.location?.longitude,
          },
          date: {
            mode: event.date.mode,
            start: event.date.start ? event.date.start.toISOString().slice(0, 10) : '',
            end: event.date.end ? event.date.end.toISOString().slice(0, 10) : '',
            weekPosition: event.date.weekPosition || 'first',
            weekdays: event.date.weekdays || [],
          },
          recurrence: {
            enabled: !!event.recurrence,
            frequency: event.recurrence?.frequency || 'monthly',
            month: event.recurrence?.month,
            count: event.recurrence?.count,
            until: event.recurrence?.until?.toISOString().slice(0, 10) || '',
          },
        });
      }
    } catch (error) {
      console.error('Error loading event:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setLoading(true);
    try {
      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        url: formData.url.trim() || undefined,
        location: (formData.location.name || formData.location.address) ? {
          name: formData.location.name || undefined,
          address: formData.location.address || undefined,
          latitude: formData.location.latitude,
          longitude: formData.location.longitude,
        } as EventLocation : undefined,
        date: {
          mode: formData.date.mode,
          start: formData.date.mode === 'exact' && formData.date.start ? new Date(formData.date.start) : undefined,
          end: formData.date.mode === 'exact' && formData.date.end ? new Date(formData.date.end) : undefined,
          weekPosition: formData.date.mode === 'timeOfMonth' ? formData.date.weekPosition : undefined,
          weekdays: formData.date.mode === 'timeOfMonth' ? formData.date.weekdays : undefined,
        },
        recurrence: formData.recurrence.enabled ? {
          frequency: formData.recurrence.frequency,
          month: formData.recurrence.month,
          count: formData.recurrence.count,
          until: formData.recurrence.until ? new Date(formData.recurrence.until) : undefined,
        } as RecurrenceRule : undefined,
      };

      if (eventId) {
        await eventService.updateEvent(eventId, eventData);
      } else {
        await eventService.createEvent(eventData);
      }

      onSave();
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const location = await geolocationService.getCurrentLocation();
      const address = await geolocationService.reverseGeocode(location.latitude, location.longitude);
      
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          latitude: location.latitude,
          longitude: location.longitude,
          address: address || `${location.latitude}, ${location.longitude}`,
        },
      }));
    } catch (error) {
      console.error('Error getting location:', error);
      alert(t.locationError);
    } finally {
      setLocationLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {eventId ? t.editEventTitle : t.createNewEvent}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.eventTitle} *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t.eventTitlePlaceholder}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.description}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t.eventDescriptionPlaceholder}
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.eventUrl}
            </label>
            <div className="relative">
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t.eventUrlPlaceholder}
              />
              <ExternalLink className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.location}
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={formData.location.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, name: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t.locationNamePlaceholder}
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, address: e.target.value }
                  }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t.addressPlaceholder}
                />
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={locationLoading}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <MapPin className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.dateAndTime}
            </label>
            <div className="space-y-3">
              {/* Date Mode Selection */}
              <div className="flex items-center gap-4">
                <input
                  type="radio"
                  id="exactDate"
                  name="dateMode"
                  checked={formData.date.mode === 'exact'}
                  onChange={() => setFormData(prev => ({
                    ...prev,
                    date: { ...prev.date, mode: 'exact' }
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="exactDate" className="text-sm text-gray-700">
                  {t.exactDate}
                </label>
                
                <input
                  type="radio"
                  id="timeOfMonth"
                  name="dateMode"
                  checked={formData.date.mode === 'timeOfMonth'}
                  onChange={() => setFormData(prev => ({
                    ...prev,
                    date: { ...prev.date, mode: 'timeOfMonth' }
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="timeOfMonth" className="text-sm text-gray-700">
                  {t.timeOfMonth}
                </label>
              </div>
              
              {/* Exact Date Mode */}
              {formData.date.mode === 'exact' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.dateFrom}</label>
                    <input
                      type="date"
                      value={formData.date.start}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        date: { ...prev.date, start: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.dateTo}</label>
                    <input
                      type="date"
                      value={formData.date.end}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        date: { ...prev.date, end: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Time of Month Mode */}
              {formData.date.mode === 'timeOfMonth' && (
                <div className="space-y-3">
                  {/* Week Position */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">{t.weekPosition}</label>
                    <div className="grid grid-cols-2 sm:flex sm:gap-4 gap-2">
                      {[
                        { key: 'first', label: t.first },
                        { key: 'second', label: t.second },
                        { key: 'third', label: t.third },
                        { key: 'fourth', label: t.fourth }
                       ].map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="weekPosition"
                            checked={formData.date.weekPosition === key}
                            onChange={() => setFormData(prev => ({
                              ...prev,
                              date: { ...prev.date, weekPosition: key as 'first' | 'second' | 'third' | 'fourth' }
                            }))}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 capitalize">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                
                  {/* Weekdays */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">{t.daysOfWeek}</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { key: 'monday', label: t.monday },
                        { key: 'tuesday', label: t.tuesday },
                        { key: 'wednesday', label: t.wednesday },
                        { key: 'thursday', label: t.thursday },
                        { key: 'friday', label: t.friday },
                        { key: 'saturday', label: t.saturday },
                        { key: 'sunday', label: t.sunday }
                      ].map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.date.weekdays.includes(key as any)}
                            onChange={(e) => {
                              const weekdays = [...formData.date.weekdays];
                              if (e.target.checked) {
                                weekdays.push(key as any);
                              } else {
                                const index = weekdays.indexOf(key as any);
                                if (index > -1) weekdays.splice(index, 1);
                              }
                              setFormData(prev => ({
                                ...prev,
                                date: { ...prev.date, weekdays }
                              }));
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recurrence */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="recurring"
                checked={formData.recurrence.enabled}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  recurrence: { ...prev.recurrence, enabled: e.target.checked }
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="recurring" className="text-sm font-medium text-gray-700">
                {t.recurringEvent}
              </label>
            </div>

            {formData.recurrence.enabled && (
              <div className="space-y-3 pl-6 border-l-2 border-blue-200">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.frequency}</label>
                    <select
                      value={formData.recurrence.frequency}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        recurrence: { ...prev.recurrence, frequency: e.target.value as 'monthly' | 'yearly' }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="monthly">{t.monthly}</option>
                      <option value="yearly">{t.yearly}</option>
                    </select>
                  </div>
                </div>

                {/* Month selection for yearly recurrence when no exact date */}
                {formData.recurrence.frequency === 'yearly' && formData.date.mode === 'timeOfMonth' && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.month}</label>
                    <select
                      value={formData.recurrence.month || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        recurrence: { ...prev.recurrence, month: e.target.value ? parseInt(e.target.value) : undefined }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Month</option>
                      <option value="1">{t.january}</option>
                      <option value="2">{t.february}</option>
                      <option value="3">{t.march}</option>
                      <option value="4">{t.april}</option>
                      <option value="5">{t.may}</option>
                      <option value="6">{t.june}</option>
                      <option value="7">{t.july}</option>
                      <option value="8">{t.august}</option>
                      <option value="9">{t.september}</option>
                      <option value="10">{t.october}</option>
                      <option value="11">{t.november}</option>
                      <option value="12">{t.december}</option>
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.endAfter}</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.recurrence.count || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        recurrence: { ...prev.recurrence, count: e.target.value ? parseInt(e.target.value) : undefined }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t.endAfterPlaceholder}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.orEndOnDate}</label>
                    <input
                      type="date"
                      value={formData.recurrence.until}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        recurrence: { ...prev.recurrence, until: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? t.saving : (eventId ? t.updateEvent : t.createEvent)}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              {t.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;