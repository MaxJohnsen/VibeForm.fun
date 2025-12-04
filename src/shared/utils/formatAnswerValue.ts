import { format, parseISO } from 'date-fns';

/**
 * Single source of truth for formatting answer values (frontend)
 * Used by templateEngine and analytics components
 */
export const formatAnswerValue = (
  value: any,
  type?: string,
  settings?: Record<string, any>,
  options?: { truncate?: boolean }
): string => {
  // Handle null/undefined
  if (value === null || value === undefined) return '—';
  
  // Handle skipped answers
  if (typeof value === 'object' && value._skipped) return '(skipped)';
  
  // Type-specific formatting
  switch (type) {
    case 'yes_no':
      // Use custom labels from settings if provided
      const yesLabel = settings?.yesLabel || 'Yes';
      const noLabel = settings?.noLabel || 'No';
      return value === true ? yesLabel : noLabel;
      
    case 'rating':
      // Use actual scale from settings
      const max = settings?.max || 5;
      return `${value}/${max}`;
      
    case 'multiple_choice':
      // Handle array (multi-select) or single value
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return String(value);
      
    case 'date':
      // Format date according to locale
      if (typeof value === 'string') {
        try {
          const date = parseISO(value.split('T')[0]);
          return format(date, 'PP');
        } catch {
          return value.split('T')[0];
        }
      }
      return String(value);
      
    case 'long_text':
      // Truncate for display if requested
      const text = String(value);
      if (options?.truncate && text.length > 80) {
        return text.substring(0, 77) + '...';
      }
      return text;
      
    default:
      // Handle legacy boolean (fallback)
      if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
      }
      
      // Handle arrays
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      
      // Handle objects
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      
      return String(value);
  }
};
