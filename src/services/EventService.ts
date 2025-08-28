import { Event, EventInstance, RecurrenceRule } from '../types/Event';
import { dataService as defaultDataService, DataService } from './DataService';

export class EventService {
  private dataService: DataService = defaultDataService;

  setDataService(service: DataService): void {
    this.dataService = service;
  }

  async getEvents(): Promise<Event[]> {
    return this.dataService.getEvents();
  }

  async getEvent(id: string): Promise<Event | null> {
    return this.dataService.getEvent(id);
  }

  async createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    return this.dataService.createEvent(eventData);
  }

  async updateEvent(id: string, eventData: Partial<Event>): Promise<Event> {
    return this.dataService.updateEvent(id, eventData);
  }

  async deleteEvent(id: string): Promise<boolean> {
    return this.dataService.deleteEvent(id);
  }

  async getEventInstances(startDate: Date, endDate: Date): Promise<EventInstance[]> {
    const events = await this.getEvents();
    const instances: EventInstance[] = [];

    events.forEach(event => {
      if (event.recurrence) {
        instances.push(...this.generateRecurringInstances(event, startDate, endDate));
      } else {
        // Single event
        if (this.isEventInRange(event, startDate, endDate)) {
          instances.push({
            event,
            instanceDate: event.date.start,
            instanceEnd: event.date.end,
          });
        }
      }
    });

    return instances.sort((a, b) => a.instanceDate.getTime() - b.instanceDate.getTime());
  }

  private isEventInRange(event: Event, startDate: Date, endDate: Date): boolean {
    const eventStart = event.date.start;
    const eventEnd = event.date.end || eventStart;
    
    return (eventStart >= startDate && eventStart <= endDate) ||
           (eventEnd >= startDate && eventEnd <= endDate) ||
           (eventStart <= startDate && eventEnd >= endDate);
  }

  private generateRecurringInstances(event: Event, startDate: Date, endDate: Date): EventInstance[] {
    const instances: EventInstance[] = [];
    const rule = event.recurrence!;
    let currentDate = new Date(event.date.start);
    let count = 0;
    const maxIterations = 1000; // Safety limit

    while (count < maxIterations) {
      if (rule.until && currentDate > rule.until) break;
      if (rule.count && count >= rule.count) break;
      if (currentDate > endDate) break;

      if (currentDate >= startDate) {
        const instanceEnd = event.date.end 
          ? new Date(currentDate.getTime() + (event.date.end.getTime() - event.date.start.getTime()))
          : undefined;

        instances.push({
          event,
          instanceDate: new Date(currentDate),
          instanceEnd,
        });
      }

      currentDate = this.getNextOccurrence(currentDate, rule);
      count++;
    }

    return instances;
  }

  private getNextOccurrence(date: Date, rule: RecurrenceRule): Date {
    const next = new Date(date);
    const interval = rule.interval || 1;

    switch (rule.frequency) {
      case 'daily':
        next.setDate(next.getDate() + interval);
        break;
      case 'weekly':
        next.setDate(next.getDate() + (7 * interval));
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + interval);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + interval);
        break;
    }

    return next;
  }
}

export const eventService = new EventService();