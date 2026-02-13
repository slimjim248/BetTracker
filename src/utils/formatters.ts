import { format } from 'date-fns';

/**
 * Format date to readable string
 */
export function formatDate(date: Date, formatString = 'MMM dd, yyyy'): string {
  return format(date, formatString);
}

/**
 * Format date for input field (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Parse date from input field
 */
export function parseDateFromInput(dateString: string): Date {
  return new Date(dateString);
}
