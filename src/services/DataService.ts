import { Event } from '../types/Event';

export interface DataService {
  getEvents(): Promise<Event[]>;
  getEvent(id: string): Promise<Event | null>;
  createEvent(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event>;
  updateEvent(id: string, event: Partial<Event>): Promise<Event>;
  deleteEvent(id: string): Promise<boolean>;
}

class LocalStorageDataService implements DataService {
  private readonly STORAGE_KEY = 'lazycal_events';

  private getEventsFromStorage(): Event[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      
      const events = JSON.parse(data);
      return events.map((e: any) => ({
        ...e,
        date: {
          ...e.date,
          start: new Date(e.date.start),
          end: e.date.end ? new Date(e.date.end) : undefined,
        },
        recurrence: e.recurrence ? {
          ...e.recurrence,
          until: e.recurrence.until ? new Date(e.recurrence.until) : undefined,
        } : undefined,
        createdAt: new Date(e.createdAt),
        updatedAt: new Date(e.updatedAt),
      }));
    } catch (error) {
      console.error('Error loading events from localStorage:', error);
      return [];
    }
  }

  private saveEventsToStorage(events: Event[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(events));
    } catch (error) {
      console.error('Error saving events to localStorage:', error);
    }
  }

  async getEvents(): Promise<Event[]> {
    return this.getEventsFromStorage();
  }

  async getEvent(id: string): Promise<Event | null> {
    const events = this.getEventsFromStorage();
    return events.find(e => e.id === id) || null;
  }

  async createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    const events = this.getEventsFromStorage();
    const now = new Date();
    const event: Event = {
      ...eventData,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    
    events.push(event);
    this.saveEventsToStorage(events);
    return event;
  }

  async updateEvent(id: string, eventData: Partial<Event>): Promise<Event> {
    const events = this.getEventsFromStorage();
    const index = events.findIndex(e => e.id === id);
    
    if (index === -1) {
      throw new Error(`Event with id ${id} not found`);
    }

    const updatedEvent = {
      ...events[index],
      ...eventData,
      id, // Ensure ID cannot be changed
      updatedAt: new Date(),
    };

    events[index] = updatedEvent;
    this.saveEventsToStorage(events);
    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<boolean> {
    const events = this.getEventsFromStorage();
    const initialLength = events.length;
    const filteredEvents = events.filter(e => e.id !== id);
    
    if (filteredEvents.length === initialLength) {
      return false;
    }

    this.saveEventsToStorage(filteredEvents);
    return true;
  }
}

// Export singleton instance
export const dataService: DataService = new LocalStorageDataService();