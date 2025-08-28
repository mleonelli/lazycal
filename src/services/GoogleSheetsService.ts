import { Event } from '../types/Event';

export interface GoogleSheetsConfig {
  clientId: string;
  apiKey: string;
  spreadsheetId?: string;
}

export class GoogleSheetsService {
  private gapi: any;
  private isInitialized = false;
  private isSignedIn = false;
  private config: GoogleSheetsConfig;
  private spreadsheetId?: string;

  constructor(config: GoogleSheetsConfig) {
    this.config = config;
    this.spreadsheetId = config.spreadsheetId;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      // Load Google API script
      if (!window.gapi) {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => this.initializeGapi().then(resolve).catch(reject);
        script.onerror = () => reject(new Error('Failed to load Google API'));
        document.head.appendChild(script);
      } else {
        this.initializeGapi().then(resolve).catch(reject);
      }
    });
  }

  private async initializeGapi(): Promise<void> {
    this.gapi = window.gapi;
    
    await new Promise<void>((resolve) => {
      this.gapi.load('auth2:client', resolve);
    });

    await this.gapi.client.init({
      apiKey: this.config.apiKey,
      clientId: this.config.clientId,
      discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
      scope: 'https://www.googleapis.com/auth/spreadsheets'
    });

    const authInstance = this.gapi.auth2.getAuthInstance();
    this.isSignedIn = authInstance.isSignedIn.get();
    this.isInitialized = true;
  }

  async signIn(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const authInstance = this.gapi.auth2.getAuthInstance();
    
    if (!this.isSignedIn) {
      try {
        await authInstance.signIn();
        this.isSignedIn = true;
      } catch (error) {
        console.error('Sign-in failed:', error);
        return false;
      }
    }

    // Create spreadsheet if not exists
    if (!this.spreadsheetId) {
      await this.createSpreadsheet();
    }

    return true;
  }

  async signOut(): Promise<void> {
    if (!this.isInitialized) return;

    const authInstance = this.gapi.auth2.getAuthInstance();
    await authInstance.signOut();
    this.isSignedIn = false;
    this.spreadsheetId = undefined;
  }

  getSignInStatus(): boolean {
    return this.isSignedIn;
  }

  private async createSpreadsheet(): Promise<void> {
    const response = await this.gapi.client.sheets.spreadsheets.create({
      properties: {
        title: 'LazyCal Events'
      },
      sheets: [{
        properties: {
          title: 'Events'
        }
      }]
    });

    this.spreadsheetId = response.result.spreadsheetId;

    // Set up headers
    await this.gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: 'Events!A1:L1',
      valueInputOption: 'RAW',
      resource: {
        values: [[
          'ID', 'Title', 'Description', 'URL', 'Location Name', 'Location Address',
          'Location Latitude', 'Location Longitude', 'Start Date', 'End Date',
          'All Day', 'Recurrence'
        ]]
      }
    });
  }

  async getEvents(): Promise<Event[]> {
    if (!this.isSignedIn || !this.spreadsheetId) {
      throw new Error('Not authenticated or spreadsheet not available');
    }

    try {
      const response = await this.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Events!A2:L'
      });

      const rows = response.result.values || [];
      return rows.map(this.rowToEvent);
    } catch (error) {
      console.error('Error fetching events from Google Sheets:', error);
      throw error;
    }
  }

  async createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    if (!this.isSignedIn || !this.spreadsheetId) {
      throw new Error('Not authenticated or spreadsheet not available');
    }

    const now = new Date();
    const event: Event = {
      ...eventData,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    const row = this.eventToRow(event);

    await this.gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: 'Events!A:L',
      valueInputOption: 'RAW',
      resource: {
        values: [row]
      }
    });

    return event;
  }

  async updateEvent(id: string, eventData: Partial<Event>): Promise<Event> {
    if (!this.isSignedIn || !this.spreadsheetId) {
      throw new Error('Not authenticated or spreadsheet not available');
    }

    // Find the row with the event
    const events = await this.getEvents();
    const eventIndex = events.findIndex(e => e.id === id);
    
    if (eventIndex === -1) {
      throw new Error(`Event with id ${id} not found`);
    }

    const updatedEvent = {
      ...events[eventIndex],
      ...eventData,
      id, // Ensure ID cannot be changed
      updatedAt: new Date(),
    };

    const row = this.eventToRow(updatedEvent);
    const rowNumber = eventIndex + 2; // +2 because of header row and 0-based index

    await this.gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `Events!A${rowNumber}:L${rowNumber}`,
      valueInputOption: 'RAW',
      resource: {
        values: [row]
      }
    });

    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<boolean> {
    if (!this.isSignedIn || !this.spreadsheetId) {
      throw new Error('Not authenticated or spreadsheet not available');
    }

    // Find the row with the event
    const events = await this.getEvents();
    const eventIndex = events.findIndex(e => e.id === id);
    
    if (eventIndex === -1) {
      return false;
    }

    const rowNumber = eventIndex + 2; // +2 because of header row and 0-based index

    await this.gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      resource: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: 0,
              dimension: 'ROWS',
              startIndex: rowNumber - 1,
              endIndex: rowNumber
            }
          }
        }]
      }
    });

    return true;
  }

  private eventToRow(event: Event): any[] {
    return [
      event.id,
      event.title,
      event.description || '',
      event.url || '',
      event.location?.name || '',
      event.location?.address || '',
      event.location?.latitude || '',
      event.location?.longitude || '',
      event.date.start?.toISOString() || '',
      event.date.end?.toISOString() || '',
      JSON.stringify({
        mode: event.date.mode,
        weekPosition: event.date.weekPosition,
        weekdays: event.date.weekdays
      }),
      event.recurrence ? JSON.stringify(event.recurrence) : ''
    ];
  }

  private rowToEvent(row: any[]): Event {
    const dateConfig = row[10] ? JSON.parse(row[10]) : { mode: 'exact' };
    
    return {
      id: row[0],
      title: row[1],
      description: row[2] || undefined,
      url: row[3] || undefined,
      location: (row[4] || row[5] || row[6] || row[7]) ? {
        name: row[4] || undefined,
        address: row[5] || undefined,
        latitude: row[6] ? parseFloat(row[6]) : undefined,
        longitude: row[7] ? parseFloat(row[7]) : undefined,
      } : undefined,
      date: {
        mode: dateConfig.mode || 'exact',
        start: row[8] ? new Date(row[8]) : undefined,
        end: row[9] ? new Date(row[9]) : undefined,
        weekPosition: dateConfig.weekPosition,
        weekdays: dateConfig.weekdays,
      },
      recurrence: row[11] ? JSON.parse(row[11]) : undefined,
      createdAt: new Date(), // We don't store these in the sheet for simplicity
      updatedAt: new Date(),
    };
  }

  getSpreadsheetUrl(): string | null {
    if (!this.spreadsheetId) return null;
    return `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/edit`;
  }
}