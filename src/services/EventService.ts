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
    if (event.date.mode === 'exact' && event.date.start) {
      const eventStart = event.date.start;
      const eventEnd = event.date.end || eventStart;
      
      return (eventStart >= startDate && eventStart <= endDate) ||
             (eventEnd >= startDate && eventEnd <= endDate) ||
             (eventStart <= startDate && eventEnd >= endDate);
    }
    
    // For timeOfMonth events, we need to check if any occurrence falls in the range
    if (event.date.mode === 'timeOfMonth') {
      return this.hasTimeOfMonthOccurrenceInRange(event, startDate, endDate);
    }
    
    return false;
  }

  private hasTimeOfMonthOccurrenceInRange(event: Event, startDate: Date, endDate: Date): boolean {
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const end = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);
    
    while (current <= end) {
      const occurrences = this.getTimeOfMonthOccurrences(event, current);
      for (const occurrence of occurrences) {
        if (occurrence >= startDate && occurrence <= endDate) {
          return true;
        }
      }
      current.setMonth(current.getMonth() + 1);
    }
    
    return false;
  }

  private getTimeOfMonthOccurrences(event: Event, month: Date): Date[] {
    if (event.date.mode !== 'timeOfMonth' || !event.date.weekPosition || !event.date.weekdays) {
      return [];
    }

    const occurrences: Date[] = [];
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    
    // Map weekday names to numbers (0 = Sunday, 1 = Monday, etc.)
    const weekdayMap: Record<string, number> = {
      sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
      thursday: 4, friday: 5, saturday: 6
    };

    for (const weekdayName of event.date.weekdays) {
      const targetWeekday = weekdayMap[weekdayName];
      const occurrence = this.getNthWeekdayOfMonth(year, monthIndex, targetWeekday, event.date.weekPosition);
      if (occurrence) {
        occurrences.push(occurrence);
      }
    }

    return occurrences;
  }

  private getNthWeekdayOfMonth(year: number, month: number, weekday: number, position: string): Date | null {
    const firstDay = new Date(year, month, 1);
    const firstWeekday = firstDay.getDay();
    
    // Calculate the first occurrence of the target weekday
    let firstOccurrence = 1 + (weekday - firstWeekday + 7) % 7;
    
    // Calculate the nth occurrence
    const positionMap = { first: 0, second: 1, third: 2, fourth: 3 };
    const nthOccurrence = firstOccurrence + (positionMap[position as keyof typeof positionMap] * 7);
    
    // Check if the date exists in the month
    const result = new Date(year, month, nthOccurrence);
    if (result.getMonth() !== month) {
      return null; // Date doesn't exist in this month
    }
    
    return result;
  }

  private generateRecurringInstances(event: Event, startDate: Date, endDate: Date): EventInstance[] {
    const instances: EventInstance[] = [];
    const rule = event.recurrence!;
    
    if (event.date.mode === 'exact' && event.date.start) {
      let currentDate = new Date(event.date.start);
      let count = 0;
      const maxIterations = 1000;

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
    } else if (event.date.mode === 'timeOfMonth') {
      // Handle time of month recurring events
      let currentMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      let count = 0;
      const maxIterations = 1000;

      while (count < maxIterations) {
        if (rule.until && currentMonth > rule.until) break;
        if (rule.count && count >= rule.count) break;
        if (currentMonth > endDate) break;

        // For yearly recurrence, check if we're in the right month
        if (rule.frequency === 'yearly' && rule.month && currentMonth.getMonth() + 1 !== rule.month) {
          currentMonth = this.getNextMonthOccurrence(currentMonth, rule);
          continue;
        }

        const occurrences = this.getTimeOfMonthOccurrences(event, currentMonth);
        for (const occurrence of occurrences) {
          if (occurrence >= startDate && occurrence <= endDate) {
            instances.push({
              event,
              instanceDate: occurrence,
              instanceEnd: undefined,
            });
            count++;
          }
        }

        currentMonth = this.getNextMonthOccurrence(currentMonth, rule);
      }
    }

    return instances;
  }

  private getNextMonthOccurrence(date: Date, rule: RecurrenceRule): Date {
    const next = new Date(date);
    
    if (rule.frequency === 'monthly') {
      next.setMonth(next.getMonth() + 1);
    } else if (rule.frequency === 'yearly') {
      next.setFullYear(next.getFullYear() + 1);
    }
    
    return next;
  }

  private getNextOccurrence(date: Date, rule: RecurrenceRule): Date {
    const next = new Date(date);

    switch (rule.frequency) {
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + 1);
        break;
    }

    return next;
  }
}
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