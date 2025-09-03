import { Translation } from './types';
import { en } from './en';
import { it } from './it';

export { Translation } from './types';

export const translations: Record<string, Translation> = {
  en,
  it,
};