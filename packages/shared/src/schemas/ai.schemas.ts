import { z } from '../zod';

export const DodoChatRequestSchema = z.object({
  message: z.string().min(1),
});
export type DodoChatRequest = z.infer<typeof DodoChatRequestSchema>;

export const DodoChatResponseSchema = z.object({
  reply: z.string().min(1),
});
export type DodoChatResponse = z.infer<typeof DodoChatResponseSchema>;
