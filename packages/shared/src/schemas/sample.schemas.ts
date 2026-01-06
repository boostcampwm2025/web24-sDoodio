import { z } from 'zod';

export const CreateSampleSchema = z.object({
  name: z.string().min(1),
});

export type CreateSampleRequest = z.infer<typeof CreateSampleSchema>;
