import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

// Base schemas
const uuidSchema = z.string().uuid();
const slugSchema = z.string().regex(/^[a-z0-9-]+$/).min(1).max(100);
const formIdSchema = z.union([uuidSchema, slugSchema]);

// Request schemas for public edge functions
export const startResponseSchema = z.object({
  formId: formIdSchema,
  turnstileToken: z.string().optional(),
});

export const submitAnswerSchema = z.object({
  sessionToken: uuidSchema,
  questionId: uuidSchema,
  answerValue: z.any().optional(),
});

export const navigateBackSchema = z.object({
  sessionToken: uuidSchema,
  currentQuestionId: uuidSchema,
});

export const resumeResponseSchema = z.object({
  sessionToken: uuidSchema,
});

// Type exports
export type StartResponseInput = z.infer<typeof startResponseSchema>;
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
export type NavigateBackInput = z.infer<typeof navigateBackSchema>;
export type ResumeResponseInput = z.infer<typeof resumeResponseSchema>;

/**
 * Validate request data against a Zod schema.
 * Returns typed data on success, or an error message on failure.
 */
export const validateRequest = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } => {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errorMessage = result.error.issues
    .map((i) => `${i.path.join('.')}: ${i.message}`)
    .join(', ');
  return { success: false, error: errorMessage };
};
