import { z } from '../zod';

export const CreateSampleSchema = z.object({
  name: z.string().min(1),
});

export type CreateSampleRequest = z.infer<typeof CreateSampleSchema>;

export const CreateSampleResponseSchema = z.object({
  id: z.uuid({ version: 'v7' }),
  name: z.string().min(1),
  createdAt: z.iso.datetime(),
});

export type CreateSampleResponse = z.infer<typeof CreateSampleResponseSchema>;
