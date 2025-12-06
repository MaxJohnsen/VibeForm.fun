export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const slugPattern = /^[a-z0-9][a-z0-9-]{0,98}[a-z0-9]$/i;

export function isValidFormId(formId: string): boolean {
  return uuidPattern.test(formId) || slugPattern.test(formId);
}

export function isUUID(formId: string): boolean {
  return uuidPattern.test(formId);
}
