export const ROUTES = {
  HOME: '/home',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORMS_NEW: '/forms/new',
  BUILDER: (formId?: string) => formId ? `/builder/${formId}` : '/builder/:formId',
} as const;
