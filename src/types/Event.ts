export interface EventLocation {
  address?: string;
  latitude?: number;
  longitude?: number;
  name?: string;
}

export interface EventDate {
  start: Date;
  end?: Date;
  allDay?: boolean;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number; // Every N occurrences
  count?: number; // Total occurrences
  until?: Date; // End date
  byWeekday?: number[]; // 0-6 (Sun-Sat)
  byMonthDay?: number[]; // 1-31
  byMonth?: number[]; // 1-12
  bySetPos?: number[]; // For "first Monday", "last Friday", etc.
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  url?: string;
  location?: EventLocation;
  date: EventDate;
  recurrence?: RecurrenceRule;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventInstance {
  event: Event;
  instanceDate: Date;
  instanceEnd?: Date;
}