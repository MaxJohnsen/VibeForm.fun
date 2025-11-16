import { z } from 'zod';

// Email validation schema
export const emailSchema = z
  .string()
  .trim()
  .email('Please enter a valid email address')
  .max(255, 'Email must be less than 255 characters');

// Phone validation schema (international E.164 format)
export const phoneSchema = z
  .string()
  .trim()
  .regex(
    /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/,
    'Please enter a valid phone number'
  );

// Date validation schema
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter a valid date in YYYY-MM-DD format');

// Validation functions
export const validateEmail = (value: string): boolean => {
  try {
    emailSchema.parse(value);
    return true;
  } catch {
    return false;
  }
};

export const validatePhone = (value: string): boolean => {
  try {
    phoneSchema.parse(value);
    return true;
  } catch {
    return false;
  }
};

export const validateDate = (value: string): boolean => {
  try {
    dateSchema.parse(value);
    return true;
  } catch {
    return false;
  }
};

// Rating validation
export const validateRating = (
  value: number,
  min: number = 1,
  max: number = 10
): boolean => {
  return value >= min && value <= max && Number.isInteger(value);
};
