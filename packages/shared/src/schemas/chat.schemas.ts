import { DODO_ACTION_VALUES } from '../types';
import { z } from '../zod';

export const DodoChatRequestSchema = z.object({
  message: z.string().min(1),
});
export type DodoChatRequest = z.infer<typeof DodoChatRequestSchema>;

export const DodoChatResponseSchema = z.object({
  reply: z.string().min(1),
  action: z.enum(DODO_ACTION_VALUES),
});
export type DodoChatResponse = z.infer<typeof DodoChatResponseSchema>;

export const DodoChatMessageSchema = z.object({
  id: z.uuid({ version: 'v7' }),
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
});

export const DodoChatHistoryRequestSchema = z.object({
  cursor: z.uuid({ version: 'v7' }).optional(),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export type DodoChatHistoryRequest = z.infer<typeof DodoChatHistoryRequestSchema>;

export const DodoChatHistoryResponseSchema = z.object({
  messages: z.array(DodoChatMessageSchema),
  hasMore: z.boolean(),
  nextCursor: z.uuid({ version: 'v7' }).nullable(),
});
export type DodoChatHistoryResponse = z.infer<typeof DodoChatHistoryResponseSchema>;
