export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORMS_HOME: '/home',
  CREATE_FORM: '/forms/new',
  BUILDER: '/builder/:formId',
  RESPONDENT: '/f/:formId',
  getBuilderRoute: (formId: string) => `/builder/${formId}`,
  getRespondentRoute: (formId: string) => `/f/${formId}`,
} as const;
