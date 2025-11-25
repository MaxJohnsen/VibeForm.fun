import { z } from 'zod';

// Reserved slugs that cannot be used
export const RESERVED_SLUGS = [
  'login', 'signup', 'logout', 'admin', 'api', 'forms', 
  'builder', 'responses', 'settings', 'home', 'new', 
  'create', 'edit', 'delete', 'f', 'app', 'dashboard',
  'help', 'about', 'contact', 'privacy', 'terms', 'support'
];

// Slug validation schema
export const slugSchema = z
  .string()
  .trim()
  .min(3, 'Slug must be at least 3 characters')
  .max(50, 'Slug must be less than 50 characters')
  .regex(
    /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/,
    'Slug can only contain lowercase letters, numbers, and hyphens. Must start and end with a letter or number.'
  )
  .refine(
    (slug) => !RESERVED_SLUGS.includes(slug),
    (slug) => ({ message: `"${slug}" is a reserved word and cannot be used` })
  );

// Validation function
export const validateSlug = (slug: string): { valid: boolean; error?: string } => {
  try {
    slugSchema.parse(slug);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0].message };
    }
    return { valid: false, error: 'Invalid slug format' };
  }
};

// Format slug helper (converts to valid format)
export const formatSlug = (input: string): string => {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-') // Replace invalid chars with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .slice(0, 50); // Enforce max length
};
