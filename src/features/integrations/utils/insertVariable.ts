/**
 * Insert a variable at the cursor position in an input/textarea element
 */
export const insertVariableAtCursor = (
  element: HTMLInputElement | HTMLTextAreaElement,
  currentValue: string,
  variable: string
): { newValue: string; cursorPosition: number } => {
  const start = element.selectionStart || 0;
  const end = element.selectionEnd || 0;
  
  const newValue = 
    currentValue.substring(0, start) + 
    variable + 
    currentValue.substring(end);
  
  const cursorPosition = start + variable.length;
  
  return { newValue, cursorPosition };
};

/**
 * Focus element and set cursor position after a short delay
 */
export const focusAndSetCursor = (
  element: HTMLInputElement | HTMLTextAreaElement,
  position: number
) => {
  setTimeout(() => {
    element.focus();
    element.setSelectionRange(position, position);
  }, 0);
};
