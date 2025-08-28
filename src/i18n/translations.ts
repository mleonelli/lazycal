export interface Translation {
  // Header
  appName: string;
  calendar: string;
  list: string;
  newEvent: string;
  calendarView: string;
  listView: string;

  // Calendar
  today: string;
  thisMonth: string;
  january: string;
  february: string;
  march: string;
  april: string;
  may: string;
  june: string;
  july: string;
  august: string;
  september: string;
  october: string;
  november: string;
  december: string;
  sunday: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sun: string;
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;

  // Events
  noEventsThisMonth: string;
  addFirstEvent: string;
  more: string;
  visitEvent: string;
  visitEventPage: string;
  editEvent: string;
  deleteEvent: string;
  close: string;

  // Event Form
  createNewEvent: string;
  editEventTitle: string;
  eventTitle: string;
  eventTitlePlaceholder: string;
  description: string;
  eventDescriptionPlaceholder: string;
  eventUrl: string;
  eventUrlPlaceholder: string;
  location: string;
  locationNamePlaceholder: string;
  address: string;
  addressPlaceholder: string;
  dateAndTime: string;
  allDayEvent: string;
  start: string;
  end: string;
  endOptional: string;
  recurringEvent: string;
  frequency: string;
  every: string;
  daily: string;
  weekly: string;
  monthly: string;
  yearly: string;
  endAfter: string;
  endAfterPlaceholder: string;
  orEndOnDate: string;
  createEvent: string;
  updateEvent: string;
  cancel: string;
  saving: string;

  // Messages
  loadingEvents: string;
  deleteConfirmation: string;
  locationError: string;

  // Language
  language: string;
  english: string;
  italian: string;

  // Data Storage
  dataStorage: string;
  localStorage: string;
  localStorageDescription: string;
  googleSheets: string;
  googleSheetsDescription: string;
  signedIn: string;
  signInWithGoogle: string;
  signOut: string;
  openSpreadsheet: string;
  viewSpreadsheet: string;
}

export const translations: Record<string, Translation> = {
  en: {
    // Header
    appName: 'LazyCal',
    calendar: 'Calendar',
    list: 'List',
    newEvent: 'New Event',
    calendarView: 'Calendar View',
    listView: 'List View',

    // Calendar
    today: 'Today',
    thisMonth: 'This Month',
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    may: 'May',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December',
    sunday: 'Sunday',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sun: 'Sun',
    mon: 'Mon',
    tue: 'Tue',
    wed: 'Wed',
    thu: 'Thu',
    fri: 'Fri',
    sat: 'Sat',

    // Events
    noEventsThisMonth: 'No events this month',
    addFirstEvent: 'Add your first event to get started.',
    more: 'more',
    visitEvent: 'Visit Event',
    visitEventPage: 'Visit Event Page',
    editEvent: 'Edit Event',
    deleteEvent: 'Delete Event',
    close: 'Close',

    // Event Form
    createNewEvent: 'Create New Event',
    editEventTitle: 'Edit Event',
    eventTitle: 'Event Title',
    eventTitlePlaceholder: 'Enter event title',
    description: 'Description',
    eventDescriptionPlaceholder: 'Event description (optional)',
    eventUrl: 'Event URL',
    eventUrlPlaceholder: 'https://example.com/event',
    location: 'Location',
    locationNamePlaceholder: 'Location name (e.g., Conference Hall)',
    address: 'Address',
    addressPlaceholder: 'Address',
    dateAndTime: 'Date and Time',
    allDayEvent: 'All day event',
    start: 'Start',
    end: 'End',
    endOptional: 'End (optional)',
    recurringEvent: 'Recurring event',
    frequency: 'Frequency',
    every: 'Every',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
    endAfter: 'End after (occurrences)',
    endAfterPlaceholder: 'Unlimited',
    orEndOnDate: 'Or end on date',
    createEvent: 'Create Event',
    updateEvent: 'Update Event',
    cancel: 'Cancel',
    saving: 'Saving...',

    // Messages
    loadingEvents: 'Loading events...',
    deleteConfirmation: 'Are you sure you want to delete this event?',
    locationError: 'Could not get your current location. Please enter the location manually.',

    // Language
    language: 'Language',
    english: 'English',
    italian: 'Italian',

    // Data Storage
    dataStorage: 'Data Storage',
    localStorage: 'Local Storage',
    localStorageDescription: 'Store data locally in your browser',
    googleSheets: 'Google Sheets',
    googleSheetsDescription: 'Sync with Google Sheets for backup and sharing',
    signedIn: 'Signed in',
    signInWithGoogle: 'Sign in with Google',
    signOut: 'Sign out',
    openSpreadsheet: 'Open spreadsheet',
    viewSpreadsheet: 'View Spreadsheet',
  },
  it: {
    // Header
    appName: 'LazyCal',
    calendar: 'Calendario',
    list: 'Lista',
    newEvent: 'Nuovo Evento',
    calendarView: 'Vista Calendario',
    listView: 'Vista Lista',

    // Calendar
    today: 'Oggi',
    thisMonth: 'Questo Mese',
    january: 'Gennaio',
    february: 'Febbraio',
    march: 'Marzo',
    april: 'Aprile',
    may: 'Maggio',
    june: 'Giugno',
    july: 'Luglio',
    august: 'Agosto',
    september: 'Settembre',
    october: 'Ottobre',
    november: 'Novembre',
    december: 'Dicembre',
    sunday: 'Domenica',
    monday: 'Lunedì',
    tuesday: 'Martedì',
    wednesday: 'Mercoledì',
    thursday: 'Giovedì',
    friday: 'Venerdì',
    saturday: 'Sabato',
    sun: 'Dom',
    mon: 'Lun',
    tue: 'Mar',
    wed: 'Mer',
    thu: 'Gio',
    fri: 'Ven',
    sat: 'Sab',

    // Events
    noEventsThisMonth: 'Nessun evento questo mese',
    addFirstEvent: 'Aggiungi il tuo primo evento per iniziare.',
    more: 'altri',
    visitEvent: 'Visita Evento',
    visitEventPage: 'Visita Pagina Evento',
    editEvent: 'Modifica Evento',
    deleteEvent: 'Elimina Evento',
    close: 'Chiudi',

    // Event Form
    createNewEvent: 'Crea Nuovo Evento',
    editEventTitle: 'Modifica Evento',
    eventTitle: 'Titolo Evento',
    eventTitlePlaceholder: 'Inserisci il titolo dell\'evento',
    description: 'Descrizione',
    eventDescriptionPlaceholder: 'Descrizione evento (opzionale)',
    eventUrl: 'URL Evento',
    eventUrlPlaceholder: 'https://esempio.com/evento',
    location: 'Posizione',
    locationNamePlaceholder: 'Nome posizione (es. Sala Conferenze)',
    address: 'Indirizzo',
    addressPlaceholder: 'Indirizzo',
    dateAndTime: 'Data e Ora',
    allDayEvent: 'Evento di tutto il giorno',
    start: 'Inizio',
    end: 'Fine',
    endOptional: 'Fine (opzionale)',
    recurringEvent: 'Evento ricorrente',
    frequency: 'Frequenza',
    every: 'Ogni',
    daily: 'Giornaliero',
    weekly: 'Settimanale',
    monthly: 'Mensile',
    yearly: 'Annuale',
    endAfter: 'Termina dopo (occorrenze)',
    endAfterPlaceholder: 'Illimitato',
    orEndOnDate: 'O termina in data',
    createEvent: 'Crea Evento',
    updateEvent: 'Aggiorna Evento',
    cancel: 'Annulla',
    saving: 'Salvataggio...',

    // Messages
    loadingEvents: 'Caricamento eventi...',
    deleteConfirmation: 'Sei sicuro di voler eliminare questo evento?',
    locationError: 'Impossibile ottenere la tua posizione attuale. Inserisci manualmente la posizione.',

    // Language
    language: 'Lingua',
    english: 'Inglese',
    italian: 'Italiano',

    // Data Storage
    dataStorage: 'Archiviazione Dati',
    localStorage: 'Archiviazione Locale',
    localStorageDescription: 'Archivia i dati localmente nel tuo browser',
    googleSheets: 'Google Sheets',
    googleSheetsDescription: 'Sincronizza con Google Sheets per backup e condivisione',
    signedIn: 'Connesso',
    signInWithGoogle: 'Accedi con Google',
    signOut: 'Disconnetti',
    openSpreadsheet: 'Apri foglio di calcolo',
    viewSpreadsheet: 'Visualizza Foglio',
  },
};