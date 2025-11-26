/**
 * Format answer values based on question type and settings
 */
export const formatAnswerValue = (
  value: any,
  type: string,
  settings?: Record<string, any>
): string => {
  // Handle null/undefined
  if (value === null || value === undefined) return '—';
  
  // Handle skipped answers
  if (typeof value === 'object' && value._skipped) return '(skipped)';
  
  switch (type) {
    case 'yes_no':
      // Use custom labels from settings if provided
      const yesLabel = settings?.yesLabel || 'Yes';
      const noLabel = settings?.noLabel || 'No';
      return value === true ? yesLabel : noLabel;
      
    case 'rating':
      // Use actual scale from settings
      const max = settings?.max || 10;
      return `${value}/${max}`;
      
    case 'multiple_choice':
      // Handle array (multi-select) or single value
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return String(value);
      
    case 'date':
      // Always display ISO format (YYYY-MM-DD) - stored as ISO in DB
      if (typeof value === 'string') {
        // Extract just the date portion if it's a full ISO string
        return value.split('T')[0];
      }
      return String(value);
      
    case 'long_text':
      // Truncate long text with ellipsis
      const text = String(value);
      return text.length > 80 ? text.substring(0, 77) + '...' : text;
      
    case 'respondent_name':
    case 'short_text':
    case 'email':
    case 'phone':
    default:
      return String(value);
  }
};
