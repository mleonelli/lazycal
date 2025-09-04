import type { Translation } from './types';
import { en } from './en';
import { it } from './it';

export type { Translation } from './types';

export const translations: Record<string, Translation> = {
  en,
  it,
};