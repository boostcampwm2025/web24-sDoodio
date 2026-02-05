import { z } from '../zod';

export const ErrorResponseSchema = z.object({
  statusCode: z.number().int(),
  message: z.string(),
  path: z.string(),
  timestamp: z.string(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
