export interface EventLocation {
  address?: string;
  latitude?: number;
  longitude?: number;
  name?: string;
}

export interface EventDate {
  mode: 'exact' | 'timeOfMonth';
  // For exact date mode
  start?: Date;
  end?: Date;
  // For time of month mode
  weekPosition?: 'first' | 'second' | 'third' | 'fourth';
  weekdays?: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
}

export interface RecurrenceRule {
  frequency: 'monthly' | 'yearly';
  month?: number; // 1-12, for yearly recurrence when no exact date
  count?: number; // Total occurrences
  until?: Date; // End date
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