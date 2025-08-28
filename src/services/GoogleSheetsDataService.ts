import { Event } from '../types/Event';
import { DataService } from './DataService';
import { GoogleSheetsService } from './GoogleSheetsService';

export class GoogleSheetsDataService implements DataService {
  private sheetsService: GoogleSheetsService;

  constructor(sheetsService: GoogleSheetsService) {
    this.sheetsService = sheetsService;
  }

  async getEvents(): Promise<Event[]> {
    return this.sheetsService.getEvents();
  }

  async getEvent(id: string): Promise<Event | null> {
    const events = await this.sheetsService.getEvents();
    return events.find(e => e.id === id) || null;
  }

  async createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    return this.sheetsService.createEvent(eventData);
  }

  async updateEvent(id: string, eventData: Partial<Event>): Promise<Event> {
    return this.sheetsService.updateEvent(id, eventData);
  }

  async deleteEvent(id: string): Promise<boolean> {
    return this.sheetsService.deleteEvent(id);
  }
}