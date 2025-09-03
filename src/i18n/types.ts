interface Translation {
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
  importExport: string;
  exportEvents: string;
  importEvents: string;
  exporting: string;
  importing: string;
  lastExport: string;
  daysAgo: string;
  days: string;
  backupWarning: string;
  backupWarningMessage: string;
  backupReminderDays: string;
  backupReminderDescription: string;
  exportDescription: string;
  importDescription: string;
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

export type { Translation };