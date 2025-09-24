import { Event, EventInstance, EventDateMode, RecurrenceFrequency } from '../types/Event';
import { DataService, dataService } from './DataService';

export class EventService {
  private dataService: DataService;

  constructor(dataService: DataService) {
    this.dataService = dataService;
  }

  setDataService(dataService: DataService): void {
    this.dataService = dataService;
  }

  async getEvents(): Promise<Event[]> {
    return this.dataService.getEvents();
  }

  async getEvent(id: string): Promise<Event | null> {
    const events = await this.dataService.getEvents();
    return events.find(event => event.id === id) || null;
  }

  async createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    return this.dataService.createEvent(eventData);
  }

  async createEventWithId(eventData: Event): Promise<Event> {
    // Special method for importing events with existing IDs
    const event: Event = {
      ...eventData,
    };
    
    // Check if event with this ID already exists
    const existingEvent = await this.getEvent(event.id);
    if (existingEvent) {
      // Generate new ID if conflict
      event.id = crypto.randomUUID();
    }
    
    await this.dataService.createEvent(event);
    return event;
  }

  async updateEvent(id: string, eventData: Partial<Event>): Promise<Event> {
    const existingEvent = await this.getEvent(id);
    if (!existingEvent) {
      throw new Error('Event not found');
    }
    
    const updatedEvent: Event = {
      ...existingEvent,
      ...eventData,
      id, // Ensure ID doesn't change
      updatedAt: new Date(),
    };
    
    await this.dataService.updateEvent(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<boolean> {
    try {
      await this.dataService.deleteEvent(id);
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  }

  async getEventInstances(startDate: Date, endDate: Date): Promise<EventInstance[]> {
    const events = await this.getEvents();
    const instances: EventInstance[] = [];

    for (const event of events) {
      const eventInstances = this.generateInstancesForSingleEvent(event, startDate, endDate);
      instances.push(...eventInstances);
    }

    return instances.sort((a, b) => a.instanceDate.getTime() - b.instanceDate.getTime());
  }

  private generateInstancesForSingleEvent(event: Event, startDate: Date, endDate: Date): EventInstance[] {
    const instances: EventInstance[] = [];

    if (event.date.mode === 'exact') {
      // Handle exact date events
      if (!event.date.start) return instances;

      const eventStart = new Date(event.date.start);
      const eventEnd = event.date.end ? new Date(event.date.end) : eventStart;

      if (!event.recurrence) {
        // Single occurrence
        if (eventStart >= startDate && eventStart <= endDate) {
          instances.push({
            event,
            instanceDate: eventStart,
            instanceEnd: event.date.end ? eventEnd : undefined,
          });
        }
      } else {
        // Recurring exact date events
        let currentDate = new Date(eventStart);
        let occurrenceCount = 0;
        
        while (currentDate <= endDate) {
          if (currentDate >= startDate) {
            const instanceEnd = event.date.end ? 
              new Date(currentDate.getTime() + (eventEnd.getTime() - eventStart.getTime())) : 
              undefined;
            
            instances.push({
              event,
              instanceDate: new Date(currentDate),
              instanceEnd,
            });
            occurrenceCount++;
          }

          // Move to next occurrence
          if (event.recurrence.frequency === 'monthly') {
            currentDate.setMonth(currentDate.getMonth() + 1);
          } else if (event.recurrence.frequency === 'yearly') {
            currentDate.setFullYear(currentDate.getFullYear() + 1);
          }

          // Check end conditions
          if (event.recurrence.count && occurrenceCount >= event.recurrence.count) {
            break;
          }
          if (event.recurrence.until && currentDate > new Date(event.recurrence.until)) {
            break;
          }
        }
      }
    } else if (event.date.mode === 'timeOfMonth') {
      // Handle time of month events
      if (!event.date.weekPosition || !event.date.weekdays?.length) {
        return instances;
      }

      if (!event.recurrence) {
        // Single occurrence - find the next matching date
        const matchingDate = this.findTimeOfMonthDateInRange(
          startDate,
          endDate,
          event.date.weekPosition,
          event.date.weekdays
        );
        
        if (matchingDate) {
          instances.push({
            event,
            instanceDate: matchingDate,
            instanceEnd: undefined,
          });
        }
      } else {
        // Recurring time of month events
        let currentMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        let occurrenceCount = 0;
        
        while (currentMonth <= endDate) {
          // For yearly recurrence, only process the specified month
          if (event.recurrence.frequency === 'yearly' && 
              event.recurrence.month !== undefined &&
              currentMonth.getMonth() !== (event.recurrence.month - 1)) {
            if (event.recurrence.frequency === 'monthly') {
              currentMonth.setMonth(currentMonth.getMonth() + 1);
            } else {
              currentMonth.setFullYear(currentMonth.getFullYear() + 1);
              currentMonth.setMonth(event.recurrence.month - 1);
            }
            continue;
          }

          const matchingDate = this.findTimeOfMonthDateInMonth(
            currentMonth,
            event.date.weekPosition,
            event.date.weekdays
          );

          if (matchingDate && matchingDate >= startDate && matchingDate <= endDate) {
            instances.push({
              event,
              instanceDate: matchingDate,
              instanceEnd: undefined,
            });
            occurrenceCount++;
          }

          // Move to next occurrence
          if (event.recurrence.frequency === 'monthly') {
            currentMonth.setMonth(currentMonth.getMonth() + 1);
          } else if (event.recurrence.frequency === 'yearly') {
            currentMonth.setFullYear(currentMonth.getFullYear() + 1);
          }

          // Check end conditions
          if (event.recurrence.count && occurrenceCount >= event.recurrence.count) {
            break;
          }
          if (event.recurrence.until && currentMonth > new Date(event.recurrence.until)) {
            break;
          }
        }
      }
    }

    return instances;
  }

  private findTimeOfMonthDateInRange(
    startDate: Date,
    endDate: Date,
    weekPosition: 'first' | 'second' | 'third' | 'fourth' | 'last',
    weekdays: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[]
  ): Date | null {
    let currentMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    
    while (currentMonth <= endMonth) {
      const matchingDate = this.findTimeOfMonthDateInMonth(currentMonth, weekPosition, weekdays);
      if (matchingDate && matchingDate >= startDate && matchingDate <= endDate) {
        return matchingDate;
      }
      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }
    
    return null;
  }

  private findTimeOfMonthDateInMonth(
    monthStart: Date,
    weekPosition: 'first' | 'second' | 'third' | 'fourth',
    weekdays: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[]
  ): Date | null {
    const year = monthStart.getFullYear();
    const month = monthStart.getMonth();
    
    const weekPositionMap = {
      'first': 1,
      'second': 2,
      'third': 3,
      'fourth': 4,
    };
    
    const weekdayMap = {
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6,
    };
    
    const position = weekPositionMap[weekPosition];
    
    // Find the first occurrence of each weekday in the month
    for (const weekdayName of weekdays) {
      const weekday = weekdayMap[weekdayName];
      const date = this.getNthWeekdayOfMonth(year, month, position, weekday);
      if (date) {
        return date;
      }
    }
    
    return null;
  }

  private getNthWeekdayOfMonth(
    year: number,
    month: number,
    weekPosition: number,
    weekday: number
  ): Date | null {
    const firstDay = new Date(year, month, 1);
    const firstWeekday = firstDay.getDay();
    
    // Calculate the date of the first occurrence of the target weekday
    let firstOccurrence = 1 + ((weekday - firstWeekday + 7) % 7);
    
    // Calculate the date of the nth occurrence
    const targetDate = firstOccurrence + (weekPosition - 1) * 7;
    
    // Check if the date exists in this month
    const date = new Date(year, month, targetDate);
    if (date.getMonth() !== month) {
      return null; // Date doesn't exist in this month
    }
    
    return date;
  }
}

// Export singleton instance
export const eventService = new EventService(dataService);