import { Event, EventDateMode, RecurrenceFrequency } from '../types/Event';
import { DataService } from './DataService';

export class EventService {
  private dataService: DataService;

  constructor(dataService: DataService) {
    this.dataService = dataService;
  }

  async getEvents(): Promise<Event[]> {
    return this.dataService.getEvents();
  }

  async addEvent(event: Event): Promise<void> {
    return this.dataService.addEvent(event);
  }

  async updateEvent(event: Event): Promise<void> {
    return this.dataService.updateEvent(event);
  }

  async deleteEvent(id: string): Promise<void> {
    return this.dataService.deleteEvent(id);
  }

  generateEventInstances(event: Event, startDate: Date, endDate: Date): Array<{ date: Date; event: Event }> {
    const instances: Array<{ date: Date; event: Event }> = [];

    if (event.dateMode === 'exact') {
      // Handle exact date events
      if (!event.startDate) return instances;

      const eventStart = new Date(event.startDate);
      const eventEnd = event.endDate ? new Date(event.endDate) : eventStart;

      if (!event.recurrence.enabled) {
        // Single occurrence
        if (eventStart >= startDate && eventStart <= endDate) {
          instances.push({ date: eventStart, event });
        }
      } else {
        // Recurring exact date events
        let currentDate = new Date(eventStart);
        
        while (currentDate <= endDate) {
          if (currentDate >= startDate) {
            instances.push({ date: new Date(currentDate), event });
          }

          // Move to next occurrence
          if (event.recurrence.frequency === 'monthly') {
            currentDate.setMonth(currentDate.getMonth() + 1);
          } else if (event.recurrence.frequency === 'yearly') {
            currentDate.setFullYear(currentDate.getFullYear() + 1);
          }

          // Check end conditions
          if (event.recurrence.endType === 'count' && 
              instances.length >= (event.recurrence.count || 1)) {
            break;
          }
          if (event.recurrence.endType === 'date' && 
              event.recurrence.endDate && 
              currentDate > new Date(event.recurrence.endDate)) {
            break;
          }
        }
      }
    } else if (event.dateMode === 'timeOfMonth') {
      // Handle time of month events
      if (!event.timeOfMonth?.weekPosition || !event.timeOfMonth?.weekdays?.length) {
        return instances;
      }

      if (!event.recurrence.enabled) {
        // Single occurrence - find the next matching date
        const matchingDate = this.findNextTimeOfMonthDate(
          startDate,
          event.timeOfMonth.weekPosition,
          event.timeOfMonth.weekdays
        );
        
        if (matchingDate && matchingDate <= endDate) {
          instances.push({ date: matchingDate, event });
        }
      } else {
        // Recurring time of month events
        let currentMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        
        while (currentMonth <= endDate) {
          // For yearly recurrence, only process the specified month
          if (event.recurrence.frequency === 'yearly' && 
              event.recurrence.month !== undefined &&
              currentMonth.getMonth() !== event.recurrence.month) {
            if (event.recurrence.frequency === 'monthly') {
              currentMonth.setMonth(currentMonth.getMonth() + 1);
            } else {
              currentMonth.setFullYear(currentMonth.getFullYear() + 1);
              currentMonth.setMonth(event.recurrence.month);
            }
            continue;
          }

          const matchingDate = this.findTimeOfMonthDateInMonth(
            currentMonth,
            event.timeOfMonth.weekPosition,
            event.timeOfMonth.weekdays
          );

          if (matchingDate && matchingDate >= startDate && matchingDate <= endDate) {
            instances.push({ date: matchingDate, event });
          }

          // Move to next occurrence
          if (event.recurrence.frequency === 'monthly') {
            currentMonth.setMonth(currentMonth.getMonth() + 1);
          } else if (event.recurrence.frequency === 'yearly') {
            currentMonth.setFullYear(currentMonth.getFullYear() + 1);
          }

          // Check end conditions
          if (event.recurrence.endType === 'count' && 
              instances.length >= (event.recurrence.count || 1)) {
            break;
          }
          if (event.recurrence.endType === 'date' && 
              event.recurrence.endDate && 
              currentMonth > new Date(event.recurrence.endDate)) {
            break;
          }
        }
      }
    }

    return instances;
  }

  private findNextTimeOfMonthDate(
    fromDate: Date,
    weekPosition: number,
    weekdays: number[]
  ): Date | null {
    const startMonth = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
    return this.findTimeOfMonthDateInMonth(startMonth, weekPosition, weekdays);
  }

  private findTimeOfMonthDateInMonth(
    monthStart: Date,
    weekPosition: number,
    weekdays: number[]
  ): Date | null {
    const year = monthStart.getFullYear();
    const month = monthStart.getMonth();
    
    // Find the first occurrence of each weekday in the month
    for (const weekday of weekdays) {
      const date = this.getNthWeekdayOfMonth(year, month, weekPosition, weekday);
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
export const eventService = new EventService(new (await import('./DataService')).DataService());