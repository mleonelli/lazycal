import React, { useState, useCallback } from 'react';
import { Calendar as CalendarIcon, List, Plus, Menu, X, Settings, MessageSquare } from 'lucide-react';
import { useTranslation } from './hooks/useTranslation';
import Calendar from './components/Calendar';
import ListView from './components/ListView';
import EventForm from './components/EventForm';
import LanguageSelector from './components/LanguageSelector';
import DataStorageSelector, { StorageMode } from './components/DataStorageSelector';
import ImportExportManager from './components/ImportExportManager';
import FeedbackForm from './components/FeedbackForm';
import Footer from './components/Footer';
import { eventService } from './services/EventService';
import { GoogleSheetsService } from './services/GoogleSheetsService';
import { GoogleSheetsDataService } from './services/GoogleSheetsDataService';
import { dataService as localDataService } from './services/DataService';

type ViewMode = 'calendar' | 'list';

// Google Sheets configuration - replace with your actual values
const GOOGLE_SHEETS_CONFIG = {
  clientId: 'your-google-client-id.apps.googleusercontent.com',
  apiKey: 'your-google-api-key',
};

function App() {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | undefined>();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [storageMode, setStorageMode] = useState<StorageMode>('local');
  const [googleSheetsService] = useState(() => new GoogleSheetsService(GOOGLE_SHEETS_CONFIG));
  const [isGoogleSheetsSignedIn, setIsGoogleSheetsSignedIn] = useState(false);
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState<string | null>(null);

  // Update the event service based on storage mode
  React.useEffect(() => {
    if (storageMode === 'googlesheets' && isGoogleSheetsSignedIn) {
      const googleDataService = new GoogleSheetsDataService(googleSheetsService);
      eventService.setDataService(googleDataService);
      setGoogleSheetsUrl(googleSheetsService.getSpreadsheetUrl());
    } else {
      eventService.setDataService(localDataService);
      setGoogleSheetsUrl(null);
    }
  }, [storageMode, isGoogleSheetsSignedIn, googleSheetsService]);

  const handleEventClick = useCallback((eventId: string) => {
    setEditingEventId(eventId);
    setShowEventForm(true);
    setMobileMenuOpen(false);
  }, []);

  const handleDeleteEvent = useCallback(async (eventId: string) => {
    try {
      await eventService.deleteEvent(eventId);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  }, []);

  const handleSaveEvent = useCallback(() => {
    setShowEventForm(false);
    setEditingEventId(undefined);
    // The components will automatically refresh their data
  }, []);

  const handleCreateEvent = useCallback(() => {
    setEditingEventId(undefined);
    setShowEventForm(true);
    setMobileMenuOpen(false);
  }, []);

  const handleCancelEventForm = useCallback(() => {
    setShowEventForm(false);
    setEditingEventId(undefined);
  }, []);

  const handleStorageModeChange = useCallback((mode: StorageMode) => {
    if (mode === 'googlesheets' && !isGoogleSheetsSignedIn) {
      // Don't change mode if not signed in
      return;
    }
    setStorageMode(mode);
  }, [isGoogleSheetsSignedIn]);

  const handleGoogleSheetsSignIn = useCallback(async () => {
    try {
      const success = await googleSheetsService.signIn();
      if (success) {
        setIsGoogleSheetsSignedIn(true);
        setStorageMode('googlesheets');
        setGoogleSheetsUrl(googleSheetsService.getSpreadsheetUrl());
      }
    } catch (error) {
      console.error('Google Sheets sign-in failed:', error);
      alert('Failed to sign in to Google Sheets. Please try again.');
    }
  }, [googleSheetsService]);

  const handleGoogleSheetsSignOut = useCallback(async () => {
    try {
      await googleSheetsService.signOut();
      setIsGoogleSheetsSignedIn(false);
      setStorageMode('local');
      setGoogleSheetsUrl(null);
    } catch (error) {
      console.error('Google Sheets sign-out failed:', error);
    }
  }, [googleSheetsService]);

  const handleFooterFeedbackClick = useCallback(() => {
    setShowSettings(true);
  }, []);
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <CalendarIcon className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">{t.appName}</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title={t.showSettings}
              >
                <Settings className="w-5 h-5" />
              </button>
              
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'calendar'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <CalendarIcon className="w-4 h-4" />
                  {t.calendar}
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                  {t.list}
                </button>
              </div>
              
              <button
                onClick={handleCreateEvent}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t.newEvent}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-4 py-2 space-y-2">
              <button
                onClick={() => {
                  setShowSettings(!showSettings);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors"
              >
                <Settings className="w-4 h-4" />
                {t.showSettings}
              </button>
              
              <button
                onClick={() => {
                  setViewMode('calendar');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
                {t.calendarView}
              </button>
              <button
                onClick={() => {
                  setViewMode('list');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List className="w-4 h-4" />
                {t.listView}
              </button>
              <button
                onClick={handleCreateEvent}
                className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t.newEvent}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.language}</h3>
              <LanguageSelector />
            </div>
            
            <ImportExportManager />
            
            <DataStorageSelector
              currentMode={storageMode}
              onModeChange={handleStorageModeChange}
              isGoogleSheetsSignedIn={isGoogleSheetsSignedIn}
              onGoogleSheetsSignIn={handleGoogleSheetsSignIn}
              onGoogleSheetsSignOut={handleGoogleSheetsSignOut}
              googleSheetsUrl={googleSheetsUrl}
            />
          </div>
        </div>
      )}

      {/* Feedback Panel */}
      {showFeedback && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <FeedbackForm />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'calendar' ? (
          <Calendar onEventClick={handleEventClick} />
        ) : (
          <ListView 
            onEventClick={handleEventClick}
            onDeleteEvent={handleDeleteEvent}
          />
        )}
      </main>

      {/* Event Form Modal */}
      {showEventForm && (
        <EventForm
          eventId={editingEventId}
          onSave={handleSaveEvent}
          onCancel={handleCancelEventForm}
        />
      )}

      {/* Footer */}
      <Footer onFeedbackClick={handleFooterFeedbackClick} />
    </div>
  );
}

export default App;